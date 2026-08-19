// @ts-check
/**
 * KODEX-∞ · configuración de build aislada para SOUL WEAVER.
 *
 * Tres agentes construyen la misma rama a la vez y `astro build` limpia
 * y reescribe dist/ entero: el que llega segundo se encuentra los chunks
 * del primero a medio borrar y el build revienta con ERR_MODULE_NOT_FOUND.
 * Cada lámina con su outDir y su puerto y el paralelismo deja de ser una
 * colisión. Mismo precedente que dist-forge/ y dist-vo/.
 */
import base from './astro.config.mjs';
import { defineConfig } from 'astro/config';

export default defineConfig({ ...base, outDir: './dist-sw' });
