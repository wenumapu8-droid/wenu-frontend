import { mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const REPORT_PATH = path.join(ROOT, 'docs/brand-asset-library.md');
const LIMIT_PER_SOURCE = 900;
const IMAGE_EXT = /\.(avif|webp|png|jpe?g|gif|svg)$/i;
const DOC_EXT = /\.(md|pdf)$/i;

const SOURCES = [
  {
    id: 'website-public',
    label: 'Website public assets',
    root: path.join(ROOT, 'public/img'),
    maxDepth: 5,
  },
  {
    id: 'obsidian-brand',
    label: 'Obsidian brand system',
    root: '/Users/user1/Obsidian/WenuAgent/brand',
    maxDepth: 7,
  },
  {
    id: 'obsidian-chatgpt',
    label: 'Obsidian ChatGPT image intake',
    root: '/Users/user1/Obsidian/WenuAgent/40-ChatGPT/imagenes',
    maxDepth: 4,
  },
  {
    id: 'lacie-marketing',
    label: 'LaCie marketing',
    root: '/Volumes/LaCie/Wenu mapu/WenuMapu/Marketing',
    maxDepth: 4,
  },
  {
    id: 'lacie-design',
    label: 'LaCie design archive',
    root: '/Volumes/LaCie/Wenu mapu/WenuMapu/🎨 _DISEÑO',
    maxDepth: 4,
  },
  {
    id: 'lacie-woocommerce-ready',
    label: 'LaCie WooCommerce-ready source',
    root: '/Volumes/LaCie/Wenu mapu/WenuMapu/📦 _WOOCOMMERCE_READY',
    maxDepth: 4,
  },
  {
    id: 'lacie-inventory-photos',
    label: 'LaCie inventory photos',
    root: '/Volumes/LaCie/Wenu mapu/WenuMapu/📸 _INVENTARIO_FOTOS',
    maxDepth: 4,
  },
];

const ROLE_DEFINITIONS = {
  'identity-logo': 'Logo, marca, favicon o sistema de identidad. Usar solo si esta validado como version oficial.',
  'web-hero-banner': 'Imagen ancha para hero, banner, Open Graph o cabecera de coleccion.',
  'web-background-texture': 'Textura, patron o fondo sutil para secciones web.',
  'web-graphic-ui': 'Icono, divisor, simbolo o grafica pequena para interfaz.',
  'web-product': 'Foto/render de producto que puede alimentar PDP, catalogo o laminas.',
  'product-master': 'Fuente maestra o fotografia base de producto; revisar antes de copiar a public/img.',
  'social-template': 'Material para Instagram, stories, posts o plantillas de redes.',
  'marketing-collateral': 'Banner, diptico, portfolio, QR o pieza impresa/digital de campana.',
  'qr-code': 'QR para formularios, aftercare, links o material fisico.',
  'copy-doc': 'Documento de marca, copy, reglas visuales o metadatos.',
  'archive-source': 'Archivo historico o fuente sin destino web inmediato.',
};

const STATUS_DEFINITIONS = {
  'already-wired': 'Ya vive en public/img y puede estar referenciado por la web.',
  'website-ready-source': 'Formato web o fuente cercana; candidato a copiar/optimizar si se aprueba.',
  'needs-human-approval': 'Debe validarse visualmente antes de entrar al sitio.',
  'source-only': 'Guardar como fuente o referencia; no usar directo en frontend.',
  'review-required': 'Necesita clasificacion manual por ambiguedad o riesgo de marca.',
};

async function exists(file) {
  try {
    await stat(file);
    return true;
  } catch {
    return false;
  }
}

async function* walk(dir, maxDepth, depth = 0) {
  if (depth > maxDepth || !(await exists(dir))) return;
  let entries = [];
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
  entries.sort((a, b) => a.name.localeCompare(b.name));
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (shouldSkipDir(entry.name)) continue;
      yield* walk(full, maxDepth, depth + 1);
    } else if (IMAGE_EXT.test(entry.name) || DOC_EXT.test(entry.name)) {
      yield full;
    }
  }
}

function shouldSkipDir(name) {
  return /(^\.|node_modules|_BASURERO|basurero|trash|cache)/i.test(name);
}

function normalize(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function skuFrom(value) {
  const match = value.match(/\b(WM|WN|WRR)[-_ ]?([A-Z]{3,5})[-_ ]?(\d{3})\b/i);
  if (!match) return '';
  return `${match[1].toUpperCase()}-${match[2].toUpperCase()}-${match[3]}`;
}

function roleFor(asset) {
  const text = normalize(asset.relative);
  if (/qr|qrcode/.test(text)) return 'qr-code';
  if (/metadata|brand|copy|rules|system|voz|paleta|typography|visual/.test(text)) return 'copy-doc';
  if (/logo|favicon|mark|marca|identity|identidad/.test(text)) return 'identity-logo';
  if (/texture|pattern|patron|background|fondo|weave|textil/.test(text)) return 'web-background-texture';
  if (/banner|hero|cabecera|collection|coleccion|meteorite.*ritual/.test(text)) return 'web-hero-banner';
  if (/divider|icon|symbol|sigil|kultrun|spiral|volcano|meteor|copihue|cross/.test(text)) return 'web-graphic-ui';
  if (/social|instagram|story|post|reel|template/.test(text)) return 'social-template';
  if (/diptico|behance|portfolio|marketing|collateral|form/.test(text)) return 'marketing-collateral';
  if (/product|producto|photography|foto|macro|woocommerce|inventario|wm-|wn-|wrr-|hanger|ring|septum|tunnel|plug|labret|ear|saddle/.test(text)) {
    return asset.sourceId === 'website-public' ? 'web-product' : 'product-master';
  }
  return 'archive-source';
}

function statusFor(asset, role) {
  const text = normalize(asset.relative);
  if (asset.sourceId === 'website-public') return 'already-wired';
  if (role === 'identity-logo') return 'needs-human-approval';
  if (role === 'copy-doc' || role === 'archive-source') return 'source-only';
  if (/screenshot|captura|ali|aliexpress|mockup|render/.test(text)) return 'needs-human-approval';
  if (/\.(avif|webp|svg)$/i.test(asset.file)) return 'website-ready-source';
  return 'needs-human-approval';
}

function recommendedUse(role, asset) {
  const name = path.basename(asset.file, path.extname(asset.file));
  const cleanName = name.replace(/[-_]+/g, ' ');
  const sku = asset.sku ? ` Producto/sku: ${asset.sku}.` : '';
  switch (role) {
    case 'identity-logo':
      return `Identidad visual: validar como logo o variante antes de usar.${sku}`;
    case 'web-hero-banner':
      return `Banner o cabecera para home/shop/colecciones. Revisar recorte responsive.${sku}`;
    case 'web-background-texture':
      return 'Fondo o overlay sutil para secciones oscuras; no usar como imagen principal.';
    case 'web-graphic-ui':
      return 'Elemento grafico de interfaz: divisor, icono, simbolo o decoracion controlada.';
    case 'web-product':
      return `Asset de producto ya dentro de la web.${sku}`;
    case 'product-master':
      return `Fuente de producto para catalogo, PDP o lamina; nombre visible: ${cleanName}.${sku}`;
    case 'social-template':
      return 'Plantilla o pieza social; puede derivar posts, stories o campanas.';
    case 'marketing-collateral':
      return 'Pieza de marketing/impresion/campana; revisar si conviene web, PDF o social.';
    case 'qr-code':
      return 'QR para material fisico o pagina de contacto; verificar destino antes de publicar.';
    case 'copy-doc':
      return 'Documento de reglas, copy o metadata; usar para decisiones, no como asset visual.';
    default:
      return 'Archivo fuente/historico; clasificar manualmente si aparece una necesidad concreta.';
  }
}

function formatSize(bytes) {
  if (bytes > 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

async function collect(source) {
  const assets = [];
  if (!(await exists(source.root))) {
    return { source, assets, missing: true, truncated: false };
  }

  for await (const file of walk(source.root, source.maxDepth)) {
    const st = await stat(file);
    const relative = path.relative(source.root, file);
    const asset = {
      sourceId: source.id,
      sourceLabel: source.label,
      sourceRoot: source.root,
      file,
      relative,
      ext: path.extname(file).toLowerCase().slice(1),
      size: st.size,
      sizeLabel: formatSize(st.size),
      sku: skuFrom(relative),
    };
    asset.role = roleFor(asset);
    asset.status = statusFor(asset, asset.role);
    asset.use = recommendedUse(asset.role, asset);
    assets.push(asset);
    if (assets.length >= LIMIT_PER_SOURCE) {
      return { source, assets, missing: false, truncated: true };
    }
  }

  return { source, assets, missing: false, truncated: false };
}

function countBy(items, field) {
  const counts = new Map();
  for (const item of items) counts.set(item[field], (counts.get(item[field]) || 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

function mdPath(value) {
  return value.replace('/Users/user1/', '~/').replace('/Volumes/LaCie/', '/Volumes/LaCie/');
}

async function readBrandNote() {
  const logoSystem = '/Users/user1/Obsidian/WenuAgent/brand/03-logos/logo-system.md';
  const brandConfig = '/Users/user1/Obsidian/WenuAgent/brand/08-copy-bank/ASSETS-config.md';
  const notes = [];

  if (await exists(logoSystem)) {
    const text = await readFile(logoSystem, 'utf8');
    if (/do not assume|official|valid/i.test(text)) {
      notes.push('Logo: el sistema local indica no asumir una version oficial sin validacion humana.');
    }
  }
  if (await exists(brandConfig)) {
    const text = await readFile(brandConfig, 'utf8');
    const essence = text.match(/artesanal.*simb[oó]lica/i);
    if (essence) {
      notes.push('Direccion de marca detectada: artesanal, sensorial, expresiva, intima y simbolica.');
    }
  }
  return notes;
}

function pushAssetRows(lines, assets, max = 120) {
  for (const asset of assets.slice(0, max)) {
    lines.push(`| ${asset.sourceLabel} | \`${asset.relative}\` | ${asset.role} | ${asset.status} | ${asset.sku || '-'} | ${asset.sizeLabel} | ${asset.use} |`);
  }
  if (assets.length > max) {
    lines.push(`| ... | ... | ... | ... | ... | ... | ${assets.length - max} assets mas en esta seccion. |`);
  }
}

async function main() {
  const collected = await Promise.all(SOURCES.map(collect));
  const assets = collected.flatMap(result => result.assets);
  const brandNotes = await readBrandNote();
  const now = new Date().toISOString();

  const lines = [];
  lines.push('# Wenu Mapu Brand Asset Library');
  lines.push('');
  lines.push(`Generated: ${now}`);
  lines.push('');
  lines.push('## Que Es Esto');
  lines.push('');
  lines.push('Esta biblioteca convierte las carpetas de marca, marketing, producto y archivo en una lista accionable: cada pieza queda con nombre, rol, estado y uso recomendado.');
  lines.push('');
  lines.push('Regla de seguridad: este proceso es solo lectura. No copia archivos, no sube nada, no escribe WooCommerce, no toca DNS, no hace deploy y no lee secretos.');
  lines.push('');
  lines.push('## Mapa Simple');
  lines.push('');
  lines.push('| Departamento | Sirve para | Accion normal |');
  lines.push('| --- | --- | --- |');
  lines.push('| Identidad | Logos, simbolos, marca madre | Validar antes de usar publico |');
  lines.push('| Web | Hero, banners, fondos, graficos UI | Copiar a `public/img`, optimizar y cablear en Astro |');
  lines.push('| Producto | Fotos finales, renders, macros | Asociar a SKU/producto y revisar calidad |');
  lines.push('| Marketing | Campanas, dipticos, QR, Behance | Convertir en piezas web/social si corresponde |');
  lines.push('| Social | Stories, posts, plantillas | Derivar contenido para Instagram/Canva |');
  lines.push('| Archivo | Fuentes historicas, compras, screenshots | Mantener como referencia, no publicar directo |');
  lines.push('');
  lines.push('## Notas De Marca Detectadas');
  lines.push('');
  if (brandNotes.length) {
    for (const note of brandNotes) lines.push(`- ${note}`);
  } else {
    lines.push('- No se detectaron notas de marca adicionales en los documentos leidos.');
  }
  lines.push('- Criterio operativo: una imagen puede ser bella, pero solo entra a la web si tiene rol claro, formato web y ubicacion definida.');
  lines.push('');
  lines.push('## Roles');
  lines.push('');
  for (const [role, definition] of Object.entries(ROLE_DEFINITIONS)) {
    lines.push(`- \`${role}\`: ${definition}`);
  }
  lines.push('');
  lines.push('## Estados');
  lines.push('');
  for (const [status, definition] of Object.entries(STATUS_DEFINITIONS)) {
    lines.push(`- \`${status}\`: ${definition}`);
  }
  lines.push('');
  lines.push('## Resumen');
  lines.push('');
  lines.push(`- Assets clasificados: ${assets.length}`);
  lines.push(`- Fuentes revisadas: ${SOURCES.length}`);
  for (const result of collected) {
    const suffix = result.missing ? 'missing' : result.truncated ? `truncated at ${LIMIT_PER_SOURCE}` : `${result.assets.length} assets`;
    lines.push(`- ${result.source.label}: ${suffix}`);
  }
  lines.push('');
  lines.push('### Por Rol');
  lines.push('');
  for (const [role, count] of countBy(assets, 'role')) lines.push(`- ${role}: ${count}`);
  lines.push('');
  lines.push('### Por Estado');
  lines.push('');
  for (const [status, count] of countBy(assets, 'status')) lines.push(`- ${status}: ${count}`);
  lines.push('');
  lines.push('## Prioridades De Uso');
  lines.push('');
  lines.push('1. `already-wired`: revisar visualmente que lo que ya esta en web mantiene la marca.');
  lines.push('2. `website-ready-source`: candidatos directos para copiar, optimizar y usar en banners/fondos/productos.');
  lines.push('3. `needs-human-approval`: mirar en el board antes de usar, sobre todo logos, screenshots, renders y material historico.');
  lines.push('4. `source-only`: mantener como memoria de marca, no publicar.');
  lines.push('');

  const priorityRoles = [
    ['web-hero-banner', 'Banners Y Heroes'],
    ['web-background-texture', 'Fondos Y Texturas'],
    ['web-graphic-ui', 'Simbolos E Interfaz'],
    ['product-master', 'Producto / SKU'],
    ['identity-logo', 'Identidad Y Logos'],
    ['marketing-collateral', 'Marketing Collateral'],
    ['social-template', 'Social'],
    ['qr-code', 'QR'],
    ['copy-doc', 'Documentos De Marca'],
  ];

  for (const [role, title] of priorityRoles) {
    const roleAssets = assets
      .filter(asset => asset.role === role)
      .sort((a, b) => {
        const statusOrder = a.status.localeCompare(b.status);
        return statusOrder || a.relative.localeCompare(b.relative);
      });
    lines.push(`## ${title}`);
    lines.push('');
    if (!roleAssets.length) {
      lines.push('- No se encontraron assets en esta categoria.');
      lines.push('');
      continue;
    }
    lines.push('| Fuente | Asset | Rol | Estado | SKU | Peso | Para que sirve |');
    lines.push('| --- | --- | --- | --- | --- | --- | --- |');
    pushAssetRows(lines, roleAssets);
    lines.push('');
  }

  lines.push('## Fuentes Escaneadas');
  lines.push('');
  for (const source of SOURCES) {
    lines.push(`- ${source.label}: \`${mdPath(source.root)}\``);
  }
  lines.push('');
  lines.push('## Proxima Accion Recomendada');
  lines.push('');
  lines.push('1. Abrir `docs/asset-board.html` para mirar visualmente los candidatos.');
  lines.push('2. Elegir una sola familia: banners web, logos, producto o social.');
  lines.push('3. Copiar solo aprobados a `public/img/...` con nombre kebab-case.');
  lines.push('4. Generar WebP/AVIF, correr inventario y build.');
  lines.push('5. Repetir por departamento, no mezclar todo en una sola pasada.');
  lines.push('');

  await mkdir(path.dirname(REPORT_PATH), { recursive: true });
  await writeFile(REPORT_PATH, `${lines.join('\n')}\n`);
  console.log(`Wrote ${path.relative(ROOT, REPORT_PATH)}`);
  console.log(`assets=${assets.length}`);
  console.log(`roles=${countBy(assets, 'role').map(([role, count]) => `${role}:${count}`).join(',')}`);
}

main().catch(error => {
  console.error(error.message);
  process.exit(1);
});
