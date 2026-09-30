export function itmFetch(url,options={}){
 const token=localStorage.getItem("token")||sessionStorage.getItem("token")||"";
 return fetch(url,{...options,headers:{...options.headers,...(token?{Authorization:`Bearer ${token}`}:{})}});
}
export async function itmApi(url,options={}){
 const response=await itmFetch(url,{...options,headers:{"Content-Type":"application/json",...options.headers}});
 const data=await response.json().catch(()=>({}));
 if(!response.ok)throw new Error(data.message||"Unable to load or save this record.");
 return data;
}
export const dateInput=value=>value?String(value).slice(0,10):"";
export const displayDate=value=>value?String(value).slice(0,10):"—";
