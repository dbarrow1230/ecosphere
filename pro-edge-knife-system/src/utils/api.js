export const api=async(path,options={})=>{
 const token=localStorage.getItem("token")||sessionStorage.getItem("token");
 const response=await fetch(path,{
  ...options,
  headers:{"Content-Type":"application/json",...(token?{Authorization:`Bearer ${token}`}:{ }),...options.headers}
 });
 const data=await response.json().catch(()=>null);
 if(!response.ok)throw new Error(data?.message||`Request failed (${response.status})`);
 return data;
};

export const money=value=>new Intl.NumberFormat("en-US",{style:"currency",currency:"USD"}).format(Number(value)||0);
