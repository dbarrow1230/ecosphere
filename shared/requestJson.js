// A failed HTTP request must not be presented as a successful save or empty list.
export async function requestJson(url,options){
 const response=await fetch(url,options);
 const body=await response.json().catch(()=>null);
 if(!response.ok){
  const detail=typeof body?.error==="string"?body.error:body?.message;
  throw new Error(detail||`Request failed (${response.status})`);
 }
 if(body===null&&response.status!==204)throw new Error("The server returned an invalid response.");
 return body;
}
