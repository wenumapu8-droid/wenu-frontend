
const $ = (s) => document.querySelector(s);
const els = {
  apiKey: $('#apiKey'), category: $('#category'), scene: $('#scene'),
  bgMode: $('#bgMode'), fetchBtn: $('#fetchBtn'), stopBtn: $('#stopBtn'),
  exportJson: $('#exportJson'), exportCsv: $('#exportCsv'),
  exportSelected: $('#exportSelected'), clearBtn: $('#clearBtn'),
  textFilter: $('#textFilter'), rating: $('#rating'),
  grid: $('#grid'), count: $('#count'), selectedCount: $('#selectedCount'),
  queryCount: $('#queryCount'), state: $('#state'), progressBar: $('#progressBar')
};

let queryDefs = [];
let items = [];
let stopRequested = false;
const selected = new Set(JSON.parse(localStorage.getItem('kdx-giphy-selected') || '[]'));

const sleep = ms => new Promise(r => setTimeout(r, ms));
const safe = v => String(v ?? '').replace(/[<>&"]/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]));

function saveSelected(){
  localStorage.setItem('kdx-giphy-selected', JSON.stringify([...selected]));
  els.selectedCount.textContent = selected.size;
}
function unique(arr){ return [...new Set(arr)]; }
function download(name, text, type='application/json'){
  const blob = new Blob([text], {type});
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement('a'), {href:url, download:name});
  a.click(); setTimeout(()=>URL.revokeObjectURL(url), 1000);
}
function itemToRecord(x){
  return {
    giphy_id:x.id,
    title:x.title,
    page_url:x.url,
    embed_url:x.embed_url,
    username:x.username || null,
    source_tld:x.source_tld || null,
    source_post_url:x.source_post_url || null,
    rating:x.rating,
    imported_from_query:x._query,
    kodex_category:x._category,
    kodex_scene:x._scene,
    kodex_roles:x._roles,
    priority:x._priority,
    selected:selected.has(x.id),
    rendition_session_urls:{
      preview_webp:x.images?.fixed_height?.webp || null,
      original_webp:x.images?.original?.webp || null,
      original_gif:x.images?.original?.url || null
    },
    dimensions:{
      width:Number(x.images?.original?.width || 0),
      height:Number(x.images?.original?.height || 0),
      bytes:Number(x.images?.original?.size || 0)
    },
    attribution:{
      creator:x.username || x.user?.display_name || 'GIPHY creator/source',
      powered_by:'GIPHY'
    }
  };
}
function csvValue(v){
  const s = Array.isArray(v) ? v.join('|') : typeof v === 'object' ? JSON.stringify(v) : String(v ?? '');
  return `"${s.replaceAll('"','""')}"`;
}
function recordsToCsv(records){
  const headers = ['giphy_id','title','page_url','username','rating','imported_from_query','kodex_category','kodex_scene','kodex_roles','priority','selected'];
  return [headers.join(','), ...records.map(r => headers.map(h=>csvValue(r[h])).join(','))].join('\n');
}
function filters(){
  return {
    category:els.category.value, scene:els.scene.value, rating:els.rating.value,
    text:els.textFilter.value.trim().toLowerCase()
  };
}
function filteredItems(){
  const f = filters();
  return items.filter(x => {
    const hay = [x.title,x.username,x._query,x._category,x._scene,...x._roles].join(' ').toLowerCase();
    return (!f.category || x._category===f.category)
      && (!f.scene || x._scene===f.scene)
      && (!f.rating || x.rating===f.rating)
      && (!f.text || hay.includes(f.text));
  });
}
function render(){
  const bg = els.bgMode.value;
  const data = filteredItems();
  els.grid.innerHTML = data.map(x => {
    const src = x.images?.fixed_height?.webp || x.images?.fixed_height?.url || x.images?.original?.webp || x.images?.original?.url;
    const creator = x.username || x.user?.display_name || 'sin autor visible';
    const dimensions = `${x.images?.original?.width || '?'}×${x.images?.original?.height || '?'}`;
    return `<article class="card ${selected.has(x.id)?'selected':''}" data-id="${safe(x.id)}">
      <div class="preview ${bg}"><img loading="lazy" src="${safe(src)}" alt="${safe(x.title)}"></div>
      <div class="card-body">
        <div class="title">${safe(x.title || x.id)}</div>
        <div class="tags">
          <span class="tag">${safe(x._category)}</span>
          <span class="tag">${safe(x._scene)}</span>
          ${x._roles.map(r=>`<span class="tag">${safe(r)}</span>`).join('')}
        </div>
        <div class="meta">@${safe(creator)} · ${safe(x.rating)} · ${safe(dimensions)} · ID ${safe(x.id)}</div>
        <div class="actions">
          <button data-select="${safe(x.id)}">${selected.has(x.id)?'QUITAR':'SELECCIONAR'}</button>
          <a href="${safe(x.url)}" target="_blank" rel="noopener">VER EN GIPHY</a>
          <button data-copy="${safe(x.url)}">COPIAR PÁGINA</button>
          <button data-copy="${safe(x.id)}">COPIAR ID</button>
        </div>
      </div>
    </article>`;
  }).join('');
  els.count.textContent = items.length;
  saveSelected();
}
async function loadQueries(){
  queryDefs = await fetch('./queries.json').then(r => {
    if(!r.ok) throw new Error('No se pudo cargar queries.json');
    return r.json();
  });
  unique(queryDefs.map(x=>x.category)).forEach(v => els.category.insertAdjacentHTML('beforeend', `<option>${safe(v)}</option>`));
  unique(queryDefs.map(x=>x.scene)).forEach(v => els.scene.insertAdjacentHTML('beforeend', `<option>${safe(v)}</option>`));
}
async function fetch300(){
  const apiKey = els.apiKey.value.trim();
  if(!apiKey){ alert('Añade tu GIPHY API key.'); return; }
  localStorage.setItem('kdx-giphy-api-key', apiKey);
  stopRequested = false;
  els.state.textContent = 'FETCHING';
  const seen = new Set(items.map(x=>x.id));
  let calls = 0;
  const ordered = [...queryDefs].sort((a,b)=>b.priority-a.priority);
  for(let i=0;i<ordered.length && items.length<300;i++){
    if(stopRequested) break;
    const def = ordered[i];
    const q = encodeURIComponent(def.q);
    const url = `https://api.giphy.com/v1/stickers/search?api_key=${encodeURIComponent(apiKey)}&q=${q}&limit=12&offset=0&rating=pg&lang=en`;
    els.state.textContent = `FETCH ${i+1}/${ordered.length}`;
    els.progressBar.style.width = `${Math.min(100,(i+1)/ordered.length*100)}%`;
    try{
      const res = await fetch(url);
      const payload = await res.json();
      if(!res.ok || payload.meta?.status >= 400) throw new Error(payload.meta?.msg || `HTTP ${res.status}`);
      calls++;
      for(const x of payload.data || []){
        if(seen.has(x.id)) continue;
        seen.add(x.id);
        x._query=def.q; x._category=def.category; x._scene=def.scene; x._roles=def.roles; x._priority=def.priority;
        items.push(x);
        if(items.length>=300) break;
      }
      els.queryCount.textContent = calls;
      render();
      await sleep(130);
    }catch(err){
      console.error(def.q, err);
      els.state.textContent = `ERROR: ${def.q}`;
      await sleep(300);
    }
  }
  els.state.textContent = stopRequested ? 'STOPPED' : (items.length>=300 ? 'READY 300' : `READY ${items.length}`);
  els.progressBar.style.width = items.length>=300 ? '100%' : els.progressBar.style.width;
}
els.fetchBtn.addEventListener('click', fetch300);
els.stopBtn.addEventListener('click', ()=>{stopRequested=true; els.state.textContent='STOP REQUESTED'});
els.clearBtn.addEventListener('click', ()=>{items=[];selected.clear();saveSelected();render();els.queryCount.textContent='0';els.state.textContent='IDLE';els.progressBar.style.width='0'});
['category','scene','bgMode','rating'].forEach(k=>els[k].addEventListener('change',render));
els.textFilter.addEventListener('input',render);
els.grid.addEventListener('click', async e=>{
  const selectId=e.target.dataset.select, copy=e.target.dataset.copy;
  if(selectId){ selected.has(selectId)?selected.delete(selectId):selected.add(selectId); render(); }
  if(copy){ await navigator.clipboard.writeText(copy); e.target.textContent='COPIADO'; setTimeout(()=>e.target.textContent=copy.startsWith('http')?'COPIAR PÁGINA':'COPIAR ID',900); }
});
els.exportJson.addEventListener('click', ()=>{
  download('kodex-giphy-300-manifest.json', JSON.stringify(items.map(itemToRecord),null,2));
});
els.exportCsv.addEventListener('click', ()=>{
  const r=items.map(itemToRecord); download('kodex-giphy-300-manifest.csv',recordsToCsv(r),'text/csv;charset=utf-8');
});
els.exportSelected.addEventListener('click', ()=>{
  const r=items.filter(x=>selected.has(x.id)).map(itemToRecord);
  download('kodex-giphy-selected.json',JSON.stringify(r,null,2));
});
els.apiKey.value=localStorage.getItem('kdx-giphy-api-key')||'';
await loadQueries();
render();
