export const getObjectId=value=>{
 if(!value)return "";
 if(typeof value==="string")return value;
 if(typeof value==="object"){
  if(typeof value.$oid==="string")return value.$oid;
  if(typeof value._id==="string")return value._id;
  if(typeof value.id==="string")return value.id;
  if(typeof value._id?.$oid==="string")return value._id.$oid;
  if(typeof value.id?.$oid==="string")return value.id.$oid;
 }
 return "";
};

const unwrapBusiness=data=>{
 if(!data||typeof data!=="object")return null;
 if(data?.business&&typeof data.business==="object")return data.business;
 if(data?.data&&typeof data.data==="object"&&!Array.isArray(data.data))return data.data;
 return data;
};

export const getRuntimeAppKey=()=>{
 const envKey=String(import.meta.env?.VITE_APP_KEY||"").trim().toLowerCase();
 if(envKey)return envKey;

 const configKey=String(window?.APP_CONFIG?.APP_KEY||"").trim().toLowerCase();
 if(configKey)return configKey;

 const meta=document.querySelector('meta[name="app-key"]');
 return String(meta?.getAttribute("content")||"").trim().toLowerCase();
};

export const loadCurrentBusiness=async()=>{
 const appKey=getRuntimeAppKey();
 if(!appKey)throw new Error("Current app key is not configured.");

 const res=await fetch(`/api/app/current-business/${encodeURIComponent(appKey)}`,{
  headers:{"Content-Type":"application/json"}
 });

 if(!res.ok)throw new Error("Failed to load current business.");

 const data=await res.json().catch(()=>null);
 const business=unwrapBusiness(data);
 const businessId=getObjectId(business);

 if(!businessId)throw new Error("Current business is not configured.");

 return business;
};
