const AUTH_STORAGE_KEYS=["token","user","userInfo","authUser","currentUser"];
const ECOSPHERE_PORT="5174";
const LOCAL_HOSTS=new Set(["localhost","127.0.0.1"]);
let shellOrigin="";

const isTrustedEcosphereOrigin=origin=>{
 try{
  const url=new URL(origin);
  return LOCAL_HOSTS.has(url.hostname)&&url.port===ECOSPHERE_PORT;
 }catch{
  return false;
 }
};

const reportCurrentPage=()=>{
 if(window.parent===window||!shellOrigin)return;
 window.parent.postMessage({
  type:"ECOSPHERE_PAGE_CHANGED",version:1,
  path:window.location.pathname+window.location.search+window.location.hash
 },shellOrigin);
};

// React Router updates history without reloading the embedded application.
for(const method of ["pushState","replaceState"]){
 const original=window.history[method];
 window.history[method]=function(...args){
  const result=original.apply(this,args);
  reportCurrentPage();
  return result;
 };
}
window.addEventListener("popstate",reportCurrentPage);
window.addEventListener("hashchange",reportCurrentPage);
try{
 const referrerOrigin=new URL(document.referrer).origin;
 if(isTrustedEcosphereOrigin(referrerOrigin))shellOrigin=referrerOrigin;
}catch{/* Authentication sync supplies the shell origin when referrer is absent. */}
reportCurrentPage();

const applyStorageValues=(storage,values)=>{
 let changed=false;

 for(const key of AUTH_STORAGE_KEYS){
  if(!Object.prototype.hasOwnProperty.call(values,key))continue;

  const nextValue=values[key];
  if(typeof nextValue!=="string"||storage.getItem(key)===nextValue)continue;

  storage.setItem(key,nextValue);
  changed=true;
 }

 return changed;
};

window.addEventListener("message",event=>{
 if(event.source!==window.parent)return;
 if(!isTrustedEcosphereOrigin(event.origin))return;
 if(event.data?.type!=="ECOSPHERE_AUTH_SYNC"||event.data?.version!==1)return;
 shellOrigin=event.origin;

 const localChanged=applyStorageValues(localStorage,event.data.storage?.localStorage||{});
 const sessionChanged=applyStorageValues(sessionStorage,event.data.storage?.sessionStorage||{});

 if(localChanged||sessionChanged)window.dispatchEvent(new CustomEvent("ECOSPHERE_AUTH_UPDATED"));
 reportCurrentPage();
});
