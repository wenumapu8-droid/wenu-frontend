import { raizLamina } from "./raiz";
/**
 * KODEX-∞ · EL ESCALADOR — la lámina entra en cualquier pantalla
 *
 * Cada lámina se dibuja al tamaño exacto de su referencia (1122×1402,
 * 1536×1024, el que sea) y se escala entera para caber en el viewport.
 * `100vw / 1122` en CSS da una LONGITUD y `scale()` quiere un NÚMERO, así que
 * esto vive en JS.
 *
 * Por qué existe como pieza del kit: el mismo bloque estaba copiado a mano en
 * las láminas viejas (u03, u07, u09…) y las nueve del lote de Drive nacieron
 * SIN él — en un teléfono desbordaban 732 px y la lámina se veía por la
 * esquina. Es la lección de siempre: lo que se copia a mano en cada archivo,
 * tarde o temprano falta en el que importa.
 *
 * Lee el tamaño real del propio `.lam` (style width/height), así que sirve
 * para láminas verticales y apaisadas sin parámetros.
 *
 * Uso, al final del <script> de la lámina:
 *   import { montarEscala } from "../../../components/kodex/lamina/kit/escala";
 *   montarEscala();
 */
export function montarEscala(): void {
  const lam = raizLamina();
  if (!lam) return;
  const W = lam.offsetWidth || parseFloat(lam.style.width) || 1122;
  const H = lam.offsetHeight || parseFloat(lam.style.height) || 1402;
  const ajustar = () => {
    const k = Math.min(innerWidth / W, innerHeight / H);
    lam.style.transform = `scale(${k})`;
    /* centrada horizontal cuando sobra ancho (desktop con lámina vertical) */
    lam.style.marginLeft = `${Math.max(0, (innerWidth - W * k) / 2)}px`;
    document.body.style.height = `${H * k}px`;
  };
  ajustar();
  addEventListener("resize", ajustar, { passive: true });
}
