export async function inventoryApi(url,options={}){
 const response=await fetch(url,{...options,headers:{"Content-Type":"application/json",...options.headers}});
 const body=await response.json().catch(()=>null);
 if(!response.ok)throw new Error(body?.error||body?.message||`Request failed (${response.status})`);
 if(body===null)throw new Error("The API returned an invalid response.");
 return body;
}

export function rowsFrom(body){
 if(Array.isArray(body))return body;
 for(const key of ["data","businesses","vendors","categories","locations"]){
  if(Array.isArray(body?.[key]))return body[key];
 }
 throw new Error("The API did not return a record list.");
}

export async function allRows(url){
 const result=[];
 for(let page=1;;page++){
  const body=await inventoryApi(`${url}${url.includes("?")?"&":"?"}limit=100&page=${page}`);
  result.push(...rowsFrom(body));
  if(!body.pages||page>=body.pages)return result;
 }
}

export const referenceId=value=>typeof value==="object"?String(value?._id?.$oid||value?._id||value?.id||value?.$oid||""):String(value||"");

export function referenceLabel(value){
 if(value==null||value==="")return "—";
 if(typeof value!=="object")return /^[a-f\d]{24}$/i.test(String(value))?"Missing linked record":String(value);
 const name=value.displayName||value.fullName||value.name||value.legalName||value.title||value.label||value.username||value.email||value.orderNumber||value.purchaseNumber||value.receiptNumber||value.returnNumber||value.code||value.symbol||value.product?.name;
 return name?referenceLabel(name):"Unnamed linked record";
}
