/** KDX.ECHO · Original authored pilot. Not scientific assertions. */
export const ECHO_EPISODES = Object.freeze({
 THRESHOLD:[{id:'threshold_01',es:'Todo archivo comienza con una ausencia. Antes de la imagen, existe la posibilidad de una forma. Aquí comienza tu recorrido por KODEX.',en:'Every archive begins with an absence. Before the image, there is the possibility of form. Your journey through KODEX begins here.'}],
 PROLOGUE:[
 {id:'prologue_01',es:'Observa. Esta estructura no es un objeto inmóvil: es una relación entre señales, materia y tiempo. Tu presencia no la define. Tus acciones pueden transformarla.',en:'Observe. This structure is not a still object. It is a relation between signals, matter and time. Your presence does not define it. Your actions may transform it.'},
 {id:'prologue_02',es:'Cuando decidas intervenir, el sistema registrará una acción, no una interpretación de quién eres. Esa diferencia importa.',en:'When you choose to interact, the system will record an action, not an interpretation of who you are. That distinction matters.'}],
 DESCENT:[{id:'descent_01',es:'Descender no significa avanzar en una línea recta. Cada capa revela otras posibilidades. Algunas rutas regresan al origen y otras cambian aquello que reconocemos.',en:'Descent is not a straight line. Every layer reveals other possibilities. Some routes return to the origin; others change what we recognize.'}],
 ARCHIVE:[{id:'archive_01',es:'Un archivo no es únicamente una colección de objetos. También conserva procedencias, decisiones y versiones. Abre un registro para conocer su contexto.',en:'An archive is not only a collection of objects. It also preserves sources, decisions and versions. Open a record to examine its context.'}],
 MACHINE:[{id:'machine_01',es:'Esta máquina existe para hacer visibles las transformaciones. Modifica un parámetro y observa qué cambia. La simulación no es una predicción del mundo físico.',en:'This machine makes transformations visible. Change a parameter and observe the result. A simulation is not a prediction of the physical world.'}],
 COSMOLOGY:[{id:'cosmology_01',es:'Cada modelo del universo revela ciertas relaciones y deja otras fuera. Aquí conviven conocimiento documentado e imaginación especulativa. No deben confundirse.',en:'Every model of the universe reveals some relationships while leaving others outside. Documented knowledge and speculative imagination coexist here. They must not be confused.'}],
 RETURN:[{id:'return_01',es:'Has vuelto al umbral. El recorrido termina aquí, pero la forma puede cambiar. Si existen huellas registradas, el archivo puede mostrarte qué acciones ocurrieron.',en:'You have returned to the threshold. The route ends here, but the form may change. If recorded traces exist, the archive can show which actions took place.'}],
 CITY:[{id:'city_01',es:'Imaginemos una ciudad como un sistema de intercambios. Agua, energía, materiales y habitantes crean relaciones que pueden visualizarse. Esto es una propuesta de diseño, no una ciudad construida.',en:'Imagine a city as a system of exchanges. Water, energy, materials and inhabitants form relationships that can be visualized. This is a design proposal, not a built city.'}],
 LAB:[{id:'lab_01',es:'Este laboratorio transforma señales en formas observables. Prueba una variable. Compara el estado anterior con el nuevo. Conserva la diferencia.',en:'This laboratory transforms signals into observable forms. Try changing a variable. Compare the previous state to the new one. Preserve the difference.'}],
 RESEARCH:[{id:'research_01',es:'La semejanza entre dos ideas no demuestra que sean equivalentes. Sigue las fuentes, examina las evidencias y mantén visible lo que todavía es una hipótesis.',en:'A similarity between two ideas does not prove that they are equivalent. Follow the sources, examine evidence and keep hypotheses clearly marked.'}],
 GRAPH:[{id:'graph_01',es:'Los nodos no están ordenados como páginas de un libro. Cada elección abre nuevas conexiones. Regresar puede significar encontrar una relación diferente.',en:'These nodes are not ordered like pages in a book. Each choice opens new connections. Returning may reveal a different relationship.'}]
});
export const ZONES=Object.freeze(Object.keys(ECHO_EPISODES));
export const AUDIO_PATH='/audio/kodex/echo';
export function getEpisode(zone,language='es',mode='guide'){
 const key=String(zone||'').toUpperCase(), parts=ECHO_EPISODES[key]||[];
 const chosen=mode==='ambient'?parts.slice(0,1):parts,lang=language==='en'?'en':'es';
 return chosen.map(s=>({id:s.id,zone:key,lang,text:s[lang],url:`${AUDIO_PATH}/${lang}/${s.id}.mp3`,provenance:'ORIGINAL_EDITORIAL_PILOT'}));
}
export function resolveZone(path,slideId){
 const p=String(path||'').toLowerCase();
 if(!/^\/kodex(?:\/|$)/.test(p))return null;
 const active=String(slideId||'').toUpperCase();
 if(ECHO_EPISODES[active])return active;
 if(p.includes('/return'))return 'RETURN';
 if(p.includes('/lab'))return 'LAB';
 if(p.includes('/archive')||p.includes('/vol')||p.includes('/libro')||p.includes('/folio')||p.includes('/editions'))return 'ARCHIVE';
 if(p.includes('/world'))return 'GRAPH';
 if(p.includes('/research'))return 'RESEARCH';
 if(p==='/kodex'||p==='/kodex/')return 'THRESHOLD';
 return null;
}
