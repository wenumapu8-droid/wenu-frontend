import sharp from "sharp";
const f=process.argv[2],X0=+process.argv[3],Y0=+process.argv[4],W=+process.argv[5],H=+process.argv[6],U=+(process.argv[7]||90),P=+(process.argv[8]||20);
const {data,info}=await sharp(f).extract({left:X0,top:Y0,width:W,height:H}).raw().toBuffer({resolveWithObject:true});
const ch=info.channels;
const lum=(x,y)=>{const i=(y*W+x)*ch;return 0.299*data[i]+0.587*data[i+1]+0.114*data[i+2];};
for(let y=0;y<H;y+=P){
  let a=-1,b=-1;
  for(let x=0;x<W;x++){if(lum(x,y)>U){if(a<0)a=x;b=x;}}
  console.log(`y${Y0+y}\tizq=${a<0?"-":X0+a}\tder=${b<0?"-":X0+b}\tr=${a<0?"-":Math.round((b-a)/2)}`);
}
