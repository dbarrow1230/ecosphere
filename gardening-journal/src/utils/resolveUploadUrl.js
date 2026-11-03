const uploadFolders=new Set(["attachments","avatars","equipment","logos","plant","seed","vendors"]);

export const resolveUploadUrl=(input,defaultFolder="")=>{
 let value=input;
 if(value&&typeof value==="object")value=value.url||value.relativePath||value.path||value.filename||"";

 const raw=String(value||"").trim().replace(/\\/g,"/");
 if(!raw)return "";
 if(/^(?:blob:|data:|https?:\/\/)/i.test(raw))return raw;

 const backendUrl=String(import.meta.env.VITE_BACKEND_URL||"").replace(/\/$/,"");
 const clean=raw.replace(/^\.?\/+/,"");
 const firstFolder=clean.split("/")[0].toLowerCase();
 const relative=uploadFolders.has(firstFolder)
  ?`/${clean}`
  :defaultFolder?`/${defaultFolder.replace(/^\/+|\/+$/g,"")}/${clean}`:`/${clean}`;

 return backendUrl?`${backendUrl}${relative}`:relative;
};

export default resolveUploadUrl;
