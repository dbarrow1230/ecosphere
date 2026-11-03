export async function travelApi(path="",options={}) {
 const token=localStorage.getItem("token") || sessionStorage.getItem("token");
 const res=await fetch(`/api/travel-logs${path}`,{
  ...options,
  credentials:"same-origin",
  headers:{"Content-Type":"application/json",...(token ? {Authorization:`Bearer ${token}`} : {}),...options.headers}
 });
 const data=await res.json().catch(()=>({message:"The server returned an invalid response. Check the backend is running."}));
 if(!res.ok) throw new Error(res.status===401 ? "Sign in to save or load your logs." : data.message || "Unable to access logs.");
 return data;
}
