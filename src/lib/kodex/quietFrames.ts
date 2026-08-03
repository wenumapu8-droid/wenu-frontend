import { assetUrl } from "./volumenes";

export type QuietFramePreset = {
  id: string;
  variant: "image" | "symbol" | "material" | "field-note" | "threshold" | "constellation";
  image?: string;
  alt?: string;
  sigil?: string;
  sigilStyle?: "block" | "ritual" | "signal" | "outline";
  archiveId: string;
  label: string;
  status: string;
  node: string;
  origin: string;
  caption: string;
  accent: "none" | "cyan" | "violet" | "bronze";
  geometry: "steps" | "brackets" | "axis" | "bars" | "open-frame";
  align: "left" | "center" | "right";
  ratio: "1:1" | "4:5" | "3:4" | "16:9" | "2:3";
  href: string;
  command: string;
};

const art = (src: string) => assetUrl(src);

export const quietFrames = {
  "threshold-prologue": {
    id: "threshold-prologue",
    variant: "symbol",
    sigil: "KDX",
    sigilStyle: "ritual",
    archiveId: "KDX://QF-000",
    label: "THRESHOLD SHEET / BEFORE OBSERVATION",
    status: "STATUS / BREATH",
    node: "NODE / 00-01",
    origin: "ORIGIN / KODEX",
    caption: "THE ARCHIVE DOES NOT STORE. IT REMEMBERS.",
    accent: "violet",
    geometry: "axis",
    align: "center",
    ratio: "1:1",
    href: "#prologue",
    command: "CONTINUE",
  },
  "archive-machine": {
    id: "archive-machine",
    variant: "image",
    image: art("art/patrones/cover.webp"),
    alt: "Ocin archive fragment used as a quiet interlude before MACHINE",
    sigilStyle: "signal",
    archiveId: "KDX://QF-034",
    label: "ARCHIVE FRAGMENT / BEFORE MACHINE",
    status: "STATUS / PARTIAL",
    node: "NODE / 03-04",
    origin: "ORIGIN / R2 ARCHIVE",
    caption: "A SIGNAL. A SYSTEM. A CHOICE.",
    accent: "cyan",
    geometry: "steps",
    align: "left",
    ratio: "1:1",
    href: "/kodex/folio/iv/",
    command: "ENTER MACHINE",
  },
  "cosmology-return": {
    id: "cosmology-return",
    variant: "material",
    image: art("art/wenu-mapu/cover.webp"),
    alt: "Wenu Mapu archive plate used as a quiet interlude before RETURN",
    sigilStyle: "outline",
    archiveId: "KDX://QF-056",
    label: "TERRAIN MEMORY / BEFORE RETURN",
    status: "STATUS / SEALED",
    node: "NODE / 05-06",
    origin: "ORIGIN / R2 ARCHIVE",
    caption: "THE SIGNAL RETURNS. THE PATTERN REMAINS.",
    accent: "bronze",
    geometry: "open-frame",
    align: "right",
    ratio: "4:5",
    href: "/kodex/folio/vi/",
    command: "RETURN",
  },
} satisfies Record<string, QuietFramePreset>;

export type QuietFrameId = keyof typeof quietFrames;
