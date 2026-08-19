// @ts-check
/**
 * KODEX-∞ · configuración de build aislada para GENESIS CRADLE.
 *
 * Varios agentes construyen la misma rama a la vez y `astro build` limpia
 * y reescribe dist/ entero: el que llega segundo se encuentra los chunks
 * del primero a medio borrar y revienta con ERR_MODULE_NOT_FOUND (pasó en
 * la vuelta 2 de esta lámina). Cada lámina con su outDir y su puerto y el
 * paralelismo deja de ser una colisión. Mismo precedente que dist-sw/,
 * dist-forge/ y dist-vo/.
 */
import base from './astro.config.mjs';
import { defineConfig } from 'astro/config';

export default defineConfig({ ...base, outDir: './dist-gc' });
