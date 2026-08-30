#!/usr/bin/env python3
"""KODEX−∞ KDX.ORACLE local voice authoring tool.

Authoring-only. This script is deliberately outside the visitor runtime and CI.
It creates audition masters + provenance manifests; it never promotes files into
public/audio automatically.

Requirements (local authoring workstation):
  python >= 3.10
  pip install "kokoro>=0.9.4" soundfile
  espeak-ng
  ffmpeg (optional, for OGG/Opus audition export)

The Kokoro model may download weights on first use. Do not commit model weights.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import shutil
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONFIG_PATH = ROOT / "data/kodex/oracle-voice-authoring.v0.1.json"


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def load_config() -> dict:
    return json.loads(CONFIG_PATH.read_text(encoding="utf-8"))


def require_authoring_deps():
    try:
        from kokoro import KPipeline  # type: ignore
        import soundfile as sf  # type: ignore
    except ImportError as exc:
        print(
            "KDX.ORACLE voice authoring dependencies are missing.\n"
            "Install locally with: pip install 'kokoro>=0.9.4' soundfile\n"
            "Also install espeak-ng. This dependency is AUTHORING_ONLY and must "
            "not be added to the visitor runtime merely to make this script pass.",
            file=sys.stderr,
        )
        raise SystemExit(2) from exc
    return KPipeline, sf


def select_cues(config: dict, cue_ids: list[str] | None) -> list[dict]:
    cues = config["cues"]
    if not cue_ids:
        return cues
    wanted = set(cue_ids)
    selected = [cue for cue in cues if cue["id"] in wanted]
    missing = sorted(wanted - {cue["id"] for cue in selected})
    if missing:
        raise SystemExit(f"Unknown cue id(s): {', '.join(missing)}")
    return selected


def encode_ogg(wav_path: Path, ogg_path: Path) -> bool:
    ffmpeg = shutil.which("ffmpeg")
    if not ffmpeg:
        return False
    subprocess.run(
        [
            ffmpeg,
            "-hide_banner",
            "-loglevel",
            "error",
            "-y",
            "-i",
            str(wav_path),
            "-c:a",
            "libopus",
            "-b:a",
            "48k",
            "-ac",
            "1",
            str(ogg_path),
        ],
        check=True,
    )
    return True


def write_manifest(
    *,
    config: dict,
    cue: dict,
    voice: str,
    speed: float,
    wav_path: Path,
    ogg_path: Path | None,
    sample_rate: int,
) -> Path:
    files = {
        "wav": {
            "path": str(wav_path.relative_to(ROOT)),
            "bytes": wav_path.stat().st_size,
            "sha256": sha256_file(wav_path),
        }
    }
    if ogg_path and ogg_path.exists():
        files["ogg"] = {
            "path": str(ogg_path.relative_to(ROOT)),
            "bytes": ogg_path.stat().st_size,
            "sha256": sha256_file(ogg_path),
        }

    manifest = {
        "schema": "KDX.ORACLE.VOICE_ASSET_PROVENANCE.v0.1",
        "status": "AUDITION_ONLY_NOT_CANON",
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "targetIdentity": config["identity"]["targetId"],
        "sourceCueId": cue["id"],
        "scene": cue["scene"],
        "event": cue["event"],
        "text": cue["text"],
        "modelFamily": config["model"]["family"],
        "library": config["model"]["library"],
        "weightsLicense": config["model"]["weightsLicense"],
        "voice": voice,
        "speed": speed,
        "sampleRate": sample_rate,
        "voiceCloning": False,
        "humanEdit": "NONE_AT_GENERATION",
        "promotionState": "NOT_PROMOTED_TO_RUNTIME",
        "files": files,
    }
    manifest_path = wav_path.with_suffix(".meta.json")
    manifest_path.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    return manifest_path


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--voice",
        action="append",
        dest="voices",
        help="Kokoro voice id. Repeat to author multiple voices. Defaults to manifest auditionVoices.",
    )
    parser.add_argument(
        "--cue",
        action="append",
        dest="cues",
        help="Cue id. Repeat to limit generation. Defaults to all authored cues.",
    )
    parser.add_argument("--speed", type=float, default=None)
    parser.add_argument(
        "--output-root",
        default=None,
        help="Override audition root. Production path is intentionally not the default.",
    )
    parser.add_argument(
        "--no-ogg",
        action="store_true",
        help="Skip optional ffmpeg OGG/Opus audition export.",
    )
    args = parser.parse_args()

    config = load_config()
    voices = args.voices or config["auditionVoices"]
    allowed = set(config["auditionVoices"])
    unknown = [voice for voice in voices if voice not in allowed]
    if unknown:
        raise SystemExit(
            "Voice id(s) are outside the governed audition set: " + ", ".join(unknown)
        )

    speed = args.speed if args.speed is not None else float(config["defaultSpeed"])
    if not 0.75 <= speed <= 1.10:
        raise SystemExit("Speed must stay in the bounded authoring range 0.75–1.10.")

    cues = select_cues(config, args.cues)
    output_root = ROOT / (args.output_root or config["outputPolicy"]["auditionRoot"])
    output_root.mkdir(parents=True, exist_ok=True)

    KPipeline, sf = require_authoring_deps()
    pipeline = KPipeline(lang_code="a")
    sample_rate = 24000

    generated: list[Path] = []
    for voice in voices:
        voice_dir = output_root / voice
        voice_dir.mkdir(parents=True, exist_ok=True)
        for cue in cues:
            chunks = list(pipeline(cue["text"], voice=voice, speed=speed))
            if not chunks:
                raise RuntimeError(f"Kokoro produced no audio for {cue['id']} / {voice}")

            audio_parts = [chunk[2] for chunk in chunks]
            try:
                import numpy as np

                audio = np.concatenate(audio_parts)
            except Exception as exc:
                raise RuntimeError(
                    f"Could not concatenate generated audio for {cue['id']} / {voice}"
                ) from exc

            stem = f"{cue['authoringStem']}__{voice}__s{speed:.2f}"
            wav_path = voice_dir / f"{stem}.wav"
            sf.write(wav_path, audio, sample_rate)

            ogg_path = None
            if not args.no_ogg:
                candidate = voice_dir / f"{stem}.ogg"
                if encode_ogg(wav_path, candidate):
                    ogg_path = candidate

            meta = write_manifest(
                config=config,
                cue=cue,
                voice=voice,
                speed=speed,
                wav_path=wav_path,
                ogg_path=ogg_path,
                sample_rate=sample_rate,
            )
            generated.extend([wav_path, meta])
            if ogg_path:
                generated.append(ogg_path)
            print(f"AUTHORED {cue['id']} / {voice} -> {wav_path.relative_to(ROOT)}")

    index = {
        "schema": "KDX.ORACLE.VOICE_AUDITION_INDEX.v0.1",
        "status": "AUDITION_ONLY_NOT_CANON",
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "voices": voices,
        "cueIds": [cue["id"] for cue in cues],
        "speed": speed,
        "files": [str(path.relative_to(ROOT)) for path in generated],
        "nextGate": "CREATOR_PERCEPTUAL_ACCEPTANCE_BEFORE_RUNTIME_PROMOTION",
    }
    index_path = output_root / "audition-index.json"
    index_path.write_text(json.dumps(index, indent=2) + "\n", encoding="utf-8")
    print(f"INDEX {index_path.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
