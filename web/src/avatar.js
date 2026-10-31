export const AVATAR_SIZE=96;
export const MAX_AVATAR_LENGTH=21871;
export function isAvatarPhoto(value){return typeof value==='string'&&value.length<=MAX_AVATAR_LENGTH&&/^data:image\/jpeg;base64,[A-Za-z0-9+/]+={0,2}$/.test(value);}
export function avatarGradient(principal){let hash=2166136261;for(const c of String(principal))hash=Math.imul(hash^c.charCodeAt(0),16777619)>>>0;const h=hash%360,h2=(h+55+((hash>>>12)%90))%360;return `linear-gradient(${110+(hash%70)}deg,hsl(${h} ${58+(hash%17)}% 58%),hsl(${h2} ${62+((hash>>>8)%15)}% 47%))`;}
export function avatarMarkup(principal,value=''){return `<span class="account-avatar-surface" style="background:${avatarGradient(principal)}" aria-hidden="true">${isAvatarPhoto(value)?`<img class="account-photo" src="${value}" width="96" height="96" alt="">`:''}</span>`;}
export async function compressAvatar(file){
 if(!['image/jpeg','image/png','image/webp'].includes(file?.type))throw Error('Choose a JPEG, PNG or WebP image.');
 if(file.size>8*1024*1024)throw Error('Choose an image smaller than 8 MB.');
 let bitmap;try{bitmap=await createImageBitmap(file,{imageOrientation:'from-image'});}catch{throw Error('This image could not be opened. Try another photo.');}
 try{
  if(!bitmap.width||!bitmap.height||bitmap.width*bitmap.height>32000000)throw Error('Choose an image with no more than 32 megapixels.');
  const canvas=document.createElement('canvas');canvas.width=canvas.height=AVATAR_SIZE;const ctx=canvas.getContext('2d');if(!ctx)throw Error('Image processing is unavailable in this browser.');
  ctx.fillStyle='#fff';ctx.fillRect(0,0,96,96);const side=Math.min(bitmap.width,bitmap.height);ctx.drawImage(bitmap,(bitmap.width-side)/2,(bitmap.height-side)/2,side,side,0,0,96,96);
  for(const quality of [.84,.72,.60,.48]){const data=canvas.toDataURL('image/jpeg',quality);if(isAvatarPhoto(data))return data;}
  throw Error('The compressed image is too large. Please choose another photo.');
 }finally{bitmap.close();}
}
if(typeof document!=='undefined')document.addEventListener('error',event=>{if(event.target?.classList?.contains('account-photo'))event.target.remove();},true);
