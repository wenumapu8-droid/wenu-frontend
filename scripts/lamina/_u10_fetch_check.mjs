#!/usr/bin/env node
// ¿El dev server sirve los grupos de arte nuevos de Paneles.astro?
const r = await fetch("http://localhost:4399/kodex/lamina/u10-commons/");
const html = await r.text();
console.log("status", r.status);
console.log("u10p-arte:", (html.match(/u10p-arte/g) ?? []).length);
console.log("u10p-mano-a:", (html.match(/u10p-mano-a/g) ?? []).length);
