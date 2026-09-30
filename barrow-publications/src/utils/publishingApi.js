import {useCallback,useEffect,useState} from "react";
import runtime from "../../../app-runtime-config.json";
export const idOf=value=>typeof value==="object"?String(value?._id||""):String(value||"");
const bookAssetBase=import.meta.env.VITE_BOOK_MANAGEMENT_ASSET_URL||`http://${runtime.host}:${runtime.backends["book-management"]}`;
export const bookCoverUrl=book=>{
 const image=Array.isArray(book?.images)?book.images.find(Boolean):book?.coverUrl||book?.thumbnail;
 if(!image)return "";
 if(/^https?:\/\//i.test(image))return image;
 return `${bookAssetBase}/images/${encodeURIComponent(String(image).replace(/^\/?images\//,""))}`;
};
export const bookAuthorNames=book=>(book?.authors||[]).map(author=>typeof author==="string"?author:author.displayName||[author.firstName,author.middleName,author.lastName].filter(Boolean).join(" ")).filter(Boolean).join(", ");
export async function publishingApi(path,options={}){
 const token=(localStorage.getItem("token")||sessionStorage.getItem("token")||"").replace(/^["']|["']$/g,"");
 const response=await fetch(`/api/${path}`,{...options,headers:{"Content-Type":"application/json",...(token?{Authorization:`Bearer ${token}`}:{})},...(options.body?{body:JSON.stringify(options.body)}:{})});
 const data=await response.json().catch(()=>({}));
 if(!response.ok)throw new Error(data.message||data.error||`Request failed (${response.status})`);
 return data;
}
export const rowsOf=(data,key)=>{
 for(const value of [data,data?.[key],data?.data?.[key],data?.data])if(Array.isArray(value))return value;
 throw new Error(`Invalid ${key} response from Book Management.`);
};
const catalogNames=["publishers","genres","categories"];
const fetchCatalog=async()=>{
 const settled=await Promise.allSettled(catalogNames.map(async key=>rowsOf(await publishingApi(`book-catalog/${key}`),key)));
 const values={};const errors={};
 settled.forEach((result,index)=>{
  const key=catalogNames[index];
  if(result.status==="fulfilled")values[key]=result.value;
  else errors[key]=result.reason?.message||"Unable to load from Book Management.";
 });
 return {values,errors};
};
export function useCatalog(){
 const [catalog,setCatalog]=useState({publishers:[],genres:[],categories:[]});
 const [errors,setErrors]=useState({});
 const [loading,setLoading]=useState(true);
 const reload=useCallback(async()=>{
  setLoading(true);
  const result=await fetchCatalog();
  setCatalog(previous=>({...previous,...result.values}));
  setErrors(result.errors);
  setLoading(false);
 },[]);
 useEffect(()=>{let active=true;fetchCatalog().then(result=>{if(active){setCatalog(previous=>({...previous,...result.values}));setErrors(result.errors);setLoading(false);}});return()=>{active=false;};},[]);
 const error=Object.entries(errors).map(([key,message])=>`${key}: ${message}`).join(" ");
 return {...catalog,error,errors,publisherError:errors.publishers||"",loading,reload};
}
export function useBookCatalog(){
 const [books,setBooks]=useState([]);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");
 useEffect(()=>{let active=true;publishingApi("book-catalog/books").then(data=>{if(active)setBooks(rowsOf(data,"books"));}).catch(cause=>{if(active)setError(cause.message);}).finally(()=>{if(active)setLoading(false);});return()=>{active=false;};},[]);
 return {books,loading,error};
}
