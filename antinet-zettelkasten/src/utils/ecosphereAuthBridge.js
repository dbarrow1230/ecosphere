const AUTH_STORAGE_KEYS=["token","user","userInfo","authUser","currentUser"];
const ECOSPHERE_PORT="5174";
const LOCAL_HOSTS=new Set(["localhost","127.0.0.1"]);

const isTrustedEcosphereOrigin=origin=>{
 try{
  const url=new URL(origin);
  return LOCAL_HOSTS.has(url.hostname)&&url.port===ECOSPHERE_PORT;
 }catch{
  return false;
 }
};

const applyStorageValues=(storage,values)=>{
 let changed=false;

 for(const key of AUTH_STORAGE_KEYS){
  if(!Object.prototype.hasOwnProperty.call(values,key))continue;

  const nextValue=values[key];
  if(typeof nextValue!=="string")continue;
  if(storage.getItem(key)===nextValue)continue;

  storage.setItem(key,nextValue);
  changed=true;
 }

 return changed;
};

window.addEventListener("message",event=>{
 if(!isTrustedEcosphereOrigin(event.origin))return;
 if(event.data?.type!=="ECOSPHERE_AUTH_SYNC"||event.data?.version!==1)return;

 const localValues=event.data.storage?.localStorage||{};
 const sessionValues=event.data.storage?.sessionStorage||{};
 const localChanged=applyStorageValues(localStorage,localValues);
 const sessionChanged=applyStorageValues(sessionStorage,sessionValues);

 if(localChanged||sessionChanged)window.dispatchEvent(new CustomEvent("ECOSPHERE_AUTH_UPDATED"));
});
