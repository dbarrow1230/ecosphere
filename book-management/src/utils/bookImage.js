const backendUrl=(import.meta.env?.VITE_BACKEND_URL||"").replace(/\/$/,"");
export const bookUploadUrl=`${backendUrl}/api/upload/images`;

export const bookImageSrc=(value,version)=>{
 const image=typeof value==="string"?value.trim():"";
 if(!image)return "";
 const normalized=image.replace(/\\/g,"/");
 const imagePath=/^(?:https?:|data:|blob:|\/)/i.test(normalized)
  ?normalized
  :normalized.startsWith("images/")?`/${normalized}`:`/images/${normalized}`;
 const src=imagePath.startsWith("/images/")?`${backendUrl}${imagePath}`:imagePath;
 if(!version||/^(?:data:|blob:)/i.test(src))return src;
 const hashIndex=src.indexOf("#");
 const base=hashIndex<0?src:src.slice(0,hashIndex);
 const hash=hashIndex<0?"":src.slice(hashIndex);
 return `${base}${base.includes("?")?"&":"?"}v=${encodeURIComponent(version)}${hash}`;
};
