// ─── THEMED COLLECTIONS ───────────────────────────────────────────────
// Single source of truth for the dynamic /collection/[slug] route.
//
// Each entry renders an editorial collection cover: a baked-title banner
// masthead + thematic eyebrow + subtitle + storytelling + an auto-populated
// product rail. The rail matches live WooCommerce products whose
// name/slug/sku/category/attribute text contains any `keywords` token.
//
// Copy (eyebrow · subtitle · story) wired 2026-06-23 from brand/
// storytelling-colecciones-2026-06-23.md (the "somos uno" / cosmopolitan layer).
// The 10 are faces of one truth — different hands, different lands, the same sky.
// India & Maya are kept and CREDITED as honored, curated lineages (not forged here).

export interface ThemedCollection {
  /** URL slug → /collection/<slug> and banner filename in /img/banners/collection/ */
  slug: string;
  /** Big display name (drives <h1>, SEO, breadcrumbs) */
  title: string;
  /** Thematic eyebrow above the copy (replaces the old "COLLECTION · X" label) */
  eyebrow: string;
  /** Three-beat axis under the title (e.g. "Desert · Sky · Meteorite") */
  subtitle?: string;
  /** One-sentence lede (kept short; used as fallback if no story) */
  intro: string;
  /** Full editorial storytelling (60–110 words) */
  story?: string;
  /** SEO meta description */
  description: string;
  /** Lowercase tokens matched against product name/slug/sku/categories/attributes */
  keywords: string[];
  /** True if the banner image already has the title burned in (skip CSS overlay) */
  bakedTitle?: boolean;
}

export const collections: ThemedCollection[] = [
  {
    slug: 'origin',
    title: 'Origin',
    eyebrow: 'Where the language begins',
    subtitle: 'Forge · Form · First light',
    intro: 'The core line — the forms the studio returns to. Where the language of Wenu Mapu begins.',
    story: "Every people that ever adorned the body was reaching for the same thing — to mark what is sacred, to look up. Origin is where Wenu Mapu speaks that universal language in its mother tongue: the ritual ring, the ear weight, the forms Ocin shapes at the forge in titanium, silver and bronze, along the Mapuche path of platería. Slow metalwork as ceremony, not decoration. This is the core line, the ground the others rise from. Different hands, different lands — the same sky. Here, it begins in Mapudungun.",
    description: 'Origin — the core line of Wenu Mapu. Hand-forged ritual body jewelry in titanium, silver and bronze.',
    keywords: ['origin', 'origen'],
    bakedTitle: true,
  },
  {
    slug: 'atacama',
    title: 'Atacama',
    eyebrow: 'Stone that fell from the sky',
    subtitle: 'Desert · Sky · Meteorite',
    intro: 'Pieces carrying meteorite from the Atacama — fragments of sky pressed into the body.',
    story: "Four and a half billion years before the desert, this was sky. Atacama sets genuine Vaca Muerta mesosiderite — a rare stony-iron meteorite fallen into Chile's driest land — into silver, each ring numbered, each existing only once. The rings are crafted by the artisan Jimmy, a Wenu Mapu collaborator whose hands work matter older than the Earth. The same vault every people has watched once held this stone. To wear it is to carry a fragment of that shared sky against the skin — proof that what is above and what is worn on the body were never two separate things.",
    description: 'Atacama — ritual rings and amulets set with Atacama meteorite. One-of-a-kind, numbered.',
    keywords: ['atacama', 'meteor', 'vacamuerta', 'meteorite'],
    bakedTitle: true,
  },
  {
    slug: 'araucania',
    title: 'Araucanía',
    eyebrow: 'Rooted in the Wallmapu',
    subtitle: 'Forest · Volcano · Pewen',
    intro: 'Rooted in the southern forest — the pewen, the volcanic line, the land that names the brand.',
    story: "Every path toward the sky begins in some particular earth. For Wenu Mapu that ground is the Wallmapu — the Mapuche territory of southern Chile, where Ocin's craft took root before it crossed the world. Araucanía draws from it: the pewen over the volcanic line, the dark soil, the long patience of the araucaria that outlives generations. This is the home-land of the whole story, named and honored as itself — not the costume of a culture, but the founder's own roots, the particular tierra from which the universal is spoken.",
    description: 'Araucanía — Mapuche-rooted ritual jewelry drawn from the southern forest and volcanic line.',
    keywords: ['araucania', 'araucan', 'pewen', 'wallmapu', 'mapu'],
    bakedTitle: true,
  },
  {
    slug: 'solar',
    title: 'Solar',
    eyebrow: 'Antü — the sun',
    subtitle: 'Sun · Gold · Day',
    intro: 'Antü — the sun. Pieces that hold light, warmth and the daytime sky.',
    story: "One sun rises over every people. The Mapuche call it antü — the father of heat, life and wisdom, the eight-point star at the heart of the kultrún — yet Egypt, the Andes and Bali all turned the same way at dawn. Solar holds that shared warmth: radiant geometry, warm metals, pieces made to catch the day. It is the line worn as the ceremony turns toward first light — We Tripantu, the sun at the year's beginning. Light you don't reflect so much as carry. A small sun held against the body.",
    description: 'Solar — sun-inspired hangers, pendants and ear pieces. Warm metals and radiant geometry.',
    keywords: ['solar', 'sun', 'antu', 'antü'],
    bakedTitle: true,
  },
  {
    slug: 'neo',
    title: 'Neo',
    eyebrow: 'The forward edge',
    subtitle: 'New · Graphic · Sharper',
    intro: 'The newest silhouettes — sharper, more graphic. A campaign lane for the pieces pushing forward.',
    story: "The ancestral is the avant-garde. Neo carries the oldest impulse — to adorn the body, to look up — into sharper, cleaner, more graphic form. Nothing here chases a trend; it brings one cosmology forward into the present. These are pieces for the contemporary ritual: the dance floor as ceremonial ground, trance as a modern doorway to the same place every ancestor walked toward. Old root, new edge. Proof that being truly rooted is the most modern thing a piece can be.",
    description: 'Neo — the newest, most graphic silhouettes from Wenu Mapu. Contemporary ritual body jewelry.',
    keywords: ['neo'],
    bakedTitle: true,
  },
  {
    slug: 'ornamental',
    title: 'Ornamental',
    eyebrow: 'Where detail is the rite',
    subtitle: 'Filigree · Greca · Worked surface',
    intro: 'Filigree, greca and worked surface — adornment where the detail is the ritual.',
    story: "Wherever people have worked metal by hand, the surface fills with meaning — the Mapuche greca, the filigree of a dozen traditions, a line repeated until it becomes a kind of prayer. Ornamental is the line where the detail is the ritual: dense, worked surface that rewards the slow eye and the close look. This is patience made visible, the opposite of mass-made smoothness. Adornment meant to be read, not just seen — the shared human habit of writing the sacred into what we wear.",
    description: 'Ornamental — filigree and greca-worked ritual jewelry. Detail-dense pieces in silver and bronze.',
    keywords: ['ornament', 'greca', 'filig', 'wood'],
    bakedTitle: true,
  },
  {
    slug: 'organic',
    title: 'Organic',
    eyebrow: 'Grown, not cast',
    subtitle: 'Wood · Bone · Horn · Seed',
    intro: 'Wood, bone, horn and seed — pieces grown from living material.',
    story: "Before metal, the living material. Organic gathers wood, bone, horn and seed — things that were once alive and still remember it. Walnut warmed by the body, a seed worn smooth, weight drawn from the earth instead of the forge. In stretching traditions across every continent, natural matter is the oldest way to mark the body's passage. These pieces grow heavier and more personal with wear, taking the shape of whoever carries them. Matter that ages with you — küyen-slow and cyclical, the way the moon returns for everyone.",
    description: 'Organic — ritual body jewelry in wood, bone, horn and seed. Natural-material plugs, tunnels and weights.',
    keywords: ['organic', 'organ', 'wood', 'bone', 'horn', 'seed'],
    bakedTitle: true,
  },
  {
    slug: 'fossil',
    title: 'Fossil',
    eyebrow: 'Deep time worn close',
    subtitle: 'Amber · Ammonite · Stone',
    intro: 'Amber, ammonite and stone that remembers — deep time worn close.',
    story: "Some matter remembers longer than any people. Fossil sets amber that trapped a forest's afternoon, ammonite coiled before the dinosaurs, stone that holds the press of deep time. To wear it is to carry the planet's own memory against the pulse — older than every culture that ever looked up, the ground all of them stood on. Atacama brought the cosmos to the body; Fossil brings the Earth's ancient archive. One sky above, one deep time below, and the body held between them.",
    description: 'Fossil — ritual jewelry set with amber, ammonite and fossil stone. Deep-time materials worn on the body.',
    keywords: ['fossil', 'fosil', 'amber', 'ammon', 'stone'],
    bakedTitle: true,
  },
  {
    slug: 'india',
    title: 'India',
    eyebrow: 'Ornament as devotion',
    subtitle: 'Ornament · Ceremony · Devotion',
    intro: 'Dense, ceremonial ornamentation — heavy adornment for the ritual body.',
    story: "In the Indian subcontinent, adornment has long been devotion — the body dressed for the sacred, ornament worn as prayer made visible. India honors that lineage: dense, ceremonial pieces curated for the way they carry the same impulse Wenu Mapu speaks in Mapudungun. They are gathered and selected with respect, not forged in our studio, and named for the tradition they come from rather than dressed up as our own. One of the world's oldest ornament languages — a different hand, a different land, reaching toward the same sky.",
    description: 'India — densely ornamented ceremonial ritual jewelry. Curated and credited, not forged in studio.',
    keywords: ['india'],
    bakedTitle: true,
  },
  {
    slug: 'maya',
    title: 'Maya',
    eyebrow: 'The sky, written',
    subtitle: 'Glyph · Geometry · Cosmos',
    intro: 'Cosmic geometry and glyph-like form — symbol carried as adornment.',
    story: "The Maya read the sky with a precision few civilizations have matched, and wrote what they saw into glyph and geometry carried on the body. Maya honors that astronomy: symbol worn as adornment, cosmic geometry curated for its language rather than forged in our studio. They named the same stars the Mapuche call wanglen — another people, another tongue, the one vault overhead. We carry these pieces in homage, crediting where they come from. The urge to make the cosmos wearable is older and wider than any single culture.",
    description: 'Maya — glyph-like, cosmic-geometry ritual jewelry. Curated and credited in homage to Maya astronomy.',
    keywords: ['maya'],
    bakedTitle: true,
  },
  {
    slug: 'one-of-a-kind',
    title: 'One of a Kind',
    eyebrow: 'The singular',
    subtitle: 'Unique · Unrepeatable · Edition of one',
    intro: 'Pieces that exist only once — custom and hand-made, each its own edition of one.',
    story: "Some pieces are not a line but a single breath. One of a Kind gathers the unrepeatable: Nico's wire-wrapped amulets, the Alai Wakan hangers, Galo's cast bronze sculptures, the custom earrings shaped for no one twice. Each is an edition of one — made by hand, never reissued. Where the other collections speak a language, these speak a single word, said once. To wear one is to hold something the world will not make again.",
    description: 'One of a Kind — unique, hand-made, one-off ritual pieces. Each exists only once.',
    // Membership-driven (collection-membership.json: Línea "Custom"); keywords kept as fallback only.
    keywords: ['one-of-a-kind'],
    bakedTitle: false,
  },
];
