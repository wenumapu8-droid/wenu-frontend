import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const baseURL = process.env.KODEX_PREVIEW_URL || 'http://127.0.0.1:4321';
const outputDir = path.resolve('artifacts/kodex-browser-evidence/holocore-webgl-toroidal');
await fs.mkdir(outputDir, { recursive: true });
const browser = await chromium.launch({ headless: true });
const report = { baseURL, generatedAt: new Date().toISOString(), acceptance: [], errors: [] };
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const fail = (name, error) => { const message = `${name}: ${String(error?.stack || error?.message || error)}`; report.errors.push(message); report.acceptance.push({ name, pass:false, error:message }); };

async function navigate(page) {
  const response = await page.goto(new URL('/kodex/lab/holocore-webgl-toroidal/', baseURL).toString(), { waitUntil:'domcontentloaded', timeout:30_000 });
  assert(response?.ok(), `route returned ${response?.status()}`);
  await page.locator('[data-kdx-webgl-source][data-shader-variant="toroidal"]').waitFor({ state:'visible', timeout:10_000 });
  await page.waitForFunction(() => document.querySelector('[data-kdx-webgl-source]')?.dataset.state === 'stable field');
  await page.waitForTimeout(260);
}

async function fingerprint(page) {
  return page.locator('[data-webgl-canvas]').evaluate(canvas => {
    const data = canvas.toDataURL('image/png'); let hash = 2166136261; const stride = Math.max(1, Math.floor(data.length / 12000));
    for (let i=0;i<data.length;i+=stride){hash ^= data.charCodeAt(i); hash = Math.imul(hash,16777619);} return String(hash>>>0);
  });
}

async function metrics(page) {
  return page.evaluate(() => {
    const pageRoot=document.querySelector('.torus-page'); const root=document.querySelector('[data-kdx-webgl-source]'); const canvas=document.querySelector('[data-webgl-canvas]'); const viewport=root?.querySelector('.kdx-webgl-source__viewport');
    const pr=pageRoot?.getBoundingClientRect(); const vr=viewport?.getBoundingClientRect();
    return { innerWidth,innerHeight,scrollWidth:document.documentElement.scrollWidth,scrollHeight:document.documentElement.scrollHeight,bodyScrollHeight:document.body.scrollHeight,pageHeight:pr?.height??0,viewportWidth:vr?.width??0,viewportHeight:vr?.height??0,canvasWidth:canvas?.clientWidth??0,canvasHeight:canvas?.clientHeight??0,backingWidth:canvas?.width??0,backingHeight:canvas?.height??0,rendererKind:root?.dataset.rendererKind??null,rendererMode:root?.dataset.rendererMode??null,reducedMotion:root?.dataset.reducedMotion??null,temporalContract:root?.dataset.temporalContract??null,seamlessLoopClaim:root?.dataset.seamlessLoopClaim??null,variant:root?.dataset.shaderVariant??null,frameCount:Number(canvas?.dataset.frameCount||0),shaderTime:canvas?.dataset.shaderTime??null,state:root?.dataset.state??null,robots:document.querySelector('meta[name="robots"]')?.getAttribute('content')??null};
  });
}

function assertBounded(v,name){
  assert(Math.abs(v.pageHeight-v.innerHeight)<=2,`${name}: page not 100dvh`); assert(v.scrollWidth<=v.innerWidth+1,`${name}: horizontal overflow`); assert(v.scrollHeight<=v.innerHeight+2,`${name}: document overflow`); assert(v.bodyScrollHeight<=v.innerHeight+2,`${name}: body overflow`); assert(v.viewportWidth>100&&v.viewportHeight>100,`${name}: viewport collapsed`); assert(Math.abs(v.canvasWidth-v.viewportWidth)<=2,`${name}: canvas width mismatch`); assert(Math.abs(v.canvasHeight-v.viewportHeight)<=2,`${name}: canvas height mismatch`); assert(v.backingWidth>0&&v.backingHeight>0,`${name}: empty backing store`); assert(v.rendererKind==='webgl-shader',`${name}: wrong renderer kind`); assert(v.rendererMode==='webgl-source',`${name}: WebGL source mode unavailable`); assert(v.variant==='toroidal',`${name}: wrong variant`); assert(v.temporalContract==='ambient_unclosed',`${name}: temporal contract changed`); assert(v.seamlessLoopClaim==='false',`${name}: false seam claim lost`); assert(v.state==='stable field',`${name}: field did not stabilize`); assert(v.robots?.includes('noindex'),`${name}: missing noindex`);
}

async function living(name, viewport, mobile=false){
  const context=await browser.newContext({ viewport, isMobile:mobile, hasTouch:mobile, colorScheme:'dark' }); const page=await context.newPage();
  try{await navigate(page);const before=await fingerprint(page);const beforeM=await metrics(page);await page.waitForTimeout(760);const after=await fingerprint(page);const v=await metrics(page);assertBounded(v,name);assert(before!==after,`${name}: field did not advance`);assert(v.frameCount>beforeM.frameCount,`${name}: frame count did not advance`);const screenshot=`${name}.png`;await page.screenshot({path:path.join(outputDir,screenshot),fullPage:false});report.acceptance.push({name,pass:true,before,after,metrics:v,screenshot});}catch(e){fail(name,e);}finally{await context.close();}
}

async function reduced(){
  const name='toroidal-reduced-1280'; const context=await browser.newContext({viewport:{width:1280,height:800},reducedMotion:'reduce',colorScheme:'dark'}); const page=await context.newPage();
  try{await navigate(page);const before=await fingerprint(page);const m1=await metrics(page);await page.waitForTimeout(760);const after=await fingerprint(page);const m2=await metrics(page);assertBounded(m2,name);assert(before===after,`${name}: reduced-motion frame moved`);assert(m1.frameCount===m2.frameCount,`${name}: frame count advanced`);assert(m1.shaderTime===m2.shaderTime,`${name}: shader time advanced`);const screenshot=`${name}.png`;await page.screenshot({path:path.join(outputDir,screenshot),fullPage:false});report.acceptance.push({name,pass:true,fingerprint:before,metrics:m2,screenshot});}catch(e){fail(name,e);}finally{await context.close();}
}

await living('toroidal-desktop-1440',{width:1440,height:900});
await living('toroidal-mobile-390',{width:390,height:844},true);
await reduced();
await browser.close();
await fs.writeFile(path.join(outputDir,'report.json'),`${JSON.stringify(report,null,2)}\n`);
if(report.errors.length){for(const error of report.errors)console.error(error);process.exitCode=1;}else{console.log('Toroidal WebGL browser evidence passed.');}
