// Standalone preview of the welcome email template (mirrors api.mjs sendWelcomeEmail).
// Renders BOTH lang variants to dist-preview so we can screenshot the render.
// Assets point at the LOCAL built site so preview works offline; prod uses the CDN.
import fs from "node:fs";
import path from "node:path";

function render({ email, coupon, lang, cdn }) {
  const isEs = lang === "es";
  const OBSIDIAN = "#0a0a0a", CHARCOAL = "#121212", BONE = "#f0ede8",
        SAND = "#9a948a", EMBER = "#c9a84c", BRONZE = "#6a4a28";
  const SITE = "https://wenumapuonline.com";
  const CDN = cdn;
  const LOGO = `${CDN}/email-logo-woven.png`; // real woven-glyph wordmark + mandala
  const MANDALA = `${CDN}/mandala-spin.gif`;
  const MOOD = `${CDN}/email-mood.jpg`;

  const t = isEs ? {
    preheader: "Mari mari. Estás en el primer círculo — cada pieza es un fragmento del cielo.",
    browser: "Ver en el navegador",
    eyebrow: "EL PRIMER CÍRCULO",
    h1a: "Mari mari —", h1b: "estás en el círculo.",
    lead: "Te recibimos. Ahora ves primero lo que va llegando al taller.",
    mapud: "Küme akun — bienvenidx.",
    body: "Joyería ritual del cuerpo, nacida en Wallmapu, entre el desierto de Atacama y el cosmos mapuche. No hacemos moda: hacemos objetos que existen una sola vez, para acompañar el viaje de tu cuerpo.",
    couponLabel: "TU SEÑAL DE ENTRADA — 10%",
    couponSub: "válido 30 días · un solo uso · tu primera pieza",
    cta: "ENTRAR AL TALLER",
    wear: "Wear the ritual.",
    footerTag: "PIEZAS LIMITADAS · ENVÍO A TODO EL MUNDO",
  } : {
    preheader: "Mari mari. You're in the first circle — each piece is a fragment of sky.",
    browser: "View in browser",
    eyebrow: "THE FIRST CIRCLE",
    h1a: "Mari mari —", h1b: "you're in the circle.",
    lead: "We receive you. From here on, you see what reaches the studio first.",
    mapud: "Küme akun — welcome.",
    body: "Ritual body jewelry born in Wallmapu, between the Atacama Desert and the Mapuche cosmos. We don't make trends: we make objects that exist only once, to walk with your body's journey.",
    couponLabel: "YOUR SIGNAL OF ENTRY — 10%",
    couponSub: "valid 30 days · single use · your first piece",
    cta: "ENTER THE STUDIO",
    wear: "Wear the ritual.",
    footerTag: "LIMITED PIECES · WORLDWIDE SHIPPING",
  };

  const couponBlock = coupon ? `
              <tr><td style="padding:8px 40px 0">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${BRONZE};background:#0d0d0d">
                  <tr><td align="center" style="padding:20px 16px 8px">
                    <div style="font-family:Georgia,'Times New Roman',serif;font-size:11px;letter-spacing:.28em;color:${SAND}">${t.couponLabel}</div>
                    <div style="font-family:'Courier New',Courier,monospace;font-size:26px;letter-spacing:.22em;color:${EMBER};padding:12px 0 6px;font-weight:bold">${coupon}</div>
                    <div style="font-family:Georgia,serif;font-size:11px;letter-spacing:.06em;color:${SAND}">${t.couponSub}</div>
                  </td></tr>
                </table>
              </td></tr>` : "";

  return `<!doctype html>
<html lang="${isEs ? 'es' : 'en'}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="dark">
<title>Wenu Mapu</title>
</head>
<body style="margin:0;padding:0;background:${OBSIDIAN}">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:${OBSIDIAN};font-size:1px">${t.preheader}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${OBSIDIAN}">
    <tr><td align="center" style="padding:0">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:600px">
        <tr><td align="center" style="padding:14px 40px 0;background:${OBSIDIAN}"><a href="${SITE}" style="font-family:Georgia,serif;font-size:10px;letter-spacing:.14em;color:#5b564d;text-decoration:none">${t.browser}</a></td></tr>
      </table>
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:600px;background:${OBSIDIAN};border:1px solid #1a1712">
        <tr><td align="center" style="padding:44px 40px 10px;background:${OBSIDIAN}"><img src="${LOGO}" alt="Wenu Mapu" width="360" height="73" style="width:360px;max-width:88%;height:auto;display:block;border:0"></td></tr>
        <tr><td align="center" style="padding:6px 40px 0;background:${OBSIDIAN}"><div style="font-family:Georgia,serif;font-size:11px;letter-spacing:.36em;color:${SAND}">${t.eyebrow}</div></td></tr>
        <tr><td align="center" style="padding:36px 30px 0;background:${OBSIDIAN}"><div style="font-family:Georgia,serif;font-size:40px;line-height:1.12;color:${BONE}">${t.h1a}<br><span style="color:${EMBER}">${t.h1b}</span></div></td></tr>
        <tr><td align="center" style="padding:22px 52px 0;background:${OBSIDIAN}"><p style="margin:0;font-family:Georgia,serif;font-size:18px;line-height:1.6;color:${BONE}">${t.lead}</p></td></tr>
        <tr><td align="center" style="padding:16px 46px 0;background:${OBSIDIAN}"><p style="margin:0;font-family:Georgia,serif;font-style:italic;font-size:15px;color:${EMBER}">${t.mapud}</p></td></tr>
        <tr><td align="center" style="padding:22px 0 4px;background:${OBSIDIAN}"><span style="color:${BRONZE};font-size:13px">&#10022;</span></td></tr>
        <tr><td align="center" style="padding:22px 0 0;background:${OBSIDIAN}"><img src="${MOOD}" alt="Wenu Mapu" width="600" style="width:100%;max-width:600px;height:auto;display:block;border:0"></td></tr>
        <tr><td align="center" style="padding:28px 52px 0;background:${OBSIDIAN}"><p style="margin:0;font-family:Georgia,serif;font-size:15px;line-height:1.8;color:${SAND}">${t.body}</p></td></tr>
        ${couponBlock}
        <tr><td align="center" style="padding:30px 40px 6px;background:${OBSIDIAN}"><table role="presentation" cellpadding="0" cellspacing="0"><tr><td align="center" bgcolor="${EMBER}"><a href="${SITE}/shop" style="display:inline-block;padding:16px 40px;font-family:Georgia,serif;font-size:13px;letter-spacing:.22em;color:${OBSIDIAN};text-decoration:none;font-weight:bold">${t.cta}</a></td></tr></table></td></tr>
        <tr><td align="center" style="padding:22px 40px 6px;background:${OBSIDIAN}"><div style="font-family:Georgia,serif;font-style:italic;font-size:15px;color:${SAND}">${t.wear}</div></td></tr>
        <tr><td align="center" style="padding:30px 40px 6px;background:${OBSIDIAN}"><img src="${MANDALA}" alt="" width="150" height="150" style="width:150px;max-width:150px;height:auto;display:block;border:0;margin:0 auto"></td></tr>
        <tr><td align="center" style="padding:24px 40px 30px;background:${OBSIDIAN};border-top:1px solid #1a1815"><div style="font-family:Georgia,serif;font-size:10px;letter-spacing:.24em;color:${SAND};padding-bottom:10px">${t.footerTag}</div><a href="${SITE}" style="font-family:Georgia,serif;font-size:12px;letter-spacing:.18em;color:${EMBER};text-decoration:none">WENUMAPUONLINE.COM</a></td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

const outDir = process.argv[2] || "/tmp/wenu-email-preview";
// local assets so preview renders without deploy
const localCdn = "file:///Users/user1/wenu-frontend/public/img/email";
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "welcome-es.html"), render({ email: "tigo@example.com", coupon: "RITUAL10-A7K2QX", lang: "es", cdn: localCdn }));
fs.writeFileSync(path.join(outDir, "welcome-en.html"), render({ email: "tigo@example.com", coupon: "RITUAL10-A7K2QX", lang: "en", cdn: localCdn }));
console.log("wrote", outDir);
