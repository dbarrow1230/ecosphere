export async function photographyApi(endpoint,options={}){
 const token=localStorage.getItem("token")||sessionStorage.getItem("token");
 const headers=new Headers(options.headers);
 if(token)headers.set("Authorization",`Bearer ${token}`);
 if(options.body&&!(options.body instanceof FormData))headers.set("Content-Type","application/json");
 const response=await fetch(endpoint,{credentials:"include",...options,headers});
 const data=await response.json().catch(()=>null);
 if(!response.ok){
  const error=new Error(data?.message||`Request failed (${response.status}).`);
  error.status=response.status;
  throw error;
 }
 return data;
}

export async function photographyOptions(endpoint){
 const rows=[];
 let page=1;
 let total=Infinity;
 while(rows.length<total){
  const result=await photographyApi(`${endpoint}?limit=200&page=${page++}`);
  if(!Array.isArray(result.data))throw new Error("Unexpected list response.");
  rows.push(...result.data);
  total=result.total;
  if(!result.data.length)break;
 }
 return rows;
}

export const recordId=value=>typeof value==="string"?value:value?._id||"";
export const localDateTime=value=>{
 if(!value)return "";
 const date=new Date(value);
 if(Number.isNaN(date.getTime()))return "";
 const adjusted=new Date(date.getTime()-date.getTimezoneOffset()*60000);
 return adjusted.toISOString().slice(0,16);
};
