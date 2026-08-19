import sharp from "sharp";
const f=process.argv[2], X0=+process.argv[3],Y0=+process.argv[4],W=+process.argv[5],H=+process.argv[6],U=+(process.argv[7]||70);
const {data,info}=await sharp(f).extract({left:X0,top:Y0,width:W,height:H}).raw().toBuffer({resolveWithObject:true});
const ch=info.channels;
const lum=(x,y)=>{const i=(y*W+x)*ch;return 0.299*data[i]+0.587*data[i+1]+0.114*data[i+2];};
for(let x=0;x<W;x+=16){
  let top=-1,bot=-1;
  for(let y=0;y<H;y++){if(lum(x,y)>U){if(top<0)top=y;bot=y;}}
  console.log(`x${X0+x}\ttop=${top<0?"-":Y0+top}\tbot=${bot<0?"-":Y0+bot}`);
}
