# Email Marketing Flows — Wenu Mapu
**Fecha:** 2026-05-11
**Target:** ticket $180–250 USD · body jewelry artesanal con raíz mapuche
**Voz:** ritual, sobria, sensorial, primera persona plural de la marca
**Fuente de marca:** [[brand/MARCA-maestro]]

---

## 1. Recomendación de plataforma

**MailerLite** es la elección correcta para esta etapa. Klaviyo tiene la lógica de automatización más potente para ecommerce, pero su costo escala rápido y justifica la inversión solo a partir de listas de 10.000+ suscriptores con volumen de compras diario. ConvertKit está optimizado para creadores con cursos o membresías, no para catálogo físico. MailerLite ofrece integración nativa con WooCommerce vía plugin oficial (sincroniza productos, pedidos y abandono de carrito en tiempo real), deliverability sólido con SPF/DKIM propios, automations visuales sin límite en el plan Growing Business (~$25/mes hasta 5.000 suscriptores), y formularios de suscripción embebibles en el frontend Astro. Para una marca artesanal premium con lista inicial pequeña, la relación costo/feature es la más eficiente. Migrar a Klaviyo es sencillo cuando el volumen lo justifique.

---

## 2. Flow 1 — Welcome Series (3 emails)

### Contexto del flow
**Trigger:** suscripción al formulario (website o checkout guest).
**Segmento:** nuevos suscriptores sin compra previa.
**Objetivo:** transferir brand DNA, generar primera compra con descuento 10%.

---

### Email 1 — Inmediato (0h)

**SUBJECT opciones A/B/C**
```
A: Something made by hand is waiting for you
B: This is where it begins
C: Welcome to Wenu Mapu — a piece is already yours
```

**PREVIEW TEXT**
```
10% off your first order, and the story behind every piece we make.
```

**BODY**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Wenu Mapu</title>
  <style>
    body { margin: 0; padding: 0; background-color: #F3EBDD; font-family: Georgia, serif; }
    .wrapper { max-width: 600px; margin: 0 auto; background-color: #F3EBDD; }
    .header { background-color: #2B211B; padding: 40px 48px 32px; text-align: center; }
    .logo { color: #B68B5A; font-size: 22px; letter-spacing: 6px; text-transform: uppercase; font-family: Georgia, serif; }
    .tagline { color: #D6C1A3; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; margin-top: 8px; }
    .body-section { padding: 48px 48px 32px; }
    .headline { color: #2B211B; font-size: 28px; line-height: 1.3; margin: 0 0 24px; font-weight: normal; }
    .body-copy { color: #6F4E37; font-size: 16px; line-height: 1.8; margin: 0 0 20px; }
    .divider { border: none; border-top: 1px solid #D6C1A3; margin: 32px 0; }
    .discount-block { background-color: #2B211B; padding: 32px 40px; text-align: center; margin: 0 48px; }
    .discount-label { color: #B68B5A; font-size: 11px; letter-spacing: 4px; text-transform: uppercase; margin-bottom: 12px; }
    .discount-code { color: #F3EBDD; font-size: 32px; letter-spacing: 8px; font-family: Georgia, serif; }
    .discount-note { color: #D6C1A3; font-size: 13px; margin-top: 12px; }
    .cta-wrap { text-align: center; padding: 40px 48px; }
    .cta-btn { display: inline-block; background-color: #B68B5A; color: #2B211B; text-decoration: none; padding: 16px 40px; font-size: 13px; letter-spacing: 3px; text-transform: uppercase; font-family: Georgia, serif; }
    .footer { background-color: #2B211B; padding: 32px 48px; text-align: center; }
    .footer-text { color: #6F4E37; font-size: 11px; line-height: 1.8; }
    .footer-link { color: #B68B5A; text-decoration: none; }
  </style>
</head>
<body>
<div class="wrapper">

  <!-- Header -->
  <div class="header">
    <div class="logo">Wenu Mapu</div>
    <div class="tagline">Artisanal Body Jewelry</div>
  </div>

  <!-- Body -->
  <div class="body-section">
    <h1 class="headline">Every piece we make<br>begins with the body as territory.</h1>

    <p class="body-copy">Wenu Mapu — New Land in Mapudungun — was born from the belief that what you carry on your skin should carry meaning. We make body jewelry by hand: plugs, tunnels, septums, hangers, and organic forms in silver 950, bronze, copper, wood, and stone.</p>

    <p class="body-copy">Nothing here is mass-produced. Each piece is shaped, finished, and held before it reaches you. We work slowly, deliberately, and in small quantities — because that is the only way to make something worth wearing.</p>

    <p class="body-copy">We are glad you are here. As a welcome, your first order is 10% off.</p>

    <hr class="divider">
  </div>

  <!-- Discount -->
  <div class="discount-block">
    <div class="discount-label">Your first-order code</div>
    <div class="discount-code">TIERRA10</div>
    <div class="discount-note">Valid for 14 days · One use · All collections</div>
  </div>

  <!-- CTA -->
  <div class="cta-wrap">
    <a href="https://wenumapuonline.com/shop" class="cta-btn">Explore the collection</a>
  </div>

  <!-- Footer -->
  <div class="footer">
    <p class="footer-text">
      Questions? Write to <a href="mailto:support@wenumapuonline.com" class="footer-link">support@wenumapuonline.com</a><br>
      Custom orders: <a href="mailto:custom@wenumapuonline.com" class="footer-link">custom@wenumapuonline.com</a><br><br>
      <a href="{{ unsubscribe_url }}" class="footer-link">Unsubscribe</a> · wenumapuonline.com
    </p>
  </div>

</div>
</body>
</html>
```

---

### Email 2 — Día 3 (72h)

**SUBJECT opciones A/B/C**
```
A: What we work with — and why it matters
B: Silver, bronze, and the logic of each material
C: The material is the message
```

**PREVIEW TEXT**
```
Each material we use has a reason. Here is how we choose.
```

**BODY**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>The Materials — Wenu Mapu</title>
  <style>
    body { margin: 0; padding: 0; background-color: #F3EBDD; font-family: Georgia, serif; }
    .wrapper { max-width: 600px; margin: 0 auto; background-color: #F3EBDD; }
    .header { background-color: #2B211B; padding: 40px 48px 32px; text-align: center; }
    .logo { color: #B68B5A; font-size: 22px; letter-spacing: 6px; text-transform: uppercase; }
    .tagline { color: #D6C1A3; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; margin-top: 8px; }
    .body-section { padding: 48px 48px 16px; }
    .headline { color: #2B211B; font-size: 26px; line-height: 1.35; margin: 0 0 24px; font-weight: normal; }
    .body-copy { color: #6F4E37; font-size: 16px; line-height: 1.8; margin: 0 0 20px; }
    .material-block { border-left: 2px solid #B68B5A; padding: 0 0 0 24px; margin: 0 48px 32px; }
    .material-name { color: #2B211B; font-size: 13px; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 8px; }
    .material-desc { color: #6F4E37; font-size: 15px; line-height: 1.75; margin: 0; }
    .process-section { background-color: #2B211B; padding: 40px 48px; }
    .process-headline { color: #D6C1A3; font-size: 13px; letter-spacing: 4px; text-transform: uppercase; margin-bottom: 20px; }
    .process-copy { color: #C7C2B7; font-size: 15px; line-height: 1.8; margin: 0 0 16px; }
    .cta-wrap { text-align: center; padding: 40px 48px; }
    .cta-btn { display: inline-block; background-color: #B68B5A; color: #2B211B; text-decoration: none; padding: 16px 40px; font-size: 13px; letter-spacing: 3px; text-transform: uppercase; }
    .reminder { background-color: #D6C1A3; padding: 20px 48px; text-align: center; }
    .reminder-text { color: #2B211B; font-size: 13px; letter-spacing: 1px; }
    .reminder-code { color: #6F4E37; font-weight: bold; letter-spacing: 3px; }
    .footer { background-color: #2B211B; padding: 32px 48px; text-align: center; }
    .footer-text { color: #6F4E37; font-size: 11px; line-height: 1.8; }
    .footer-link { color: #B68B5A; text-decoration: none; }
  </style>
</head>
<body>
<div class="wrapper">

  <div class="header">
    <div class="logo">Wenu Mapu</div>
    <div class="tagline">Artisanal Body Jewelry</div>
  </div>

  <div class="body-section">
    <h1 class="headline">We choose each material<br>the same way we choose<br>what to make: slowly.</h1>

    <p class="body-copy">Body jewelry lives against skin. That means the material is not decoration — it is the piece. We work with a small selection of materials, each chosen for its feel, its age, and its capacity to change over time.</p>
  </div>

  <!-- Materials -->
  <div class="material-block">
    <div class="material-name">Silver 950</div>
    <p class="material-desc">Purer than sterling, softer to the touch. Our primary metal for plugs, septums, and fine hangers. It oxidizes with wear and becomes more itself.</p>
  </div>

  <div class="material-block">
    <div class="material-name">Bronze</div>
    <p class="material-desc">Warm, heavy, ancient. Bronze develops a patina that records time on the body. Each piece evolves differently depending on who wears it.</p>
  </div>

  <div class="material-block">
    <div class="material-name">Copper</div>
    <p class="material-desc">The most responsive metal we use. Copper reacts to body chemistry — it is the material that knows you most closely.</p>
  </div>

  <div class="material-block">
    <div class="material-name">Wood and Stone</div>
    <p class="material-desc">For organic plugs and tunnels. We work with dense woods and raw stones that carry their own grain, weight, and texture. No two pieces are identical.</p>
  </div>

  <!-- Process -->
  <div class="process-section">
    <div class="process-headline">The process</div>
    <p class="process-copy">We do not use molds for production runs. Each piece is shaped individually — filed, sanded, and finished by hand. The process is slow, and that slowness is visible in the result.</p>
    <p class="process-copy">We make in small quantities. When something sells out, it does not always come back in the same form.</p>
  </div>

  <div class="cta-wrap">
    <a href="https://wenumapuonline.com/shop" class="cta-btn">See current pieces</a>
  </div>

  <!-- Reminder -->
  <div class="reminder">
    <p class="reminder-text">Your first-order discount is still active: <span class="reminder-code">TIERRA10</span> — valid until {{expiry_date}}</p>
  </div>

  <div class="footer">
    <p class="footer-text">
      <a href="mailto:support@wenumapuonline.com" class="footer-link">support@wenumapuonline.com</a><br><br>
      <a href="{{ unsubscribe_url }}" class="footer-link">Unsubscribe</a> · wenumapuonline.com
    </p>
  </div>

</div>
</body>
</html>
```

---

### Email 3 — Día 7

**SUBJECT opciones A/B/C**
```
A: A piece made specifically for you — how custom orders work
B: We can make it for you
C: Custom work: what it means to commission a piece
```

**PREVIEW TEXT**
```
Private appointments, custom sizing, and pieces we make only once.
```

**BODY**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Custom Orders — Wenu Mapu</title>
  <style>
    body { margin: 0; padding: 0; background-color: #F3EBDD; font-family: Georgia, serif; }
    .wrapper { max-width: 600px; margin: 0 auto; background-color: #F3EBDD; }
    .header { background-color: #2B211B; padding: 40px 48px 32px; text-align: center; }
    .logo { color: #B68B5A; font-size: 22px; letter-spacing: 6px; text-transform: uppercase; }
    .tagline { color: #D6C1A3; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; margin-top: 8px; }
    .body-section { padding: 48px 48px 32px; }
    .headline { color: #2B211B; font-size: 26px; line-height: 1.35; margin: 0 0 24px; font-weight: normal; }
    .body-copy { color: #6F4E37; font-size: 16px; line-height: 1.8; margin: 0 0 20px; }
    .steps-section { background-color: #2B211B; padding: 40px 48px; }
    .steps-headline { color: #B68B5A; font-size: 11px; letter-spacing: 4px; text-transform: uppercase; margin-bottom: 28px; }
    .step { margin-bottom: 24px; }
    .step-num { color: #B68B5A; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 6px; }
    .step-copy { color: #C7C2B7; font-size: 15px; line-height: 1.75; margin: 0; }
    .cta-wrap { text-align: center; padding: 40px 48px; }
    .cta-btn { display: inline-block; background-color: #B68B5A; color: #2B211B; text-decoration: none; padding: 16px 40px; font-size: 13px; letter-spacing: 3px; text-transform: uppercase; }
    .note { padding: 0 48px 40px; }
    .note-copy { color: #6F4E37; font-size: 14px; line-height: 1.7; font-style: italic; }
    .footer { background-color: #2B211B; padding: 32px 48px; text-align: center; }
    .footer-text { color: #6F4E37; font-size: 11px; line-height: 1.8; }
    .footer-link { color: #B68B5A; text-decoration: none; }
  </style>
</head>
<body>
<div class="wrapper">

  <div class="header">
    <div class="logo">Wenu Mapu</div>
    <div class="tagline">Artisanal Body Jewelry</div>
  </div>

  <div class="body-section">
    <h1 class="headline">The most considered pieces<br>we make are the ones<br>we make for one person.</h1>

    <p class="body-copy">Our custom order program is not a configuration tool. It is a conversation. You bring what you want to carry, we figure out how to make it in a material that lasts, a size that fits, a form that is yours.</p>

    <p class="body-copy">We work in silver 950, bronze, copper, and select organic materials. Custom pieces take two to four weeks from consultation to delivery. Most cost between $180 and $300 USD depending on material and complexity.</p>
  </div>

  <!-- Steps -->
  <div class="steps-section">
    <div class="steps-headline">How it works</div>
    <div class="step">
      <div class="step-num">01 — Write to us</div>
      <p class="step-copy">Send a message to custom@wenumapuonline.com describing what you have in mind. Photos, references, and measurements are welcome.</p>
    </div>
    <div class="step">
      <div class="step-num">02 — Private consultation</div>
      <p class="step-copy">We schedule a short appointment — in person if you are in the area, or by video. We talk through material, form, gauge, and timeline.</p>
    </div>
    <div class="step">
      <div class="step-num">03 — We make it</div>
      <p class="step-copy">We send a progress update and photos before finishing. You receive the piece with a certificate of materials and aftercare instructions.</p>
    </div>
  </div>

  <div class="cta-wrap">
    <a href="mailto:custom@wenumapuonline.com" class="cta-btn">Start a custom order</a>
  </div>

  <div class="note">
    <p class="note-copy">We accept a limited number of custom commissions each month. If you have something in mind, writing sooner is better than waiting.</p>
  </div>

  <div class="footer">
    <p class="footer-text">
      Custom orders: <a href="mailto:custom@wenumapuonline.com" class="footer-link">custom@wenumapuonline.com</a><br>
      General: <a href="mailto:support@wenumapuonline.com" class="footer-link">support@wenumapuonline.com</a><br><br>
      <a href="{{ unsubscribe_url }}" class="footer-link">Unsubscribe</a> · wenumapuonline.com
    </p>
  </div>

</div>
</body>
</html>
```

---

## 3. Flow 2 — Abandoned Cart (2 emails)

### Contexto del flow
**Trigger:** WooCommerce webhook `woocommerce_cart_abandoned` (ver sección 7).
**Condición:** usuario con email identificado, carrito activo sin checkout completado.
**Segmento:** todos — subscribers y customers.

---

### Email 1 — 4 horas después del abandono

**SUBJECT opciones A/B/C**
```
A: Your piece is still here
B: You left something behind
C: Still here — and still yours
```

**PREVIEW TEXT**
```
We kept your cart. The piece is waiting.
```

**BODY**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your cart — Wenu Mapu</title>
  <style>
    body { margin: 0; padding: 0; background-color: #F3EBDD; font-family: Georgia, serif; }
    .wrapper { max-width: 600px; margin: 0 auto; background-color: #F3EBDD; }
    .header { background-color: #2B211B; padding: 40px 48px 32px; text-align: center; }
    .logo { color: #B68B5A; font-size: 22px; letter-spacing: 6px; text-transform: uppercase; }
    .tagline { color: #D6C1A3; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; margin-top: 8px; }
    .body-section { padding: 48px 48px 32px; }
    .headline { color: #2B211B; font-size: 24px; line-height: 1.4; margin: 0 0 24px; font-weight: normal; }
    .body-copy { color: #6F4E37; font-size: 16px; line-height: 1.8; margin: 0 0 20px; }
    .product-block { border: 1px solid #D6C1A3; padding: 24px; margin: 0 0 32px; background-color: #FAF5EE; }
    .product-img { width: 100%; max-height: 280px; object-fit: cover; display: block; margin-bottom: 16px; }
    .product-name { color: #2B211B; font-size: 18px; margin: 0 0 6px; font-weight: normal; }
    .product-material { color: #B68B5A; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; margin: 0 0 8px; }
    .product-price { color: #6F4E37; font-size: 16px; }
    .cta-wrap { text-align: center; padding: 8px 48px 40px; }
    .cta-btn { display: inline-block; background-color: #B68B5A; color: #2B211B; text-decoration: none; padding: 16px 40px; font-size: 13px; letter-spacing: 3px; text-transform: uppercase; }
    .note { padding: 0 48px 40px; }
    .note-copy { color: #6F4E37; font-size: 14px; line-height: 1.7; font-style: italic; }
    .footer { background-color: #2B211B; padding: 32px 48px; text-align: center; }
    .footer-text { color: #6F4E37; font-size: 11px; line-height: 1.8; }
    .footer-link { color: #B68B5A; text-decoration: none; }
  </style>
</head>
<body>
<div class="wrapper">

  <div class="header">
    <div class="logo">Wenu Mapu</div>
    <div class="tagline">Artisanal Body Jewelry</div>
  </div>

  <div class="body-section">
    <h1 class="headline">We held it for you.<br>It is still in your cart.</h1>
    <p class="body-copy">You were looking at something. We are not sure what stopped you — but the piece is still there, exactly where you left it.</p>
  </div>

  <!-- Dynamic product block — populated by MailerLite + WooCommerce integration -->
  <div class="body-section" style="padding-top: 0;">
    <div class="product-block">
      <!-- MailerLite dynamic content block: {cart_items} -->
      <img src="{{ cart_item_image }}" alt="{{ cart_item_name }}" class="product-img">
      <div class="product-name">{{ cart_item_name }}</div>
      <div class="product-material">{{ cart_item_meta }}</div>
      <div class="product-price">${{ cart_item_price }} USD</div>
    </div>
  </div>

  <div class="cta-wrap">
    <a href="{{ cart_recovery_url }}" class="cta-btn">Return to cart</a>
  </div>

  <div class="note">
    <p class="note-copy">We make in small quantities. We cannot guarantee this piece will be available if you wait too long. If you have a question before deciding — about sizing, material, or fit — write to us at support@wenumapuonline.com.</p>
  </div>

  <div class="footer">
    <p class="footer-text">
      <a href="mailto:support@wenumapuonline.com" class="footer-link">support@wenumapuonline.com</a><br><br>
      <a href="{{ unsubscribe_url }}" class="footer-link">Unsubscribe</a> · wenumapuonline.com
    </p>
  </div>

</div>
</body>
</html>
```

---

### Email 2 — 24 horas después del abandono

**SUBJECT opciones A/B/C**
```
A: What it feels like to wear it — a note from a customer
B: Someone else almost bought the same piece
C: Before this piece goes — one more thing
```

**PREVIEW TEXT**
```
A word from someone who decided. And your cart is still open.
```

**BODY**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>One more thing — Wenu Mapu</title>
  <style>
    body { margin: 0; padding: 0; background-color: #F3EBDD; font-family: Georgia, serif; }
    .wrapper { max-width: 600px; margin: 0 auto; background-color: #F3EBDD; }
    .header { background-color: #2B211B; padding: 40px 48px 32px; text-align: center; }
    .logo { color: #B68B5A; font-size: 22px; letter-spacing: 6px; text-transform: uppercase; }
    .tagline { color: #D6C1A3; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; margin-top: 8px; }
    .body-section { padding: 48px 48px 32px; }
    .headline { color: #2B211B; font-size: 24px; line-height: 1.4; margin: 0 0 24px; font-weight: normal; }
    .body-copy { color: #6F4E37; font-size: 16px; line-height: 1.8; margin: 0 0 20px; }
    .testimonial-block { background-color: #2B211B; padding: 40px 48px; }
    .quote-mark { color: #B68B5A; font-size: 48px; line-height: 1; margin-bottom: 16px; font-family: Georgia, serif; }
    .quote-text { color: #F3EBDD; font-size: 17px; line-height: 1.8; font-style: italic; margin: 0 0 20px; }
    .quote-attr { color: #B68B5A; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; }
    .cta-section { padding: 40px 48px; text-align: center; }
    .cta-note { color: #6F4E37; font-size: 15px; line-height: 1.7; margin-bottom: 28px; }
    .cta-btn { display: inline-block; background-color: #B68B5A; color: #2B211B; text-decoration: none; padding: 16px 40px; font-size: 13px; letter-spacing: 3px; text-transform: uppercase; }
    .footer { background-color: #2B211B; padding: 32px 48px; text-align: center; }
    .footer-text { color: #6F4E37; font-size: 11px; line-height: 1.8; }
    .footer-link { color: #B68B5A; text-decoration: none; }
  </style>
</head>
<body>
<div class="wrapper">

  <div class="header">
    <div class="logo">Wenu Mapu</div>
    <div class="tagline">Artisanal Body Jewelry</div>
  </div>

  <div class="body-section">
    <h1 class="headline">We wanted to share<br>one more thing before<br>your cart expires.</h1>
    <p class="body-copy">We do not send many emails. This is the last one about the piece in your cart. But before we let it go, we wanted you to read this.</p>
  </div>

  <!-- Testimonial -->
  <div class="testimonial-block">
    <div class="quote-mark">"</div>
    <p class="quote-text">I have been wearing my bronze plug every day for eight months. The weight is perfect — I forget it is there, but when I catch it in the mirror I always notice it. It does not look like something I bought. It looks like something that belongs to me.</p>
    <div class="quote-attr">— M.R., customer since 2024</div>
  </div>

  <div class="cta-section">
    <p class="cta-note">Your cart is still open. The piece is still there. If something felt uncertain, write to us before you decide — we are happy to answer any question about sizing, material, or fit.</p>
    <a href="{{ cart_recovery_url }}" class="cta-btn">Complete your order</a>
  </div>

  <div class="footer">
    <p class="footer-text">
      <a href="mailto:support@wenumapuonline.com" class="footer-link">support@wenumapuonline.com</a><br><br>
      <a href="{{ unsubscribe_url }}" class="footer-link">Unsubscribe</a> · wenumapuonline.com
    </p>
  </div>

</div>
</body>
</html>
```

---

## 4. Flow 3 — Post-Purchase (4 emails)

### Contexto del flow
**Trigger:** `woocommerce_order_status_processing` (pago confirmado).
**Segmento:** customers (mover de subscribers a customers en MailerLite automáticamente).
**Objetivo:** confianza post-compra, aftercare, review, retención a largo plazo.

---

### Email 1 — Inmediato (confirmación de pago)

**SUBJECT**
```
Your order is confirmed — thank you
```

**PREVIEW TEXT**
```
Order #{{order_number}} · We begin preparing your piece.
```

**BODY**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order confirmed — Wenu Mapu</title>
  <style>
    body { margin: 0; padding: 0; background-color: #F3EBDD; font-family: Georgia, serif; }
    .wrapper { max-width: 600px; margin: 0 auto; background-color: #F3EBDD; }
    .header { background-color: #2B211B; padding: 40px 48px 32px; text-align: center; }
    .logo { color: #B68B5A; font-size: 22px; letter-spacing: 6px; text-transform: uppercase; }
    .tagline { color: #D6C1A3; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; margin-top: 8px; }
    .body-section { padding: 48px 48px 32px; }
    .headline { color: #2B211B; font-size: 24px; line-height: 1.4; margin: 0 0 24px; font-weight: normal; }
    .body-copy { color: #6F4E37; font-size: 16px; line-height: 1.8; margin: 0 0 20px; }
    .order-block { background-color: #2B211B; padding: 32px 40px; margin-bottom: 32px; }
    .order-label { color: #B68B5A; font-size: 11px; letter-spacing: 4px; text-transform: uppercase; margin-bottom: 16px; }
    .order-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
    .order-key { color: #C7C2B7; font-size: 14px; }
    .order-val { color: #F3EBDD; font-size: 14px; }
    .order-total { border-top: 1px solid #6F4E37; padding-top: 12px; margin-top: 12px; }
    .order-total-key { color: #B68B5A; font-size: 14px; letter-spacing: 1px; }
    .order-total-val { color: #B68B5A; font-size: 18px; }
    .divider { border: none; border-top: 1px solid #D6C1A3; margin: 0 48px 32px; }
    .footer { background-color: #2B211B; padding: 32px 48px; text-align: center; }
    .footer-text { color: #6F4E37; font-size: 11px; line-height: 1.8; }
    .footer-link { color: #B68B5A; text-decoration: none; }
  </style>
</head>
<body>
<div class="wrapper">

  <div class="header">
    <div class="logo">Wenu Mapu</div>
    <div class="tagline">Artisanal Body Jewelry</div>
  </div>

  <div class="body-section">
    <h1 class="headline">Your order is confirmed.<br>We are glad it is yours.</h1>
    <p class="body-copy">Thank you. Your piece is now in our hands and we will prepare it with the same care it took to make it. Below is a summary of what you ordered.</p>
  </div>

  <!-- Order summary — WooCommerce dynamic fields -->
  <div class="body-section" style="padding-top: 0;">
    <div class="order-block">
      <div class="order-label">Order summary</div>
      <div class="order-row">
        <span class="order-key">Order</span>
        <span class="order-val">#{{ order_number }}</span>
      </div>
      <div class="order-row">
        <span class="order-key">Item</span>
        <span class="order-val">{{ order_items }}</span>
      </div>
      <div class="order-row">
        <span class="order-key">Ships to</span>
        <span class="order-val">{{ shipping_address }}</span>
      </div>
      <div class="order-row order-total">
        <span class="order-total-key">Total</span>
        <span class="order-total-val">${{ order_total }} USD</span>
      </div>
    </div>
  </div>

  <hr class="divider">

  <div class="body-section" style="padding-top: 0;">
    <p class="body-copy">We will send you a tracking number as soon as your order ships. If you have any questions about your order in the meantime, write to orders@wenumapuonline.com with your order number.</p>
  </div>

  <div class="footer">
    <p class="footer-text">
      Order questions: <a href="mailto:orders@wenumapuonline.com" class="footer-link">orders@wenumapuonline.com</a><br>
      Support: <a href="mailto:support@wenumapuonline.com" class="footer-link">support@wenumapuonline.com</a><br><br>
      <a href="{{ unsubscribe_url }}" class="footer-link">Unsubscribe</a> · wenumapuonline.com
    </p>
  </div>

</div>
</body>
</html>
```

---

### Email 2 — Al despacho (tracking disponible)

**SUBJECT**
```
Your piece is on its way — and how to care for it
```

**PREVIEW TEXT**
```
Tracking: {{tracking_number}} · Aftercare guide inside.
```

**BODY**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Shipped — Wenu Mapu</title>
  <style>
    body { margin: 0; padding: 0; background-color: #F3EBDD; font-family: Georgia, serif; }
    .wrapper { max-width: 600px; margin: 0 auto; background-color: #F3EBDD; }
    .header { background-color: #2B211B; padding: 40px 48px 32px; text-align: center; }
    .logo { color: #B68B5A; font-size: 22px; letter-spacing: 6px; text-transform: uppercase; }
    .tagline { color: #D6C1A3; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; margin-top: 8px; }
    .body-section { padding: 48px 48px 32px; }
    .headline { color: #2B211B; font-size: 24px; line-height: 1.4; margin: 0 0 24px; font-weight: normal; }
    .body-copy { color: #6F4E37; font-size: 16px; line-height: 1.8; margin: 0 0 20px; }
    .tracking-block { background-color: #2B211B; padding: 28px 40px; text-align: center; margin-bottom: 32px; }
    .tracking-label { color: #B68B5A; font-size: 11px; letter-spacing: 4px; text-transform: uppercase; margin-bottom: 10px; }
    .tracking-number { color: #F3EBDD; font-size: 20px; letter-spacing: 4px; margin-bottom: 10px; }
    .tracking-link { color: #B68B5A; font-size: 13px; text-decoration: none; letter-spacing: 1px; }
    .aftercare-section { background-color: #FAF5EE; border: 1px solid #D6C1A3; padding: 32px 40px; margin: 0 48px 32px; }
    .aftercare-headline { color: #2B211B; font-size: 13px; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 20px; }
    .aftercare-item { color: #6F4E37; font-size: 15px; line-height: 1.75; margin-bottom: 12px; padding-left: 16px; border-left: 2px solid #B68B5A; }
    .aftercare-cta { text-align: center; padding: 16px 48px 40px; }
    .aftercare-link { color: #B68B5A; font-size: 13px; letter-spacing: 2px; text-transform: uppercase; text-decoration: none; }
    .footer { background-color: #2B211B; padding: 32px 48px; text-align: center; }
    .footer-text { color: #6F4E37; font-size: 11px; line-height: 1.8; }
    .footer-link { color: #B68B5A; text-decoration: none; }
  </style>
</head>
<body>
<div class="wrapper">

  <div class="header">
    <div class="logo">Wenu Mapu</div>
    <div class="tagline">Artisanal Body Jewelry</div>
  </div>

  <div class="body-section">
    <h1 class="headline">It left our hands today.<br>Now it travels to yours.</h1>
    <p class="body-copy">Your order has shipped. Below you will find your tracking number. Delivery typically takes 3–7 business days depending on your location. Local Truckee area orders may qualify for free local delivery.</p>
  </div>

  <!-- Tracking -->
  <div class="body-section" style="padding-top: 0;">
    <div class="tracking-block">
      <div class="tracking-label">Tracking number</div>
      <div class="tracking-number">{{ tracking_number }}</div>
      <a href="{{ tracking_url }}" class="tracking-link">Track your shipment</a>
    </div>
  </div>

  <!-- Aftercare -->
  <div class="aftercare-section">
    <div class="aftercare-headline">Caring for your piece</div>
    <div class="aftercare-item">Keep metal pieces dry when not wearing. Remove before swimming or bathing.</div>
    <div class="aftercare-item">Silver and bronze will develop a natural patina with wear. This is not damage — it is the material aging. Polish gently with a dry cloth if you prefer a brighter surface.</div>
    <div class="aftercare-item">Wood and organic pieces should not be submerged. Treat occasionally with a neutral oil (jojoba or coconut) applied with a dry cloth.</div>
    <div class="aftercare-item">Store in the cloth pouch included with your order. Keep away from direct sunlight for extended periods.</div>
  </div>

  <div class="aftercare-cta">
    <a href="https://wenumapuonline.com/aftercare" class="aftercare-link">Read the full aftercare guide</a>
  </div>

  <div class="body-section" style="padding-top: 0;">
    <p class="body-copy">Questions about your shipment? Write to aftercare@wenumapuonline.com — we are happy to help.</p>
  </div>

  <div class="footer">
    <p class="footer-text">
      <a href="mailto:aftercare@wenumapuonline.com" class="footer-link">aftercare@wenumapuonline.com</a><br><br>
      <a href="{{ unsubscribe_url }}" class="footer-link">Unsubscribe</a> · wenumapuonline.com
    </p>
  </div>

</div>
</body>
</html>
```

---

### Email 3 — Día 14 post-entrega

**SUBJECT opciones A/B/C**
```
A: How does it feel?
B: Two weeks in — we would love to know
C: We have been thinking about your piece
```

**PREVIEW TEXT**
```
A short question, and a small request if you are willing.
```

**BODY**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Two weeks — Wenu Mapu</title>
  <style>
    body { margin: 0; padding: 0; background-color: #F3EBDD; font-family: Georgia, serif; }
    .wrapper { max-width: 600px; margin: 0 auto; background-color: #F3EBDD; }
    .header { background-color: #2B211B; padding: 40px 48px 32px; text-align: center; }
    .logo { color: #B68B5A; font-size: 22px; letter-spacing: 6px; text-transform: uppercase; }
    .tagline { color: #D6C1A3; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; margin-top: 8px; }
    .body-section { padding: 48px 48px 32px; }
    .headline { color: #2B211B; font-size: 24px; line-height: 1.4; margin: 0 0 24px; font-weight: normal; }
    .body-copy { color: #6F4E37; font-size: 16px; line-height: 1.8; margin: 0 0 20px; }
    .review-block { background-color: #2B211B; padding: 40px 48px; text-align: center; }
    .review-label { color: #D6C1A3; font-size: 14px; line-height: 1.7; margin-bottom: 24px; }
    .review-btn { display: inline-block; border: 1px solid #B68B5A; color: #B68B5A; text-decoration: none; padding: 14px 36px; font-size: 12px; letter-spacing: 3px; text-transform: uppercase; font-family: Georgia, serif; }
    .instagram-note { padding: 32px 48px; }
    .instagram-copy { color: #6F4E37; font-size: 15px; line-height: 1.75; }
    .instagram-handle { color: #B68B5A; text-decoration: none; }
    .footer { background-color: #2B211B; padding: 32px 48px; text-align: center; }
    .footer-text { color: #6F4E37; font-size: 11px; line-height: 1.8; }
    .footer-link { color: #B68B5A; text-decoration: none; }
  </style>
</head>
<body>
<div class="wrapper">

  <div class="header">
    <div class="logo">Wenu Mapu</div>
    <div class="tagline">Artisanal Body Jewelry</div>
  </div>

  <div class="body-section">
    <h1 class="headline">You have had the piece<br>for two weeks now.</h1>
    <p class="body-copy">We hope it has settled in. The first few days with a new piece — feeling its weight, how it moves, how it looks at different moments — are the part we cannot be there for. We are curious how that has gone.</p>
    <p class="body-copy">If something is not right — fit, finish, anything — write to us directly. We will make it right.</p>
    <p class="body-copy">If the piece is exactly what you hoped for, we would be grateful for a short review. It is the most direct way to help other people find what they are looking for.</p>
  </div>

  <!-- Review CTA -->
  <div class="review-block">
    <p class="review-label">It takes less than two minutes, and it means more to us than any paid promotion.</p>
    <a href="{{ review_url }}" class="review-btn">Leave a review</a>
  </div>

  <div class="instagram-note">
    <p class="instagram-copy">If you share the piece on Instagram, tag us at <a href="https://instagram.com/wenumapu" class="instagram-handle">@wenumapu</a>. We repost selectively and always credit the photographer.</p>
  </div>

  <div class="footer">
    <p class="footer-text">
      <a href="mailto:support@wenumapuonline.com" class="footer-link">support@wenumapuonline.com</a><br><br>
      <a href="{{ unsubscribe_url }}" class="footer-link">Unsubscribe</a> · wenumapuonline.com
    </p>
  </div>

</div>
</body>
</html>
```

---

### Email 4 — Día 60 post-entrega

**SUBJECT opciones A/B/C**
```
A: A note from the journal — and one piece we thought of you for
B: Two months later, and something new
C: We wrote something. And we found a piece.
```

**PREVIEW TEXT**
```
A short text from our journal, and a curated recommendation.
```

**BODY**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Journal + curated pick — Wenu Mapu</title>
  <style>
    body { margin: 0; padding: 0; background-color: #F3EBDD; font-family: Georgia, serif; }
    .wrapper { max-width: 600px; margin: 0 auto; background-color: #F3EBDD; }
    .header { background-color: #2B211B; padding: 40px 48px 32px; text-align: center; }
    .logo { color: #B68B5A; font-size: 22px; letter-spacing: 6px; text-transform: uppercase; }
    .tagline { color: #D6C1A3; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; margin-top: 8px; }
    .journal-section { padding: 48px 48px 32px; }
    .journal-label { color: #B68B5A; font-size: 11px; letter-spacing: 4px; text-transform: uppercase; margin-bottom: 20px; }
    .journal-headline { color: #2B211B; font-size: 22px; line-height: 1.4; margin: 0 0 20px; font-weight: normal; }
    .journal-copy { color: #6F4E37; font-size: 16px; line-height: 1.8; margin: 0 0 20px; }
    .journal-link { color: #B68B5A; font-size: 13px; letter-spacing: 2px; text-transform: uppercase; text-decoration: none; }
    .divider { border: none; border-top: 1px solid #D6C1A3; margin: 0 48px 40px; }
    .pick-section { padding: 0 48px 16px; }
    .pick-label { color: #B68B5A; font-size: 11px; letter-spacing: 4px; text-transform: uppercase; margin-bottom: 16px; }
    .pick-copy { color: #6F4E37; font-size: 15px; line-height: 1.75; margin-bottom: 24px; }
    .pick-block { border: 1px solid #D6C1A3; padding: 20px; background-color: #FAF5EE; margin-bottom: 24px; }
    .pick-img { width: 100%; max-height: 240px; object-fit: cover; display: block; margin-bottom: 14px; }
    .pick-name { color: #2B211B; font-size: 16px; margin: 0 0 6px; font-weight: normal; }
    .pick-material { color: #B68B5A; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; margin: 0 0 8px; }
    .pick-price { color: #6F4E37; font-size: 15px; }
    .cta-wrap { text-align: center; padding: 0 48px 48px; }
    .cta-btn { display: inline-block; background-color: #B68B5A; color: #2B211B; text-decoration: none; padding: 16px 40px; font-size: 13px; letter-spacing: 3px; text-transform: uppercase; }
    .footer { background-color: #2B211B; padding: 32px 48px; text-align: center; }
    .footer-text { color: #6F4E37; font-size: 11px; line-height: 1.8; }
    .footer-link { color: #B68B5A; text-decoration: none; }
  </style>
</head>
<body>
<div class="wrapper">

  <div class="header">
    <div class="logo">Wenu Mapu</div>
    <div class="tagline">Artisanal Body Jewelry</div>
  </div>

  <!-- Journal entry -->
  <div class="journal-section">
    <div class="journal-label">From the journal</div>
    <h2 class="journal-headline">On wearing the same piece every day.</h2>
    <p class="journal-copy">There is a particular kind of relationship that forms between a body and a piece of jewelry worn every day — not because you forget to take it off, but because it starts to feel like a property of the body itself. The weight becomes familiar. The way light catches it in the morning becomes a kind of orientation.</p>
    <p class="journal-copy">We think about this when we make something. Not the first day it is worn, but the five hundredth. What does it feel like then? Does it still hold its form? Has it become more itself, or less?</p>
    <p class="journal-copy">Our materials — silver, bronze, copper, wood — are chosen because they answer well over time. They are not finished when they leave us. They are still becoming.</p>
    <a href="https://wenumapuonline.com/journal" class="journal-link">Read more in the journal</a>
  </div>

  <hr class="divider">

  <!-- Curated pick -->
  <div class="pick-section">
    <div class="pick-label">A piece we thought of you for</div>
    <p class="pick-copy">Based on what you ordered, we think this piece belongs near it — a different material, a complementary form.</p>

    <!-- Dynamic block — MailerLite product recommendation or manually set -->
    <div class="pick-block">
      <img src="{{ recommended_product_image }}" alt="{{ recommended_product_name }}" class="pick-img">
      <div class="pick-name">{{ recommended_product_name }}</div>
      <div class="pick-material">{{ recommended_product_material }}</div>
      <div class="pick-price">${{ recommended_product_price }} USD</div>
    </div>
  </div>

  <div class="cta-wrap">
    <a href="{{ recommended_product_url }}" class="cta-btn">See this piece</a>
  </div>

  <div class="footer">
    <p class="footer-text">
      <a href="mailto:support@wenumapuonline.com" class="footer-link">support@wenumapuonline.com</a><br><br>
      <a href="{{ unsubscribe_url }}" class="footer-link">Unsubscribe</a> · wenumapuonline.com
    </p>
  </div>

</div>
</body>
</html>
```

---

## 5. Flow 4 — Journal Newsletter (mensual)

### Estructura del template

```
1. Header — WENU MAPU / Artisanal Body Jewelry
2. Journal entry (600–900 words)
   - Titular sin clickbait, de naturaleza ensayística
   - Cuerpo en prosa: uno o dos materiales, un proceso, una tensión creativa
   - Sin listas, sin bullets, sin "tips"
3. Divider visual
4. The made things (2–3 piezas)
   - Foto + nombre + material + precio + link
5. From the studio (opcional, máximo 3 líneas)
   - Novedades, colecciones entrantes, eventos, pausa de producción
6. Footer — unsubscribe / aliases de contacto
```

**Envío:** primer lunes de cada mes.
**Remitente:** journal@wenumapuonline.com
**Segmentos que reciben:** subscribers + customers (excluyendo wholesale).

---

### Primer envío — Mayo 2026

**SUBJECT opciones A/B/C**
```
A: What bronze remembers
B: The journal, issue 01 — on material and memory
C: Everything we make is also a record
```

**PREVIEW TEXT**
```
Our first journal entry: on bronze, time, and the body as archive.
```

**BODY**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Journal 01 — Wenu Mapu</title>
  <style>
    body { margin: 0; padding: 0; background-color: #F3EBDD; font-family: Georgia, serif; }
    .wrapper { max-width: 600px; margin: 0 auto; background-color: #F3EBDD; }
    .header { background-color: #2B211B; padding: 40px 48px 32px; text-align: center; }
    .logo { color: #B68B5A; font-size: 22px; letter-spacing: 6px; text-transform: uppercase; }
    .issue-label { color: #6F4E37; font-size: 10px; letter-spacing: 5px; text-transform: uppercase; margin-top: 10px; }
    .journal-section { padding: 48px 48px 40px; }
    .journal-date { color: #B68B5A; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 20px; }
    .journal-headline { color: #2B211B; font-size: 26px; line-height: 1.35; margin: 0 0 28px; font-weight: normal; }
    .journal-copy { color: #6F4E37; font-size: 16px; line-height: 1.85; margin: 0 0 20px; }
    .divider { border: none; border-top: 1px solid #D6C1A3; margin: 40px 48px; }
    .made-section { padding: 0 48px 16px; }
    .made-label { color: #2B211B; font-size: 11px; letter-spacing: 5px; text-transform: uppercase; margin-bottom: 28px; }
    .piece-block { margin-bottom: 32px; border-bottom: 1px solid #D6C1A3; padding-bottom: 28px; }
    .piece-img { width: 100%; max-height: 220px; object-fit: cover; display: block; margin-bottom: 14px; }
    .piece-name { color: #2B211B; font-size: 17px; margin: 0 0 6px; font-weight: normal; }
    .piece-material { color: #B68B5A; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; margin: 0 0 8px; }
    .piece-price { color: #6F4E37; font-size: 15px; margin: 0 0 12px; }
    .piece-link { color: #B68B5A; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; text-decoration: none; }
    .studio-section { background-color: #2B211B; padding: 32px 48px; }
    .studio-label { color: #B68B5A; font-size: 11px; letter-spacing: 4px; text-transform: uppercase; margin-bottom: 14px; }
    .studio-copy { color: #C7C2B7; font-size: 14px; line-height: 1.75; margin: 0; }
    .footer { background-color: #2B211B; border-top: 1px solid #3A2E26; padding: 32px 48px; text-align: center; }
    .footer-text { color: #6F4E37; font-size: 11px; line-height: 1.8; }
    .footer-link { color: #B68B5A; text-decoration: none; }
  </style>
</head>
<body>
<div class="wrapper">

  <div class="header">
    <div class="logo">Wenu Mapu</div>
    <div class="issue-label">The journal · Issue 01 · May 2026</div>
  </div>

  <!-- Journal entry -->
  <div class="journal-section">
    <div class="journal-date">May 2026</div>
    <h1 class="journal-headline">What bronze remembers.</h1>

    <p class="journal-copy">Bronze is older than any jeweler's tradition we could claim. It was the material of tools before it was the material of ornament, which means there is something inherently functional in it — a practicality that goes below the surface.</p>

    <p class="journal-copy">When we work with bronze, the first thing we notice is the weight. It is heavier than it looks. A small plug in bronze has a presence that silver at the same gauge does not. This is not better or worse — it is different information. Weight is information. The body reads it.</p>

    <p class="journal-copy">What we find most interesting about bronze is what it does over months. Unlike silver, which oxidizes slowly and evenly, bronze changes in a way that is specific to the person wearing it. Body chemistry — warmth, acidity, moisture — accelerates the patina in some areas and slows it in others. Two people wearing identical pieces will, after six months, have two different objects.</p>

    <p class="journal-copy">We think that is worth naming. Most jewelry is designed to resist time — to maintain the same appearance across years. We are interested in the other possibility: a piece that records its own history of being worn. Not because it degrades, but because it deepens.</p>

    <p class="journal-copy">The bronze pieces in our current collection are made from recycled casting bronze, worked cold and finished by hand. We do not apply any sealants or protective coatings — that would interrupt the process we just described. What you receive is material in its most direct form. It will change. That is the point.</p>
  </div>

  <hr class="divider">

  <!-- The made things -->
  <div class="made-section">
    <div class="made-label">The made things</div>

    <div class="piece-block">
      <img src="https://wenumapuonline.com/wp-content/uploads/bronze-plug-pair.jpg" alt="Bronze plug pair" class="piece-img">
      <div class="piece-name">Plug pair — cold-worked bronze</div>
      <div class="piece-material">Bronze · Available in 8mm, 10mm, 12mm</div>
      <div class="piece-price">$44 USD</div>
      <a href="https://wenumapuonline.com/shop/bronze-plug-pair" class="piece-link">View piece</a>
    </div>

    <div class="piece-block">
      <img src="https://wenumapuonline.com/wp-content/uploads/silver-septum.jpg" alt="Silver septum" class="piece-img">
      <div class="piece-name">Septum ring — silver 950</div>
      <div class="piece-material">Silver 950 · Handformed · Single gauge</div>
      <div class="piece-price">$68 USD</div>
      <a href="https://wenumapuonline.com/shop/silver-septum" class="piece-link">View piece</a>
    </div>

  </div>

  <!-- From the studio -->
  <div class="studio-section">
    <div class="studio-label">From the studio</div>
    <p class="studio-copy">We are building toward a small organic collection — wood and stone plugs in irregular forms. No release date yet. If you want to be notified first, reply to this email and we will add you to that list.</p>
  </div>

  <div class="footer">
    <p class="footer-text">
      Journal: <a href="mailto:journal@wenumapuonline.com" class="footer-link">journal@wenumapuonline.com</a><br>
      Shop: <a href="https://wenumapuonline.com/shop" class="footer-link">wenumapuonline.com/shop</a><br><br>
      <a href="{{ unsubscribe_url }}" class="footer-link">Unsubscribe</a> · You are receiving this because you subscribed to the Wenu Mapu journal.
    </p>
  </div>

</div>
</body>
</html>
```

---

## 6. B2B Wholesale Outreach — Cold pitch a piercing studios

**FROM:** wholesale@wenumapuonline.com
**A:** Studio manager / buyer (piercing studio premium)

**SUBJECT opciones A/B**
```
A: Wholesale inquiry — Wenu Mapu artisanal body jewelry
B: Stocking handmade body jewelry — a note from Wenu Mapu
```

**PREVIEW TEXT**
```
Small-batch artisanal plugs, tunnels, and septums for premium studios.
```

**BODY (plain-text-first, HTML wrapper mínimo)**

```
Subject: Wholesale inquiry — Wenu Mapu artisanal body jewelry

Hello [Studio Name],

My name is [Name] and I make artisanal body jewelry under the name Wenu Mapu. I am reaching out because [Studio Name] is exactly the kind of environment where our pieces belong.

We make plugs, tunnels, septums, hangers, and organic forms by hand in small quantities, using silver 950, bronze, copper, wood, and stone. Every piece is made individually — no mold production runs. Our current retail range runs from $44 to $220 USD.

We offer wholesale accounts to a small number of studios. What that looks like in practice:

— Minimum first order: $300 USD wholesale
— Typical retail margin: 2.2x–2.5x
— Lead time: 2–3 weeks for initial stock order
— No exclusivity required
— We do not wholesale to platforms or mass distributors

We have a lookbook and a sample kit available on request. The sample kit ($65 USD, credited toward your first order) includes six pieces across three material families — enough to show clients the range of weight, finish, and texture.

If this feels like a fit, I would be glad to set up a short call or answer questions by email. You can also request the lookbook directly by replying here.

Thank you for the time.

[Signature]
Wenu Mapu
wholesale@wenumapuonline.com
wenumapuonline.com
+1 (408) 500-6211
```

---

## 7. Setup Tecnico

### 7.1 DNS — Estado y registros necesarios

**Dominio:** wenumapuonline.com (Cloudflare, DMARC activo)

#### SPF
Verificar que el registro SPF actual incluya los servidores de MailerLite. El registro resultante debe verse así:

```
TYPE: TXT
NAME: @
VALUE: v=spf1 include:_spf.mlsend.com include:spf.protection.outlook.com ~all
```
> Nota: Si HostGator también envía correo transaccional (WooCommerce), añadir `include:_spf.hostgator.com` antes del `~all`. Consolidar todo en un solo registro TXT; múltiples registros SPF causan fallo.

#### DKIM — MailerLite
MailerLite provee dos registros CNAME al activar el dominio personalizado:

```
TYPE: CNAME
NAME: mlkey1._domainkey.wenumapuonline.com
VALUE: [proporcionado por MailerLite en Account > Domains]

TYPE: CNAME
NAME: mlkey2._domainkey.wenumapuonline.com
VALUE: [proporcionado por MailerLite en Account > Domains]
```
> En Cloudflare: crear con proxy OFF (nube gris). MailerLite requiere resolución DNS directa para validar DKIM.

#### DMARC — Ya activo
Confirmar que la política incluya `rua` (Cloudflare DMARC Management ya provee esto). La política mínima recomendada:

```
TYPE: TXT
NAME: _dmarc
VALUE: v=DMARC1; p=quarantine; rua=mailto:dmarc@wenumapuonline.com; pct=100
```
> Escalar a `p=reject` después de confirmar alineación SPF + DKIM por al menos 2 semanas.

#### Return-Path personalizado (opcional, mejora deliverability)
```
TYPE: CNAME
NAME: bounce.wenumapuonline.com
VALUE: [proporcionado por MailerLite]
```

---

### 7.2 Integración WooCommerce → MailerLite

**Plugin:** WooCommerce MailerLite (oficial, gratuito en WordPress.org).

**Pasos de configuración:**

1. Instalar plugin en WooCommerce > Plugins.
2. Conectar con API key de MailerLite (Account > Integrations > Developer API).
3. En plugin settings, mapear:

```
Nuevo suscriptor (opt-in checkout) → Grupo: Subscribers
Pedido completado (status: processing) → Grupo: Customers
Pedido completado (status: processing) → Trigger automation: Post-Purchase Flow
Carrito abandonado (require WC Abandoned Cart plugin) → Trigger automation: Abandoned Cart Flow
```

4. **Campos custom a sincronizar desde WooCommerce:**

| Campo WooCommerce | Campo MailerLite | Uso |
|---|---|---|
| `billing_email` | `email` | Identificador |
| `billing_first_name` | `name` | Personalización |
| `order_total` | `last_order_value` | Segmentación LTV |
| `order_count` | `total_orders` | Segmentación frecuencia |
| `product_categories` | `categories_purchased` | Recomendaciones |
| `order_date` | `last_purchase_date` | Automatizaciones time-based |

5. Para el carrito abandonado: instalar plugin adicional **WooCommerce Recover Abandoned Cart** (gratuito) o activar la función nativa en WooCommerce 9.0+. Configurar el webhook para que dispare el grupo `Abandoned Cart` en MailerLite a las 30 minutos de inactividad.

---

### 7.3 Segmentación inicial en MailerLite

Crear tres grupos desde el inicio. No usar tags sueltos — los grupos permiten exclusiones limpias en automations y broadcasts.

```
GRUPO: Subscribers
Definición: suscriptores sin compra registrada
Fuente: formulario web, opt-in checkout guest
Reciben: Welcome Series, Journal Newsletter

GRUPO: Customers
Definición: compradores con al menos 1 pedido completado
Fuente: WooCommerce sync automático
Reciben: Post-Purchase Flow, Journal Newsletter, campannas de retención
Excluir de: Welcome Series (ya pasaron por esa etapa)

GRUPO: Wholesale
Definición: contactos B2B (studios, distribuidores)
Fuente: formulario wholesale manual o tag en pedido
Reciben: comunicaciones B2B exclusivas
Excluir de: Welcome Series, Post-Purchase Flow consumer
```

**Campos de segmentación adicionales para fase 2 (post-lanzamiento):**

- `total_orders >= 2` → segmento Repeat Customers (campaña loyalty)
- `last_purchase_date > 120 days` → segmento At-Risk (reactivación)
- `categories_purchased contains organic` → segmento Organic affinity (colección madera/piedra)
- `last_order_value >= 180` → segmento High-ticket (custom order outreach prioritario)

---

*Fuente de marca: [[brand/MARCA-maestro]]*
*Generado: 2026-05-11*
