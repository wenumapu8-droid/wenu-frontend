/** Coverage slots for the KODEX universe. Slots DO NOT indicate implemented narration. */
import {ECHO_EPISODES} from './corpus.mjs';

export const ALPHABET_SLOTS=Object.freeze(Array.from({length:25},(_,i)=>{
 const id=String.fromCharCode(65+i);
 const role=id==='A'?'THRESHOLD':id==='M'?'HEART / OPTIONAL':id==='Y'?'RETURN':null;
 return Object.freeze({id,role,contentState:'NOT_AUTHORED',runtimeState:'UNVERIFIED'});
}));
export const CITY_SLOTS=Object.freeze(Array.from({length:46},(_,i)=>Object.freeze({
 id:'KDX-CITY.'+String(i+1).padStart(2,'0'),
 // These are atlas coordinates, not claims about a deployed city app.
 conceptPlateStatus:i<41?'DOCUMENTED_IN_ATLAS':'PENDING_IN_ATLAS',
 contentState:'NOT_AUTHORED',
 runtimeState:'UNVERIFIED'
})));
export const KDX_ECHO_SURFACES=Object.freeze([
 'SEVEN_SCENES','ALPHABET_A_Y','LIVING_CITIES','BOOKS_AND_FOLIOS',
 'ARCHIVE','LABS','RESEARCH','GENERATIVE_MACHINES','COSMOLOGY',
 'RETURN','INSTALLATIONS','TEMPLE_AND_ALTAR'
]);
export function coverageReport(){
 const authoredZones=Object.keys(ECHO_EPISODES);
 return {
  sceneChapters:['THRESHOLD','PROLOGUE','DESCENT','ARCHIVE','MACHINE','COSMOLOGY','RETURN']
    .filter(x=>authoredZones.includes(x)).length,
  alphabetSlots:ALPHABET_SLOTS.length,
  alphabetNarrativesApproved:0,
  citySlots:CITY_SLOTS.length,
  cityNarrativesApproved:0,
  availablePilotZones:authoredZones.length,
  voiceAssetsGenerated:'UNVERIFIED'
 };
}
