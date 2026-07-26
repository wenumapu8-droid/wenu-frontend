// KODEX−∞ · shared page engine for the paginated codex (cover + folios).
// Lifted from the original monolith landing script; every subsystem guards on
// element existence, so each page activates only what its markup contains.
// Book additions: fixed per-folio HUD stage, scroll-through page turn,
// arrow-key page turn, and the +∞ white inversion at the end of the journey.

import { initKxAudio } from './kodex-audio.js';
import { record } from '../kodex/return/memory.js';

export function initKx() {
  const root = document.querySelector('[data-kx]');
  if (!root) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // record the journey — every page visited feeds the visitor's RETURN specimen
  try { record({ type: 'view', work: location.pathname }); } catch (e) {}

  // generative frequencies — a musical scene per level (♪ button in the status bar)
  initKxAudio(root);

  // SLIDE DECK — no scroll: plates stack in depth, buttons dive inward
  const deck = root.querySelector('[data-deck]');

  // reveals + frame scan (IO on scrolling pages; slide-activation in deck mode)
  const io = new IntersectionObserver((es) => {
    es.forEach((e) => { if (e.isIntersecting){ e.target.classList.add('kx-in'); io.unobserve(e.target); } });
  }, { threshold: 0.18 });
  if (!deck) root.querySelectorAll('[data-reveal], .kx-frame').forEach((el) => io.observe(el));

  // CHAPTER TERMINALS — type the data fragment out like a machine reading
  const typeTerm = (el) => {
    const txt = (el.getAttribute('data-term') || '').replace(/\\n/g, '\n');
    if (reduce) { el.textContent = txt; return; }
    el.textContent = ''; el.classList.add('kx-typing');
    let i = 0;
    const step = () => {
      if (i >= txt.length) { setTimeout(() => el.classList.remove('kx-typing'), 900); return; }
      const c = txt[i++]; el.textContent += c;
      setTimeout(step, c === '\n' ? 220 : 18 + Math.random() * 34);
    };
    step();
  };
  if (!deck) {
    const tio = new IntersectionObserver((es) => {
      es.forEach((e) => { if (!e.isIntersecting) return; tio.unobserve(e.target); typeTerm(e.target); });
    }, { threshold: 0.6 });
    root.querySelectorAll('.kx-chapter__term[data-term]').forEach((el) => tio.observe(el));
  }

  // LIVING ARCHIVE — works with many readings change on their own, like a gif.
  if (!reduce) {
    const src = (f) => '/img/kodex/' + (f.startsWith('disco-') ? 'disco' : 'archive') + '/' + f + '.jpg';
    root.querySelectorAll('.kx-cell[data-files]').forEach((cell, ci) => {
      const files = (cell.getAttribute('data-files') || '').split(',').filter(Boolean);
      if (files.length < 2) return;
      const img = cell.querySelector('img');
      if (!img) return;
      img.style.transition = 'opacity .44s ease';
      let i = 0, iv = 0, pre = false;
      const preload = () => { if (pre) return; pre = true; files.forEach((f) => { const im = new Image(); im.src = src(f); }); };
      const advance = () => {
        i = (i + 1) % files.length;
        img.style.opacity = '0';
        setTimeout(() => { img.src = src(files[i]); img.style.opacity = ''; }, 440);
      };
      const period = 2600 + (ci % 5) * 560 + Math.floor(Math.random() * 520);
      new IntersectionObserver((es) => es.forEach((e) => {
        if (e.isIntersecting) { if (!iv) { preload(); iv = setInterval(advance, period); } }
        else if (iv) { clearInterval(iv); iv = 0; }
      }), { threshold: 0.2 }).observe(cell);
    });
  }

  // reticle cursor
  const cur = root.querySelector('[data-cursor]');
  if (cur && matchMedia('(hover:hover)').matches){
    let x=innerWidth/2, y=innerHeight/2, tx=x, ty=y;
    addEventListener('mousemove', (e)=>{ tx=e.clientX; ty=e.clientY; }, {passive:true});
    const loop=()=>{ x+=(tx-x)*.28; y+=(ty-y)*.28; cur.style.transform=`translate(${x}px,${y}px)`; requestAnimationFrame(loop); };
    loop();
    root.querySelectorAll('[data-spec], a, button').forEach((el)=>{
      el.addEventListener('mouseenter',()=>cur.classList.add('kx-cursor--hot'));
      el.addEventListener('mouseleave',()=>cur.classList.remove('kx-cursor--hot'));
    });
  }

  // ── THE SIGNAL — master key ──
  const btn=root.querySelector('[data-signal]'), lab=root.querySelector('[data-signal-label]');
  const decode=root.querySelector('[data-decode]');
  let signalOn=false;
  try { signalOn = sessionStorage.getItem('kx-signal') === '1'; } catch (e) {}
  const setSignal=(on)=>{
    signalOn=on; window.__kxSignal=on;
    try { sessionStorage.setItem('kx-signal', on ? '1' : '0'); } catch (e) {}
    btn?.setAttribute('aria-pressed',String(on));
    root.classList.toggle('kx--signal', on);
    if(lab) lab.textContent=on?'SIGNAL · ACTIVE':'SIGNAL · LATENT';
    if(decode) decode.textContent=on?'DECODING · Ω′ = R[ W( Γ( O( Δ(Ω) ) ) ) ]':'';
  };
  setSignal(signalOn); // the key travels with you across the folios
  btn?.addEventListener('click',()=>setSignal(!signalOn));
  addEventListener('keydown',(e)=>{ if(e.key==='s'||e.key==='S'){ if(document.activeElement===document.body||!document.activeElement) setSignal(!signalOn); } });

  // ── STAGES · timeline · astronomy HUD ──
  // Cover interpolates across the journey; each folio pins its own stage
  // (data-stage-idx / data-stage-name / data-stage-col on [data-kx]).
  const STAGES=[
    {name:'UMBRAL',col:[207,199,182]},{name:'PROLOGUE',col:[207,199,182]},
    {name:'DESCENT',col:[150,160,175]},{name:'ARCHIVE',col:[207,199,182]},
    {name:'MACHINE',col:[201,168,76]},{name:'COSMOLOGY',col:[224,85,155]},
    {name:'RETURN',col:[207,199,182]},
  ];
  const TOTAL = '07';
  const fixIdx = parseInt(root.getAttribute('data-stage-idx') || '', 10);
  const fixName = root.getAttribute('data-stage-name');
  const fixCol = (root.getAttribute('data-stage-col') || '').split(',').map(Number);
  const hasFix = !isNaN(fixIdx);
  const segs=[...root.querySelectorAll('.kx-seg > i')], n=segs.length;
  const coord=root.querySelector('[data-coord]');
  const aStage=root.querySelector('[data-astro-stage]'), aName=root.querySelector('[data-astro-name]');
  const aRa=root.querySelector('[data-astro-ra]'), aDec=root.querySelector('[data-astro-dec]');
  const aPhi=root.querySelector('[data-astro-phi]'), aCode=root.querySelector('[data-astro-code]');
  const lerp=(a,b,t)=>a+(b-a)*t;
  // progress: slide fraction in deck mode, window scroll otherwise
  let deckP=0;
  let P=0, tunnelCol=hasFix && fixCol.length===3 ? fixCol : [207,199,182];
  const onScroll=()=>{
    if (deck) { P = deckP; }
    else {
      const max = document.documentElement.scrollHeight - innerHeight;
      P = max>0 ? scrollY/max : 0;
    }
    for(let i=0;i<n;i++){ segs[i].style.width=(Math.min(1,Math.max(0,P*n-i))*100)+'%'; }
    if(coord) coord.textContent=(P*100).toFixed(2).padStart(5,'0');
    if(hasFix){
      if(aStage) aStage.textContent=String(fixIdx).padStart(2,'0')+' / '+TOTAL;
      if(aName && fixName) aName.textContent=fixName;
    } else {
      const f=P*(STAGES.length-1), si=Math.min(STAGES.length-1,Math.floor(f)), sj=Math.min(STAGES.length-1,si+1), tt=f-si;
      const A=STAGES[si].col, B=STAGES[sj].col;
      tunnelCol=[lerp(A[0],B[0],tt),lerp(A[1],B[1],tt),lerp(A[2],B[2],tt)];
      if(aStage) aStage.textContent=String(si+1).padStart(2,'0')+' / '+TOTAL;
      if(aName) aName.textContent=STAGES[si].name;
    }
    if(aRa) aRa.textContent=String(Math.floor(P*23)).padStart(2,'0')+'h'+String(Math.floor((P*600)%60)).padStart(2,'0')+'m';
    if(aDec) aDec.textContent=(P<.5?'-':'+')+String(Math.floor(Math.abs(P-.5)*178)).padStart(2,'0')+'°';
    if(aPhi) aPhi.textContent=((P*1.6180339887)%1).toFixed(3);
    if(aCode) aCode.textContent='0x'+Math.floor(P*65535).toString(16).toUpperCase().padStart(4,'0');
  };
  onScroll(); addEventListener('scroll', onScroll, {passive:true});

  // ── THE DECK — slides advanced by BUTTONS. NEXT dives INTO the codex:
  // the current plate swells past you, the next emerges from the depth.
  // At the last plate, NEXT turns to the next folio. From the cover's index
  // ring you can jump anywhere; #hash deep-links land on the right plate.
  const nextUrl = root.getAttribute('data-next-url');
  const prevUrl = root.getAttribute('data-prev-url');
  const overlaysOpen = () => document.body.style.overflow === 'hidden';
  let turning = false;
  const turn = (url) => {
    if (!url || turning) return; turning = true;
    root.style.transition = 'opacity .55s ease'; root.style.opacity = '0';
    setTimeout(() => { location.href = url; }, 480);
  };
  if (deck) {
    const slides = [...deck.querySelectorAll('.kx-slide')];
    const bNext = root.querySelector('[data-deck-next]');
    const bPrev = root.querySelector('[data-deck-prev]');
    const idxEl = root.querySelector('[data-deck-idx]');
    const totEl = root.querySelector('[data-deck-total]');
    const nextLabel = root.getAttribute('data-next-label') || 'CONTINUE ›';
    const seen = new WeakSet();
    let cur = 0;
    if (totEl) totEl.textContent = String(slides.length).padStart(2, '0');
    const activate = (i) => {
      cur = Math.max(0, Math.min(slides.length - 1, i));
      slides.forEach((s, k) => {
        s.classList.toggle('kx-active', k === cur);
        s.classList.toggle('kx-passed', k < cur);
      });
      if (idxEl) idxEl.textContent = String(cur + 1).padStart(2, '0');
      slides[cur].scrollTop = 0;
      deckP = slides.length > 1 ? cur / (slides.length - 1) : 1;
      onScroll();
      const s = slides[cur];
      const rs = s.querySelectorAll('[data-reveal], .kx-frame');
      rs.forEach((el, k) => { el.classList.remove('kx-in'); void el.offsetWidth; setTimeout(() => el.classList.add('kx-in'), 90 + k * 110); });
      if (!seen.has(s)) { seen.add(s); s.querySelectorAll('.kx-chapter__term[data-term]').forEach(typeTerm); }
      const last = cur === slides.length - 1;
      // first pages (cover + index) advance by their own doors / the radar — no NEXT button there
      if (bNext) { bNext.textContent = last ? nextLabel : 'NEXT ›'; bNext.classList.toggle('kx-deckbar--turn', last); bNext.style.visibility = (/\/kodex\/?$/.test(location.pathname) && cur <= 1 && !last) ? 'hidden' : 'visible'; }
      if (bPrev) bPrev.style.visibility = (cur === 0 && !prevUrl) ? 'hidden' : 'visible';
    };
    const goNext = () => { if (cur < slides.length - 1) activate(cur + 1); else if (nextUrl) turn(nextUrl); };
    const goPrev = () => { if (cur > 0) activate(cur - 1); else if (prevUrl) turn(prevUrl); };
    bNext?.addEventListener('click', goNext);
    bPrev?.addEventListener('click', goPrev);
    addEventListener('keydown', (e) => {
      if (overlaysOpen()) return;
      if (e.key === 'ArrowRight') goNext();
      else if (e.key === 'ArrowLeft') goPrev();
    });
    // touch: swipe advances plates (still button-first UX, swipe is a courtesy)
    let tx0 = 0;
    addEventListener('touchstart', (e) => { tx0 = e.touches[0].clientX; }, { passive: true });
    addEventListener('touchend', (e) => {
      if (overlaysOpen() || turning) return;
      const dx = tx0 - e.changedTouches[0].clientX;
      if (Math.abs(dx) > 60) (dx > 0 ? goNext() : goPrev());
    }, { passive: true });
    // #hash deep-link (e.g. /kodex/#index) lands on the plate holding that id
    let start = 0;
    if (location.hash) {
      const tgt = deck.querySelector(location.hash.replace(/[^#\w-]/g, ''));
      const si = tgt ? slides.findIndex((s) => s.contains(tgt)) : -1;
      if (si >= 0) start = si;
    }
    activate(start);
  } else {
    addEventListener('keydown', (e) => {
      if (overlaysOpen()) return;
      if (e.key === 'ArrowRight' && nextUrl) turn(nextUrl);
      else if (e.key === 'ArrowLeft' && prevUrl) turn(prevUrl);
    });
  }

  // ── +∞ — THE WHITE — when the whole codex has been seen, it turns to light ──
  const inf = root.querySelector('[data-plusinf]');
  if (inf) {
    new IntersectionObserver((es) => es.forEach((e) => {
      root.classList.toggle('kx--white', e.isIntersecting && e.intersectionRatio >= 0.35);
    }), { threshold: [0, 0.35, 0.7] }).observe(inf);
  }

  // TUNNEL flight — starfield rushing from the vanishing point + receding rings.
  const tcanvas=root.querySelector('[data-tunnel]');
  if(tcanvas && !reduce){
    const tx=tcanvas.getContext('2d'); let W=0,Hh=0; const dpr=Math.min(2,devicePixelRatio||1);
    const NST=220, stars=[]; let lastY=(deck?deckP*600:scrollY), boost=0, rot=0, t0=0;
    const resize=()=>{ W=tcanvas.width=Math.floor(innerWidth*dpr); Hh=tcanvas.height=Math.floor(innerHeight*dpr); tcanvas.style.width=innerWidth+'px'; tcanvas.style.height=innerHeight+'px'; };
    resize(); addEventListener('resize', resize, {passive:true});
    for(let i=0;i<NST;i++) stars.push({a:Math.random()*Math.PI*2, s:0.4+Math.random()*1.3, z:Math.random()});
    const frame=(ts)=>{
      const dt=Math.min(2.5,(ts-t0)/16.7)||1; t0=ts;
      const posNow=(deck?deckP*600:scrollY);
      boost += (Math.min(60,Math.abs(posNow-lastY))-boost)*0.08; lastY=posNow;
      const cx=W/2, cy=Hh/2, maxR=Math.hypot(cx,cy);
      tx.globalCompositeOperation='source-over';
      tx.fillStyle='rgba(0,0,0,'+(0.16+boost*0.004)+')';
      tx.fillRect(0,0,W,Hh);
      const c = window.__kxSignal
        ? [lerp(tunnelCol[0],224,.65), lerp(tunnelCol[1],85,.65), lerp(tunnelCol[2],155,.65)]
        : tunnelCol;
      const col=(al)=>'rgba('+Math.round(c[0])+','+Math.round(c[1])+','+Math.round(c[2])+','+al+')';
      tx.globalCompositeOperation='lighter';
      rot += (0.0016 + boost*0.00006)*dt;
      const rings=7;
      for(let k=0;k<rings;k++){
        const f=((t0*0.00005*(1+boost*0.03))+k/rings)%1, rr=f*maxR*1.15, a0=rot+k*0.35;
        tx.beginPath();
        for(let s2=0;s2<=6;s2++){ const ang=a0+s2/6*Math.PI*2, x=cx+Math.cos(ang)*rr, y=cy+Math.sin(ang)*rr*0.6; s2?tx.lineTo(x,y):tx.moveTo(x,y); }
        tx.strokeStyle=col(0.05*(1-f)); tx.lineWidth=dpr*(1.4-f); tx.shadowBlur=10*dpr; tx.shadowColor=col(0.4*(1-f)); tx.stroke();
      }
      tx.shadowBlur=0;
      for(const st of stars){
        st.z += (0.0032 + st.s*0.004 + boost*0.00016)*dt;
        if(st.z>=1){ st.z=0.02; st.a=Math.random()*Math.PI*2; }
        const rad=st.z*st.z*maxR, x=cx+Math.cos(st.a)*rad, y=cy+Math.sin(st.a)*rad*0.6, sz=Math.max(dpr,st.z*2.6*dpr);
        const a=Math.min(1,st.z*1.5)*0.55;
        tx.shadowBlur=6*dpr; tx.shadowColor=col(a);
        tx.fillStyle=col(a); tx.beginPath(); tx.arc(x,y,sz*0.6,0,6.283); tx.fill();
      }
      tx.shadowBlur=0; tx.globalCompositeOperation='source-over';
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }

  // ── THE AXIS — a point that turns becomes an infinite line (cover core) ──
  const axc=root.querySelector('[data-axis]');
  if(axc && !reduce){
    const ax=axc.getContext('2d'); const AW=axc.width, AH=axc.height, acx=AW/2, acy=AH/2;
    let ang=0, t0=0;
    const aframe=(ts)=>{
      const dt=Math.min(2.5,(ts-t0)/16.7)||1; t0=ts;
      ax.globalCompositeOperation='destination-out';   // fade trails to TRANSPARENT (no black disc over portals)
      ax.fillStyle='rgba(0,0,0,0.14)'; ax.fillRect(0,0,AW,AH);
      ang += 0.012*dt;
      const on=window.__kxSignal;
      const c = on ? '224,85,155' : '201,168,76';
      const R=AH*0.46, x1=acx+Math.cos(ang)*R, y1=acy+Math.sin(ang)*R, x2=acx-Math.cos(ang)*R, y2=acy-Math.sin(ang)*R;
      ax.globalCompositeOperation='lighter';
      ax.strokeStyle='rgba('+c+','+(0.5+0.2*Math.sin(ts*0.002))+')'; ax.lineWidth=1.1;
      ax.shadowBlur=8; ax.shadowColor='rgba('+c+',0.6)';
      ax.beginPath(); ax.moveTo(x1,y1); ax.lineTo(x2,y2); ax.stroke();
      ax.beginPath(); ax.arc(acx,acy,2.4+Math.sin(ts*0.004),0,6.283);
      ax.fillStyle='rgba('+c+',0.95)'; ax.fill();
      ax.shadowBlur=0; ax.globalCompositeOperation='source-over';
      requestAnimationFrame(aframe);
    };
    requestAnimationFrame(aframe);
  }

  // ── THE GLITCH / THE RIDDLE — text decodes from matrix noise ──
  const GLY='ABCDEFGHIJKLMNOPQRSTUVWXYZ01∞ΩΔΓ·+−/#';
  const rndGlyph=()=>GLY[(Math.random()*GLY.length)|0];
  const scramble=(el, final, dur)=>{
    const len=final.length, t0=performance.now();
    clearInterval(el.__sc);
    el.__sc=setInterval(()=>{
      const p=Math.min(1,(performance.now()-t0)/dur);
      let out='';
      for(let i=0;i<len;i++) out += final[i]===' ' ? ' ' : (i/len<p ? final[i] : rndGlyph());
      el.textContent=out;
      if(p>=1) clearInterval(el.__sc);
    }, 40);
  };
  const gio=new IntersectionObserver((es)=>es.forEach((e)=>{
    if(!e.isIntersecting) return; gio.unobserve(e.target);
    const el=e.target, txt=el.getAttribute('data-glitch')||el.textContent;
    if(reduce){ el.textContent=txt; return; }
    scramble(el, txt, 1000+Math.random()*500);
  }), {threshold:0.55});
  root.querySelectorAll('[data-glitch]').forEach((el)=>{ el.textContent=el.getAttribute('data-glitch')||el.textContent; gio.observe(el); });

  // the buried cipher — matrix noise until the SIGNAL is held, then it decodes
  const cipher=root.querySelector('[data-cipher]');
  if(cipher){
    const secret=cipher.getAttribute('data-cipher')||''; let decoded=false;
    setInterval(()=>{
      if(window.__kxSignal){ if(!decoded){ decoded=true; scramble(cipher, secret, 1500); } }
      else { decoded=false; clearInterval(cipher.__sc); cipher.textContent=Array.from(secret).map((ch)=>ch===' '?' ':rndGlyph()).join(''); }
    }, 110);
  }

  // ── GALLERY WALK — move room to room ──
  const gal=root.querySelector('[data-gallery]');
  if(gal){
    const rail=gal.querySelector('[data-gallery-rail]');
    const rooms=[...gal.querySelectorAll('[data-room]')];
    const idxEl=gal.querySelector('[data-gallery-idx]');
    const src=(f)=>'/img/kodex/'+(f.startsWith('disco-')?'disco':'archive')+'/'+f+'.jpg';
    let cur2=0, cyc=0;
    const cycleRoom=(room)=>{
      clearInterval(cyc);
      const files=(room.getAttribute('data-files')||'').split(',').filter(Boolean);
      const img=room.querySelector('img'); if(files.length<2||!img) return;
      files.forEach((f)=>{ const im=new Image(); im.src=src(f); });
      let i=files.indexOf((img.getAttribute('src')||'').split('/').pop().replace('.jpg',''));
      if(i<0) i=0;
      const step=()=>{ i=(i+1)%files.length; img.style.opacity='0'; setTimeout(()=>{ img.src=src(files[i]); img.style.opacity=''; },260); };
      if(!reduce) cyc=setInterval(step, 1600);
      img.onclick=step;
    };
    const go=(n2)=>{
      cur2=Math.max(0,Math.min(rooms.length-1,n2));
      rail.style.transform='translateX('+(-cur2*100)+'%)';
      if(idxEl) idxEl.textContent=String(cur2+1).padStart(2,'0');
      cycleRoom(rooms[cur2]);
    };
    let kh=null;
    const open=(start)=>{
      gal.hidden=false; gal.setAttribute('aria-hidden','false');
      requestAnimationFrame(()=>gal.setAttribute('data-open',''));
      document.body.style.overflow='hidden';
      go(start||0);
      kh=(e)=>{ if(e.key==='ArrowRight') go(cur2+1); else if(e.key==='ArrowLeft') go(cur2-1); else if(e.key==='Escape') close(); };
      addEventListener('keydown', kh);
    };
    const close=()=>{
      gal.removeAttribute('data-open'); gal.setAttribute('aria-hidden','true');
      document.body.style.overflow=''; clearInterval(cyc);
      if(kh){ removeEventListener('keydown', kh); kh=null; }
      setTimeout(()=>{ gal.hidden=true; }, 600);
    };
    root.querySelectorAll('[data-gallery-open]').forEach((b)=>b.addEventListener('click', ()=>open(0)));
    gal.querySelector('[data-gallery-next]')?.addEventListener('click', ()=>go(cur2+1));
    gal.querySelector('[data-gallery-prev]')?.addEventListener('click', ()=>go(cur2-1));
    gal.querySelector('[data-gallery-exit]')?.addEventListener('click', close);
    let sx=0;
    gal.addEventListener('touchstart',(e)=>{ sx=e.touches[0].clientX; }, {passive:true});
    gal.addEventListener('touchend',(e)=>{ const dx=e.changedTouches[0].clientX-sx; if(Math.abs(dx)>50) go(cur2+(dx<0?1:-1)); }, {passive:true});
  }

  // ── MACHINE ATELIER — the machine makes its own works with Ocin's tools ──
  const AC = root.querySelector('[data-atelier-canvas]');
  if (AC) {
    const ax = AC.getContext('2d', { willReadFrequently: true });
    const tmp = document.createElement('canvas'); const tc = tmp.getContext('2d');
    const recipeEl = root.querySelector('[data-atelier-recipe]');
    const sigEl = root.querySelector('[data-atelier-sig]');
    const srcEl2 = root.querySelector('[data-atelier-src]');
    const S = 620;
    const FX = {
      MIRROR: () => { const W = AC.width, H = AC.height; tmp.width = W; tmp.height = H; tc.clearRect(0, 0, W, H); tc.drawImage(AC, 0, 0);
        ax.save(); ax.translate(W, 0); ax.scale(-1, 1); ax.drawImage(tmp, 0, 0, W / 2, H, 0, 0, W / 2, H); ax.restore(); },
      CHROMA: () => { const W = AC.width, H = AC.height, s = ax.getImageData(0, 0, W, H), o = ax.createImageData(W, H), sd = s.data, od = o.data, sh = Math.max(2, W * 0.012 | 0);
        for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const i = (y * W + x) * 4, ri = (y * W + Math.min(W - 1, x + sh)) * 4, bi = (y * W + Math.max(0, x - sh)) * 4; od[i] = sd[ri]; od[i + 1] = sd[i + 1]; od[i + 2] = sd[bi + 2]; od[i + 3] = 255; } ax.putImageData(o, 0, 0); },
      'PIXEL SORT': () => { const W = AC.width, H = AC.height, s = ax.getImageData(0, 0, W, H), d = s.data;
        for (let y = 0; y < H; y++) { if (Math.random() < 0.4) continue; const x0 = (Math.random() * W * 0.5) | 0, x1 = Math.min(W, x0 + (Math.random() * W * 0.45 + W * 0.1 | 0)), row = [];
          for (let x = x0; x < x1; x++) { const i = (y * W + x) * 4; row.push([d[i], d[i + 1], d[i + 2]]); } row.sort((a, b) => (a[0] + a[1] + a[2]) - (b[0] + b[1] + b[2]));
          for (let x = x0; x < x1; x++) { const i = (y * W + x) * 4, c = row[x - x0]; d[i] = c[0]; d[i + 1] = c[1]; d[i + 2] = c[2]; } } ax.putImageData(s, 0, 0); },
      GLITCH: () => { const W = AC.width, H = AC.height, snap = ax.getImageData(0, 0, W, H); tmp.width = W; tmp.height = H; tc.putImageData(snap, 0, 0);
        const bands = 7 + (Math.random() * 7 | 0); for (let k = 0; k < bands; k++) { const by = Math.random() * H | 0, bh = (Math.random() * H * 0.07 + 4) | 0, dx = ((Math.random() - 0.5) * W * 0.16) | 0; ax.drawImage(tmp, 0, by, W, bh, dx, by, W, bh); } },
      DITHER: () => { const W = AC.width, H = AC.height, s = ax.getImageData(0, 0, W, H), d = s.data, B = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]];
        for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const i = (y * W + x) * 4, g = d[i] * 0.3 + d[i + 1] * 0.59 + d[i + 2] * 0.11, t = (B[y & 3][x & 3] / 16) * 255, v = g > t ? 255 : 0; d[i] = d[i + 1] = d[i + 2] = v; } ax.putImageData(s, 0, 0); },
      SCANLINES: () => { const W = AC.width, H = AC.height; ax.fillStyle = 'rgba(0,0,0,0.28)'; for (let y = 0; y < H; y += 3) ax.fillRect(0, y, W, 1); },
    };
    const TOOLS = Object.keys(FX);
    let gen = 0, iv = 0;
    const makeWork = () => {
      const imgs = [...root.querySelectorAll('.kx-cell img')].map((i) => i.getAttribute('src')).filter(Boolean);
      const uniq = [...new Set(imgs)]; if (!uniq.length) return;
      const src = uniq[(Math.random() * uniq.length) | 0];
      const im = new Image();
      im.onload = () => {
        const W = AC.width = S, H = AC.height = S;
        ax.fillStyle = '#000'; ax.fillRect(0, 0, W, H);
        const ar = im.width / im.height; let dw = W, dh = H, dx = 0, dy = 0;
        if (ar > 1) { dh = W / ar; dy = (H - dh) / 2; } else { dw = H * ar; dx = (W - dw) / 2; }
        ax.drawImage(im, dx, dy, dw, dh);
        const n2 = 2 + (Math.random() * 3 | 0), used = new Set(), chain = [];
        while (chain.length < n2) { const t = TOOLS[(Math.random() * TOOLS.length) | 0]; if (!used.has(t)) { used.add(t); chain.push(t); } }
        for (const t of chain) { try { FX[t](); } catch (e) {} }
        if (window.__kxSignal) { ax.globalCompositeOperation = 'overlay'; ax.fillStyle = 'rgba(224,85,155,0.22)'; ax.fillRect(0, 0, W, H); ax.globalCompositeOperation = 'source-over'; }
        gen++;
        if (recipeEl) recipeEl.textContent = chain.join('  →  ');
        if (sigEl) sigEl.textContent = 'KODEX·MACHINE · №' + String(1000 + gen);
        if (srcEl2) srcEl2.textContent = 'source · ' + (src.split('/').pop() || '—');
        AC.style.opacity = '';
      };
      AC.style.opacity = '0.15';
      im.src = src;
    };
    const io2 = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) { if (!gen) makeWork(); if (!iv && !reduce) iv = setInterval(makeWork, 7500); }
      else if (iv) { clearInterval(iv); iv = 0; }
    }), { threshold: 0.25 });
    io2.observe(AC);
    root.querySelector('[data-atelier-next]')?.addEventListener('click', makeWork);
  }

  // ── MÁQUINA: generative shader lab — multi-channel · B/W → gold on SIGNAL ──
  const HEAD = 'precision highp float;\nuniform float u_time;\nuniform vec2 u_res;\nuniform vec2 u_mouse;   // your cursor\nuniform float u_signal; // the SIGNAL\n';
  const SHADERS = [
    { name:'spiral.glsl', src: HEAD + [
      '',
      '// Double projective spiral — KODEX geometry.',
      '// -inf (descent) and +inf (manifestation) meet at 0.',
      'void main(){',
      '  vec2 uv=(gl_FragCoord.xy-0.5*u_res)/u_res.y;',
      '  uv -= u_mouse*0.08;',
      '  float r=max(length(uv),1e-3), a=atan(uv.y,uv.x);',
      '  float t=u_time*0.35, k=2.4;',
      '  float w=a - k*log(r);',
      '  float arms=max(sin(w+t), sin(w-t+3.14159));',
      '  float line=smoothstep(0.86,1.0,arms)*smoothstep(1.2,0.2,r);',
      '  float core=exp(-r*7.0)*1.4;',
      '  float g=line*0.9+core;',
      '  vec3 bone=vec3(0.94,0.92,0.86), gold=vec3(0.9,0.72,0.32);',
      '  gl_FragColor=vec4(mix(bone,gold,u_signal)*g,1.0);',
      '}'].join('\n') },
    { name:'kaliset.glsl', src: HEAD + [
      '',
      '// Kaliset fractal fold — bends toward -infinity.',
      'void main(){',
      '  vec2 uv=(gl_FragCoord.xy-0.5*u_res)/u_res.y;',
      '  vec2 z=uv*(1.4+0.3*sin(u_time*0.15));',
      '  vec2 c=vec2(0.7+0.15*sin(u_time*0.2),0.5+0.15*cos(u_time*0.17));',
      '  c += u_mouse*0.12 + u_signal*0.1;',
      '  float dens=0.0, m=1e9;',
      '  for(int i=0;i<12;i++){',
      '    z=abs(z)/dot(z,z)-c;',
      '    dens+=exp(-3.0*length(z)); m=min(m,length(z));',
      '  }',
      '  float fil=1.0-smoothstep(0.0,0.05,m);',
      '  float g=clamp(dens*0.45,0.0,1.0);',
      '  vec3 bone=vec3(0.94,0.92,0.86), gold=vec3(0.9,0.72,0.32);',
      '  vec3 col=mix(bone,gold,u_signal)*g+vec3(fil)*(0.6+0.4*u_signal);',
      '  gl_FragColor=vec4(col/(1.0+col),1.0);',
      '}'].join('\n') },
    { name:'phyllotaxis.glsl', src: HEAD + [
      '',
      '#define GA 2.399963  // golden angle 137.5',
      '// Living phyllotaxis — natures own code.',
      'void main(){',
      '  vec2 uv=(gl_FragCoord.xy-0.5*u_res)/u_res.y;',
      '  uv -= u_mouse*0.12;',
      '  float t=u_time*(0.1+u_signal*0.3);',
      '  float bloom=0.55+0.1*sin(u_time*0.25)+u_signal*0.2, g=0.0;',
      '  for(int i=0;i<120;i++){',
      '    float fi=float(i), ang=fi*GA+t, rad=sqrt(fi/120.0)*bloom;',
      '    vec2 s=vec2(cos(ang),sin(ang))*rad;',
      '    float sz=0.004+0.011*(fi/120.0);',
      '    g += sz/(length(uv-s)+sz);',
      '  }',
      '  g=pow(g*0.05,1.5);',
      '  vec3 bone=vec3(0.94,0.92,0.86), gold=vec3(0.9,0.72,0.32);',
      '  vec3 col=mix(bone,gold,u_signal)*g;',
      '  gl_FragColor=vec4(col/(1.0+col),1.0);',
      '}'].join('\n') },
    { name:'julia.glsl', src: HEAD + [
      '',
      '// Julia set — recursion at the edge of chaos.',
      'void main(){',
      '  vec2 uv=(gl_FragCoord.xy-0.5*u_res)/u_res.y*1.4;',
      '  vec2 c=vec2(0.36*cos(u_time*0.15),0.36*sin(u_time*0.11))+u_mouse*0.08;',
      '  vec2 z=uv; float it=0.0;',
      '  for(int i=0;i<56;i++){',
      '    z=vec2(z.x*z.x-z.y*z.y,2.0*z.x*z.y)+c;',
      '    if(dot(z,z)>4.0) break; it+=1.0;',
      '  }',
      '  float g=pow(it/56.0,1.3);',
      '  vec3 bone=vec3(0.94,0.92,0.86), gold=vec3(0.9,0.72,0.32);',
      '  gl_FragColor=vec4(mix(bone,gold,u_signal)*g,1.0);',
      '}'].join('\n') },
  ];

  const canvas = root.querySelector('[data-shader-canvas]');
  const srcEl  = root.querySelector('[data-shader-src]');
  const statEl = root.querySelector('[data-shader-status]');
  const fpsEl  = root.querySelector('[data-fps]');
  const nameEl = root.querySelector('[data-shader-name]');
  const chEl   = root.querySelector('[data-channels]');

  const hl = (s) => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/(\/\/[^\n]*)/g, '<span class="cm">$1</span>')
    .replace(/\b(precision|highp|uniform|void|float|vec2|vec3|vec4|for|int|if|break|return|define)\b/g, '<span class="kw">$1</span>')
    .replace(/\b(main|sin|cos|atan|log|length|dot|exp|smoothstep|clamp|min|max|mod|abs|step|mix|pow|sqrt)\b/g, '<span class="fn">$1</span>')
    .replace(/\b(u_time|u_res|u_mouse|u_signal|gl_FragCoord|gl_FragColor|GA)\b/g, '<span class="nm">$1</span>');

  let typeTimer = 0;
  const typeCode = (src) => {
    if (!srcEl) return;
    clearTimeout(typeTimer);
    const lines = src.split('\n');
    if (reduce) { srcEl.innerHTML = lines.map(hl).join('\n') + '<span class="kx-code__caret"></span>'; return; }
    let li = 0, typed = '';
    const step = () => { if (li < lines.length) { typed += hl(lines[li]) + '\n'; srcEl.innerHTML = typed + '<span class="kx-code__caret"></span>'; li++; typeTimer = setTimeout(step, 26); } };
    step();
  };

  if (canvas) {
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) { if (statEl) statEl.textContent = 'NO WEBGL'; }
    else {
      const VERT = 'attribute vec2 p; void main(){ gl_Position = vec4(p,0.0,1.0); }';
      const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
      const mk = (fragSrc) => {
        const c = (type, s) => { const sh = gl.createShader(type); gl.shaderSource(sh, s); gl.compileShader(sh); return gl.getShaderParameter(sh, gl.COMPILE_STATUS) ? sh : (console.warn(gl.getShaderInfoLog(sh)), null); };
        const vs = c(gl.VERTEX_SHADER, VERT), fs = c(gl.FRAGMENT_SHADER, fragSrc);
        if (!vs || !fs) return null;
        const pr = gl.createProgram(); gl.attachShader(pr, vs); gl.attachShader(pr, fs); gl.bindAttribLocation(pr, 0, 'p'); gl.linkProgram(pr);
        if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return null;
        return { pr, uT: gl.getUniformLocation(pr,'u_time'), uR: gl.getUniformLocation(pr,'u_res'), uM: gl.getUniformLocation(pr,'u_mouse'), uS: gl.getUniformLocation(pr,'u_signal') };
      };
      const progs = SHADERS.map((s) => ({ ...s, ...(mk(s.src) || {}) }));
      gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      let active = progs.find((p) => p.pr) || progs[0];
      if (statEl) statEl.textContent = active.pr ? 'COMPILED OK' : 'ERROR';

      if (chEl) progs.forEach((p) => {
        const b = document.createElement('button');
        b.textContent = p.name.replace('.glsl', '').toUpperCase();
        b.setAttribute('aria-selected', p === active ? 'true' : 'false');
        b.addEventListener('click', () => {
          if (!p.pr) return; active = p;
          [...chEl.children].forEach((c) => c.setAttribute('aria-selected', 'false'));
          b.setAttribute('aria-selected', 'true');
          if (nameEl) nameEl.textContent = 'MACHINE // ' + p.name;
          typeCode(p.src);
        });
        chEl.appendChild(b);
      });
      if (nameEl) nameEl.textContent = 'MACHINE // ' + active.name;

      if (reduce) typeCode(active.src);
      else { const tio2 = new IntersectionObserver((es, ob) => es.forEach((e) => { if (e.isIntersecting) { typeCode(active.src); ob.disconnect(); } }), { threshold: 0.25 }); tio2.observe(srcEl || canvas); }

      let mx=0,my=0,smx=0,smy=0,sig=0;
      addEventListener('mousemove', (e) => { mx=(e.clientX/innerWidth)*2-1; my=-((e.clientY/innerHeight)*2-1); }, { passive:true });
      const resize = () => { const dpr=Math.min(1.5,devicePixelRatio||1); const w=canvas.clientWidth*dpr, h=canvas.clientHeight*dpr; if (canvas.width!==w||canvas.height!==h){ canvas.width=w; canvas.height=h; gl.viewport(0,0,w,h);} };
      const draw = (t) => {
        resize(); if (!active.pr) return;
        gl.useProgram(active.pr);
        smx+=(mx-smx)*0.06; smy+=(my-smy)*0.06;
        const tgt=(btn && btn.getAttribute('aria-pressed')==='true')?1:0; sig+=(tgt-sig)*0.07;
        gl.uniform1f(active.uT,t); gl.uniform2f(active.uR,canvas.width,canvas.height); gl.uniform2f(active.uM,smx,smy); gl.uniform1f(active.uS,sig);
        gl.drawArrays(gl.TRIANGLES,0,3);
      };
      if (reduce) { draw(2.0); }
      else {
        let visf=false, last=performance.now(), frames=0, facc=0, raf=0;
        const tick=(now)=>{ raf=0; if(!visf) return; draw(now*0.001); frames++; facc+=now-last; last=now; if(facc>=500){ if(fpsEl) fpsEl.textContent=String(Math.round(frames/(facc/1000))).padStart(2,'0'); frames=0; facc=0; } raf=requestAnimationFrame(tick); };
        const io3=new IntersectionObserver((es)=>es.forEach((e)=>{ visf=e.isIntersecting; if(visf&&!raf){ last=performance.now(); raf=requestAnimationFrame(tick); } }),{threshold:0.05}); io3.observe(canvas);
      }
    }
  }

  // ── GEOMETRY: double projective spiral (2D canvas) ──
  const geo = root.querySelector('[data-geo-canvas]');
  if (geo) {
    const g = geo.getContext('2d');
    const TAU = Math.PI * 2;
    let vis = false, raf = 0; const t0 = performance.now();
    const resize = () => {
      const dpr = Math.min(2, devicePixelRatio || 1);
      const w = geo.clientWidth * dpr, h = geo.clientHeight * dpr;
      if (geo.width !== w || geo.height !== h) { geo.width = w; geo.height = h; }
    };
    const arm = (cx, cy, R, sign, phase, a, turns) => {
      g.beginPath();
      const steps = 520;
      for (let i = 0; i <= steps; i++) {
        const th = (i / steps) * turns * TAU;
        const r = R * Math.exp(-a * th);
        const ang = sign * th + phase;
        const x = cx + r * Math.cos(ang), y = cy + r * Math.sin(ang);
        i ? g.lineTo(x, y) : g.moveTo(x, y);
      }
      g.stroke();
    };
    const draw = (now) => {
      resize();
      const w = geo.width, h = geo.height, cx = w / 2, cy = h / 2;
      g.clearRect(0, 0, w, h);
      const R = Math.min(w, h) * 0.46;
      const ph = (now - t0) * 0.00016;
      g.lineWidth = Math.max(1, w * 0.0016);
      const white = root.classList.contains('kx--white');
      g.strokeStyle = white ? 'rgba(10,10,10,0.8)' : 'rgba(244,241,234,0.85)';
      arm(cx, cy, R, 1, ph, 0.26, 5);
      arm(cx, cy, R, 1, ph + Math.PI, 0.26, 5);
      g.strokeStyle = white ? 'rgba(138,111,47,0.4)' : 'rgba(201,168,76,0.30)';
      arm(cx, cy, R, -1, -ph * 0.7, 0.26, 5);
      arm(cx, cy, R, -1, -ph * 0.7 + Math.PI, 0.26, 5);
    };
    if (reduce) { resize(); draw(performance.now()); }
    else {
      const tick = (now) => { raf = 0; if (!vis) return; draw(now); raf = requestAnimationFrame(tick); };
      new IntersectionObserver((es) => es.forEach((e) => { vis = e.isIntersecting; if (vis && !raf) raf = requestAnimationFrame(tick); }), { threshold: 0.05 }).observe(geo);
    }
  }

  // ── FLOW FIELD: particle vortex — inhale by default, exhale on SIGNAL ──
  const flow = root.querySelector('[data-flow-canvas]');
  if (flow) {
    const g = flow.getContext('2d');
    const N = reduce ? 240 : 520;
    let ps = [], visf = false, raf = 0, W = 1, Hh = 1;
    const sigOn = () => (btn && btn.getAttribute('aria-pressed') === 'true');
    const resize = () => {
      const dpr = Math.min(2, devicePixelRatio || 1);
      const w = flow.clientWidth * dpr, h = flow.clientHeight * dpr;
      if (flow.width !== w || flow.height !== h) { flow.width = w; flow.height = h; }
      W = flow.width; Hh = flow.height;
    };
    const seed = () => { ps = []; for (let i = 0; i < N; i++) { const a = Math.random() * Math.PI * 2, r = 0.15 + Math.random() * 0.85; ps.push({ x: Math.cos(a) * r, y: Math.sin(a) * r, life: Math.random() }); } };
    const step = () => {
      const cx = W / 2, cy = Hh / 2, S = Math.min(W, Hh) * 0.46;
      const on = sigOn(), inhale = on ? -1 : 1, alpha = 1.1, beta = 0.6, eps = 0.02;
      const dot = Math.max(1, W * 0.0022);
      g.fillStyle = 'rgba(0,0,0,0.13)'; g.fillRect(0, 0, W, Hh);
      const base = on ? 'rgba(201,168,76,' : 'rgba(244,241,234,';
      for (const p of ps) {
        const d2 = p.x * p.x + p.y * p.y + eps;
        p.x += (alpha * (-p.y) / d2 - inhale * beta * p.x) * 0.006;
        p.y += (alpha * ( p.x) / d2 - inhale * beta * p.y) * 0.006;
        p.life -= 0.004;
        const r = Math.sqrt(p.x * p.x + p.y * p.y);
        if (p.life <= 0 || r < 0.03 || r > 1.3) { const a = Math.random() * Math.PI * 2, rr = on ? 0.05 : (0.9 + Math.random() * 0.35); p.x = Math.cos(a) * rr; p.y = Math.sin(a) * rr; p.life = 0.6 + Math.random() * 0.6; }
        g.fillStyle = base + (0.28 + 0.5 * p.life) + ')';
        g.fillRect(cx + p.x * S, cy + p.y * S, dot, dot);
      }
    };
    if (reduce) { resize(); seed(); g.fillStyle = '#000'; g.fillRect(0, 0, W, Hh); for (let i = 0; i < 50; i++) step(); }
    else {
      resize(); seed(); g.fillStyle = '#000'; g.fillRect(0, 0, W, Hh);
      const tick = () => { raf = 0; if (!visf) return; resize(); step(); raf = requestAnimationFrame(tick); };
      new IntersectionObserver((es) => es.forEach((e) => { visf = e.isIntersecting; if (visf && !raf) raf = requestAnimationFrame(tick); }), { threshold: 0.05 }).observe(flow);
    }
  }

  // ── ARTWORK VIEWER: open a work, read it through live effects ──
  const viewer = root.querySelector('[data-viewer]');
  if (viewer) {
    const vc = viewer.querySelector('[data-viewer-canvas]');
    const vctx = vc.getContext('2d', { willReadFrequently: true });
    const vTitle = viewer.querySelector('[data-viewer-title]');
    const vFx = viewer.querySelector('[data-viewer-fx]');
    let baseImg = null, W = 0, Hh = 0, ok = false;
    const EFFECTS = ['ORIGINAL', 'DITHER', 'GLITCH', 'CHROMA', 'PIXEL SORT', 'SCANLINES', 'MIRROR'];
    const B8 = [[0,32,8,40,2,34,10,42],[48,16,56,24,50,18,58,26],[12,44,4,36,14,46,6,38],[60,28,52,20,62,30,54,22],[3,35,11,43,1,33,9,41],[51,19,59,27,49,17,57,25],[15,47,7,39,13,45,5,37],[63,31,55,23,61,29,53,21]];

    const apply = (name) => {
      if (!baseImg) return;
      vctx.drawImage(baseImg, 0, 0, W, Hh);
      if (name === 'ORIGINAL' || !ok) return;
      let d; try { d = vctx.getImageData(0, 0, W, Hh); } catch (e) { return; }
      const p = d.data;
      if (name === 'DITHER') {
        for (let y = 0; y < Hh; y++) for (let x = 0; x < W; x++) { const i = (y*W+x)*4; const lum = (0.299*p[i]+0.587*p[i+1]+0.114*p[i+2])/255; const t = (B8[y&7][x&7]+0.5)/64; const v = lum > t ? 240 : 10; p[i]=v; p[i+1]=v; p[i+2]=v; }
        vctx.putImageData(d, 0, 0);
      } else if (name === 'CHROMA') {
        const off = Math.max(2, Math.round(W*0.007)); const out = vctx.createImageData(W, Hh); const o = out.data;
        for (let y = 0; y < Hh; y++) for (let x = 0; x < W; x++) { const i=(y*W+x)*4; const ir=(y*W+Math.min(W-1,x+off))*4, ib=(y*W+Math.max(0,x-off))*4; o[i]=p[ir]; o[i+1]=p[i+1]; o[i+2]=p[ib+2]; o[i+3]=255; }
        vctx.putImageData(out, 0, 0);
      } else if (name === 'GLITCH') {
        for (let b = 0; b < 28; b++) { const y0 = Math.floor(Math.random()*Hh); const bh = 2 + Math.floor(Math.random()*Hh*0.045); const dx = Math.floor((Math.random()-0.5)*W*0.14); const y1 = Math.min(Hh, y0+bh); const rows = vctx.getImageData(0, y0, W, y1-y0); vctx.putImageData(rows, dx, y0); }
        const s = vctx.getImageData(0,0,W,Hh); const q = s.data; const off = Math.max(1, Math.round(W*0.004));
        for (let y = 0; y < Hh; y++) for (let x = 0; x < W; x++) { const i=(y*W+x)*4; q[i] = q[(y*W+Math.min(W-1,x+off))*4]; }
        vctx.putImageData(s, 0, 0);
      } else if (name === 'PIXEL SORT') {
        const th = 0.5;
        for (let y = 0; y < Hh; y++) { let x = 0; while (x < W) {
          while (x < W) { const i=(y*W+x)*4; if ((0.299*p[i]+0.587*p[i+1]+0.114*p[i+2])/255 < th) break; x++; }
          const start = x; while (x < W) { const i=(y*W+x)*4; if ((0.299*p[i]+0.587*p[i+1]+0.114*p[i+2])/255 >= th) break; x++; } const end = x;
          if (end - start > 1) { const arr = []; for (let k = start; k < end; k++) { const i=(y*W+k)*4; arr.push([p[i],p[i+1],p[i+2], 0.299*p[i]+0.587*p[i+1]+0.114*p[i+2]]); } arr.sort((a,b)=>a[3]-b[3]); for (let k = start; k < end; k++) { const i=(y*W+k)*4; const c=arr[k-start]; p[i]=c[0]; p[i+1]=c[1]; p[i+2]=c[2]; } }
        } }
        vctx.putImageData(d, 0, 0);
      } else if (name === 'SCANLINES') {
        for (let y = 0; y < Hh; y++) { const dk = (y % 3 === 0) ? 0.55 : 1; for (let x = 0; x < W; x++) { const i=(y*W+x)*4; p[i]*=dk; p[i+1]=Math.min(255,p[i+1]*dk*1.05); p[i+2]*=dk; } }
        vctx.putImageData(d, 0, 0);
        const g = vctx.createRadialGradient(W/2, Hh/2, Hh*0.2, W/2, Hh/2, Hh*0.75); g.addColorStop(0,'rgba(0,0,0,0)'); g.addColorStop(1,'rgba(0,0,0,0.5)'); vctx.fillStyle = g; vctx.fillRect(0,0,W,Hh);
      } else if (name === 'MIRROR') {
        const hw = Math.floor(W/2), hh = Math.floor(Hh/2);
        const tmp2 = document.createElement('canvas'); tmp2.width = hw; tmp2.height = hh; tmp2.getContext('2d').drawImage(baseImg, 0, 0, hw, hh);
        vctx.clearRect(0,0,W,Hh); vctx.drawImage(tmp2, 0, 0);
        vctx.save(); vctx.translate(W, 0); vctx.scale(-1, 1); vctx.drawImage(tmp2, 0, 0); vctx.restore();
        vctx.save(); vctx.translate(0, Hh); vctx.scale(1, -1); vctx.drawImage(tmp2, 0, 0); vctx.restore();
        vctx.save(); vctx.translate(W, Hh); vctx.scale(-1, -1); vctx.drawImage(tmp2, 0, 0); vctx.restore();
      }
    };

    EFFECTS.forEach((name, idx) => { const b = document.createElement('button'); b.textContent = name; b.setAttribute('aria-selected', idx === 0 ? 'true' : 'false'); b.addEventListener('click', () => { [...vFx.children].forEach((c) => c.setAttribute('aria-selected', 'false')); b.setAttribute('aria-selected', 'true'); apply(name); }); vFx.appendChild(b); });

    // museum plate — curation panel + video works (plate 009)
    const vVideo = viewer.querySelector('[data-viewer-video]');
    const vMeta = viewer.querySelector('[data-viewer-meta]');
    const vSig = viewer.querySelector('[data-viewer-sigil]');
    const vRead = viewer.querySelector('[data-viewer-read]');
    const vFxLine = viewer.querySelector('[data-viewer-fxline]');
    const vInsp = viewer.querySelector('[data-viewer-insp]');
    const vOps = viewer.querySelector('[data-viewer-ops]');
    const fillMeta = (d, sigilHtml) => {
      const has = d && (d.read || d.fx || d.insp || d.opsfull);
      if (vMeta) vMeta.hidden = !has;
      if (!has) return;
      if (vRead) vRead.textContent = d.read || '';
      if (vFxLine) vFxLine.textContent = d.fx || '—';
      if (vInsp) vInsp.textContent = d.insp || '—';
      if (vOps) vOps.textContent = d.opsfull || '—';
      if (vSig) vSig.innerHTML = sigilHtml || '';
    };
    const open = (src, title, d, sigilHtml) => {
      const isVideo = d && d.video;
      if (vVideo) {
        if (isVideo) { vVideo.src = d.video + '.webm'; vVideo.hidden = false; vVideo.play?.().catch(() => {}); }
        else { vVideo.pause?.(); vVideo.removeAttribute('src'); vVideo.hidden = true; }
      }
      vc.hidden = !!isVideo;
      if (vFx) vFx.style.visibility = isVideo ? 'hidden' : 'visible';
      if (!isVideo) {
        const im = new Image(); im.decoding = 'async';
        im.onload = () => { const s = Math.min(1, 1100 / im.naturalWidth); W = Math.round(im.naturalWidth*s); Hh = Math.round(im.naturalHeight*s); vc.width = W; vc.height = Hh; baseImg = im; ok = true; [...vFx.children].forEach((c, i) => c.setAttribute('aria-selected', i === 0 ? 'true' : 'false')); apply('ORIGINAL'); };
        im.onerror = () => { ok = false; };
        im.src = src;
      }
      if (vTitle) vTitle.textContent = title || 'SPECIMEN';
      fillMeta(d, sigilHtml);
      viewer.hidden = false; viewer.setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden';
    };
    const close = () => { vVideo?.pause?.(); viewer.hidden = true; viewer.setAttribute('aria-hidden', 'true'); document.body.style.overflow = ''; };
    viewer.querySelector('[data-viewer-close]')?.addEventListener('click', close);
    viewer.addEventListener('click', (e) => { if (e.target === viewer || e.target.classList.contains('kx-viewer__stage')) close(); });
    addEventListener('keydown', (e) => { if (e.key === 'Escape' && !viewer.hidden) close(); });

    // ── IN-PLACE READING (Ocin): click a work → a RANDOM effect ON the image
    //    itself, animated, no window, no controls. Tap again → the original
    //    returns. Reuses the effect algorithms + B8 dither matrix above.
    const IP_FX = ['DITHER', 'GLITCH', 'CHROMA', 'PIXEL SORT', 'SCANLINES', 'MIRROR'];
    const IP_CODE = {
      DITHER: '// DITHER · Bayer 8x8 -> 1 bit\nv = luminance(px)\nout = v > bayer[y%8][x%8] ? 255 : 0',
      GLITCH: '// GLITCH · displace bands, shift channels\nfor band in bands: offset(row, rand())\nR.x += 3 ; B.x -= 3',
      CHROMA: '// CHROMA · split colour in space\nout.R = src(x + d).R\nout.B = src(x - d).B',
      'PIXEL SORT': '// PIXEL SORT · order spans by light\nfor row: sort(span, key = luminance)',
      SCANLINES: '// SCANLINES · CRT phosphor\npx *= 0.7 + 0.3 * sin(y * PI)',
      MIRROR: '// MIRROR · fourfold reflection\nout[y][x] = src[H - y][W - x]',
    };
    const reduceFx = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const GLY2 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789∞ΩΔ·';
    const typeTerm = (el, full, delay) => {
      if (reduceFx) { el.textContent = full; return; }
      const t0 = performance.now(); clearInterval(el.__t);
      el.__t = setInterval(() => {
        const n = Math.max(0, ((performance.now() - t0 - delay) / 8) | 0);
        if (n >= full.length) { el.textContent = full; clearInterval(el.__t); return; }
        let o = ''; for (let i = 0; i < full.length; i++) o += i < n ? full[i] : (full[i] === '\n' ? '\n' : (i < n + 3 ? GLY2[Math.random()*GLY2.length|0] : ''));
        el.textContent = o;
      }, 26);
    };
    const paintFx = (cx, base, W, Hh, name) => {
      cx.clearRect(0, 0, W, Hh); cx.drawImage(base, 0, 0, W, Hh);
      let d; try { d = cx.getImageData(0, 0, W, Hh); } catch (e) { return; } const p = d.data;
      if (name === 'DITHER') { for (let y = 0; y < Hh; y++) for (let x = 0; x < W; x++) { const i = (y*W+x)*4; const lum = (0.299*p[i]+0.587*p[i+1]+0.114*p[i+2])/255; const t = (B8[y&7][x&7]+0.5)/64; const v = lum > t ? 240 : 10; p[i]=v; p[i+1]=v; p[i+2]=v; } cx.putImageData(d, 0, 0); }
      else if (name === 'CHROMA') { const off = Math.max(2, Math.round(W*0.01)); const out = cx.createImageData(W, Hh); const o = out.data; for (let y = 0; y < Hh; y++) for (let x = 0; x < W; x++) { const i=(y*W+x)*4; const ir=(y*W+Math.min(W-1,x+off))*4, ib=(y*W+Math.max(0,x-off))*4; o[i]=p[ir]; o[i+1]=p[i+1]; o[i+2]=p[ib+2]; o[i+3]=255; } cx.putImageData(out, 0, 0); }
      else if (name === 'GLITCH') { for (let b = 0; b < 24; b++) { const y0 = Math.floor(Math.random()*Hh); const bh = 2 + Math.floor(Math.random()*Hh*0.05); const dx = Math.floor((Math.random()-0.5)*W*0.16); const rows = cx.getImageData(0, y0, W, Math.min(Hh, y0+bh)-y0); cx.putImageData(rows, dx, y0); } }
      else if (name === 'PIXEL SORT') { const th = 0.5; for (let y = 0; y < Hh; y++) { let x = 0; while (x < W) { while (x < W) { const i=(y*W+x)*4; if ((0.299*p[i]+0.587*p[i+1]+0.114*p[i+2])/255 < th) break; x++; } const st = x; while (x < W) { const i=(y*W+x)*4; if ((0.299*p[i]+0.587*p[i+1]+0.114*p[i+2])/255 >= th) break; x++; } const en = x; if (en-st > 1) { const a = []; for (let k = st; k < en; k++) { const i=(y*W+k)*4; a.push([p[i],p[i+1],p[i+2], 0.299*p[i]+0.587*p[i+1]+0.114*p[i+2]]); } a.sort((m,n)=>m[3]-n[3]); for (let k = st; k < en; k++) { const i=(y*W+k)*4; const c=a[k-st]; p[i]=c[0]; p[i+1]=c[1]; p[i+2]=c[2]; } } } } cx.putImageData(d, 0, 0); }
      else if (name === 'SCANLINES') { for (let y = 0; y < Hh; y++) { const dk = (y%3===0) ? 0.5 : 1; for (let x = 0; x < W; x++) { const i=(y*W+x)*4; p[i]*=dk; p[i+1]*=dk; p[i+2]*=dk; } } cx.putImageData(d, 0, 0); }
      else if (name === 'MIRROR') { const hw = Math.floor(W/2), hh = Math.floor(Hh/2); const t = document.createElement('canvas'); t.width = hw; t.height = hh; t.getContext('2d').drawImage(base, 0, 0, hw, hh); cx.clearRect(0,0,W,Hh); cx.drawImage(t,0,0); cx.save(); cx.translate(W,0); cx.scale(-1,1); cx.drawImage(t,0,0); cx.restore(); cx.save(); cx.translate(0,Hh); cx.scale(1,-1); cx.drawImage(t,0,0); cx.restore(); cx.save(); cx.translate(W,Hh); cx.scale(-1,-1); cx.drawImage(t,0,0); cx.restore(); }
    };
    root.querySelectorAll('.kx-cell[data-files], .kx-specimen .kx-frame[data-spec], .kx-frame--hero').forEach((el) => {
      const img = el.querySelector('img'); if (!img) return;
      el.style.cursor = 'pointer';
      let cv = null, term = null, last = -1;
      // weighted toward the DRAMATIC readings so every touch is memorable.
      const POOL = ['GLITCH', 'CHROMA', 'MIRROR', 'PIXEL SORT', 'GLITCH', 'CHROMA', 'MIRROR', 'DITHER', 'SCANLINES', 'ORIGINAL'];
      const title = ((el.dataset.title || el.querySelector('figcaption')?.textContent || el.querySelector('.kx-frame__tag')?.textContent || 'SPECIMEN').trim()).toUpperCase();
      const ops = el.dataset.opsfull || el.dataset.ops || '';
      el.addEventListener('click', (e) => {
        e.preventDefault(); e.stopPropagation();
        const host = img.parentElement || el; if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
        if (!cv) {
          cv = document.createElement('canvas');
          cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;opacity:0;transition:opacity .4s ease;z-index:4;';
          host.appendChild(cv);
          term = document.createElement('div');
          term.style.cssText = 'position:absolute;left:6px;right:6px;bottom:6px;z-index:5;pointer-events:none;opacity:0;transition:opacity .35s ease;padding:8px 10px;background:linear-gradient(rgba(0,0,0,.35),rgba(0,4,6,.82));border-left:2px solid #00f0ff;box-shadow:inset 0 0 0 1px rgba(0,240,255,.1),0 0 22px rgba(0,240,255,.14);';
          const dl = document.createElement('pre'); dl.style.cssText = 'margin:0;white-space:pre-wrap;font-family:"JetBrains Mono",ui-monospace,monospace;font-size:8.5px;line-height:1.5;letter-spacing:.04em;color:#00f0ff;text-shadow:0 0 7px rgba(0,240,255,.5);';
          const cl = document.createElement('pre'); cl.style.cssText = 'margin:4px 0 0;white-space:pre-wrap;font-family:"JetBrains Mono",ui-monospace,monospace;font-size:9px;line-height:1.5;color:#a6ff00;text-shadow:0 0 7px rgba(166,255,0,.4);';
          term.__dl = dl; term.__cl = cl; term.appendChild(dl); term.appendChild(cl); host.appendChild(term);
        }
        let n; do { n = Math.floor(Math.random()*POOL.length); } while (n === last && POOL.length > 1); last = n;
        const name = POOL[n];
        if (name === 'ORIGINAL') { cv.style.opacity = '0'; term.style.opacity = '0'; return; }
        try { record({ type: 'effect', effect: name }); } catch (e) {}
        const iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height; if (!iw) return;
        const s = Math.min(1, 900 / iw); const W = Math.round(iw*s), Hh = Math.round(ih*s);
        cv.width = W; cv.height = Hh;
        paintFx(cv.getContext('2d', { willReadFrequently: true }), img, W, Hh, name);
        const seed = '0x' + ((((title.length * 40503) + (name.length * 6151)) * 2654435761 >>> 8) & 0xffffff).toString(16).toUpperCase().padStart(6, '0');
        typeTerm(term.__dl, '◈ ' + name + ' · ' + title + '\nSEED ' + seed + (ops ? '  OPS ' + ops : '') + '  φ 137.5°', 0);
        typeTerm(term.__cl, IP_CODE[name] || '', 220);
        if (reduceFx) { cv.style.opacity = '1'; term.style.opacity = '1'; }
        else { cv.style.opacity = '0'; term.style.opacity = '0'; requestAnimationFrame(() => requestAnimationFrame(() => { cv.style.opacity = '1'; term.style.opacity = '1'; })); }
      });
    });
  }
}
