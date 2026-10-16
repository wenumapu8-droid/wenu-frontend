// Mide "aplanamiento" de la sombra 4D: rms/maxR. Bajo = casi de canto.
const V4=[];for(let i=0;i<16;i++)V4.push([(i&1?1:-1),(i&2?1:-1),(i&4?1:-1),(i&8?1:-1)]);
const rot=(p,i,j,a)=>{const c=Math.cos(a),s=Math.sin(a),x=p[i],y=p[j];p[i]=x*c-y*s;p[j]=x*s+y*c;};
const T_AWARE=1.55,T_OPEN=4.15;
const PH = Number(process.argv[2]||0);            // desfase a probar
const ang=t=>({xw:0.24*t+0.34*Math.max(0,t-T_AWARE)+0.80*Math.max(0,t-T_OPEN)+PH,
               yz:0.17*t+0.25*Math.max(0,t-T_AWARE)+0.55*Math.max(0,t-T_OPEN),
               xy:0.10*t, zw:0.14*t+0.45*Math.max(0,t-T_OPEN)});
const ease=x=>x<0.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2;
const span=(t,a,b)=>Math.max(0,Math.min(1,(t-a)/(b-a)));
function flat(t){
  const pOpen=ease(span(t,T_OPEN,T_OPEN+1.3));
  const dw=2.90+(1.95-2.90)*pOpen;
  const A=ang(t); let max=1e-9,s2=0;
  for(const v of V4){const p=v.slice();
    rot(p,0,3,A.xw);rot(p,1,2,A.yz);rot(p,0,1,A.xy);rot(p,2,3,A.zw);
    const k4=1/Math.max(0.17,dw-p[3]);
    const x3=p[0]*k4,y3=p[1]*k4,z3=p[2]*k4;
    const k3=1/Math.max(0.30,3.1-z3);
    const x=x3*k3,y=y3*k3,r2=x*x+y*y;
    s2+=r2; max=Math.max(max,Math.sqrt(r2));}
  return Math.sqrt(s2/16)/max;
}
let worstLate=1, at=0, bad=0;
for(let t=0;t<=8;t+=0.02){
  const f=flat(t);
  if(f<0.34) bad++;
  if(t>=6.0&&f<worstLate){worstLate=f;at=t;}
}
console.log(`desfase ${PH.toFixed(2)}  peor-en-clímax ${worstLate.toFixed(3)} @t=${at.toFixed(2)}  frames-planos(total) ${bad}`);
