#!/bin/bash
# ~/kodex-* Cleanup · TIER 1 + TIER 2 · SEGURO
# Preparado por chat-sentinel · 2026-08-30
# Ver detalle en kodex-system/KODEX_DIRS_ACTION_PLAN.md
#
# EJECUTÁ SOLO CON OK EXPLÍCITO DE OCÍN.
# Este script no se corre solo. No hay hook, no hay auto-trigger.
# Genera archives antes de rm -rf. Idempotente (skip si ya no existe).

set -euo pipefail

ARCHIVE_DIR="$HOME/kodex-archives/2026-08-30-cleanup"
mkdir -p "$ARCHIVE_DIR"
echo "Archive dir: $ARCHIVE_DIR"

echo ""
echo "=== TIER 1 · delete safe ==="

if [ -d ~/kodex-latido-backup ]; then
  echo "  removing ~/kodex-latido-backup (empty)..."
  rm -rf ~/kodex-latido-backup
else
  echo "  ~/kodex-latido-backup already gone, skip"
fi

if [ -d ~/kodex-cierre-qa ]; then
  echo "  archiving ~/kodex-cierre-qa..."
  tar czf "$ARCHIVE_DIR/kodex-cierre-qa.tar.gz" -C ~ kodex-cierre-qa
  echo "    archive: $(du -sh "$ARCHIVE_DIR/kodex-cierre-qa.tar.gz" | awk '{print $1}')"
  rm -rf ~/kodex-cierre-qa
else
  echo "  ~/kodex-cierre-qa already gone, skip"
fi

echo ""
echo "=== TIER 2 · archive+delete ==="

for d in kodex-apartado-2026-08-28 kodex-dist-deploy kodex-pr101-worktree kodex-work-backup; do
  if [ ! -d ~/"$d" ]; then
    echo "  ~/$d already gone, skip"
    continue
  fi
  echo "  archiving ~/$d..."
  tar czf "$ARCHIVE_DIR/${d}.tar.gz" -C ~ "$d"
  archive_size=$(du -sh "$ARCHIVE_DIR/${d}.tar.gz" | awk '{print $1}')
  original_size=$(du -sh ~/"$d" | awk '{print $1}')
  echo "    original: $original_size · archived: $archive_size"
  rm -rf ~/"$d"
done

echo ""
echo "=== DONE ==="
echo "Archive location: $ARCHIVE_DIR"
echo "Archives created:"
du -sh "$ARCHIVE_DIR"/* 2>/dev/null || echo "  (no archives, all skipped)"
echo ""
echo "Disk state after:"
df -h ~ | tail -1
echo ""
echo "NEXT: revisar TIER 3 y TIER 4 en kodex-system/KODEX_DIRS_ACTION_PLAN.md"
