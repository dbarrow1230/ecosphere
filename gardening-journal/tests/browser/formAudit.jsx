// Development-only form audit. All mutations are captured locally, never sent.
import React,{useEffect,useState,Suspense} from 'react';
import {createRoot} from 'react-dom/client';
import {MemoryRouter,Routes,Route} from 'react-router-dom';
import axios from 'axios';
import {IconProvider} from '@shared';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../src/styles/theme.css';
import {pages} from './pageMap.js';
const nativeFetch=window.fetch.bind(window);
const requests=[],readErrors=[];
let pending=0,changed=()=>{};
const clone=value=>JSON.parse(JSON.stringify(value));
const context=await nativeFetch('/api/app/current-business/gardening-journal').then(response=>response.json());
const users=await nativeFetch('/api/users').then(response=>response.json());
const actualUser=users.data?.[0]||{};
const business=context.business;
const user={_id:actualUser._id,name:'Audit user',username:'audit-user',email:'audit@example.test',isAdmin:true,isSuperAdmin:true,role:'superadmin',roles:[{name:'admin'}],business:business?._id,business_id:business?._id};
const stored=new Map();
const getItem=Storage.prototype.getItem;
Storage.prototype.getItem=function(key){if(['user','userInfo','authUser','currentUser'].includes(key))return JSON.stringify(user);if(['currentBusiness','business','businessInfo'].includes(key))return JSON.stringify(business);if(key==='token')return 'audit-only-no-server-writes';return stored.has(key)?stored.get(key):getItem.call(this,key);};
Storage.prototype.setItem=function(key,value){stored.set(key,String(value));};
Storage.prototype.removeItem=function(key){stored.delete(key);};
window.APP_CONFIG={APP_KEY:'gardening-journal'};
function capture(url,method,body){
 let payload=body;if(typeof body==='string'){try{payload=JSON.parse(body);}catch{payload=body;}}
 if(body instanceof FormData)payload=Object.fromEntries(body.entries());
 requests.push({url:String(url),method,payload:clone(payload||{})});changed();
 const saved={...payload,_id:String(url).match(/[a-f0-9]{24}/i)?.[0]||'6ae000000000000000000001'};
 return {...saved,success:true,data:saved,task:saved,user:saved,reminder:null,filename:'audit-image.jpg',relativePath:'plant/audit-image.jpg'};
}
window.fetch=async(input,options={})=>{
 const url=typeof input==='string'?input:input.url;
 const method=String(options.method||input.method||'GET').toUpperCase();
 if(!['GET','HEAD'].includes(method))return new Response(JSON.stringify(capture(url,method,options.body)),{status:method==='POST'?201:200,headers:{'Content-Type':'application/json'}});
 pending++;changed();
 try{const response=await nativeFetch(input,options);if(!response.ok)readErrors.push({url,status:response.status});return response;}finally{pending--;changed();}
};
axios.defaults.adapter=async config=>{
 const method=String(config.method||'get').toUpperCase();
 if(!['GET','HEAD'].includes(method))return {data:capture(config.url,method,config.data),status:200,statusText:'OK',headers:{},config};
 const url=new URL(config.url,location.origin);for(const [key,value] of Object.entries(config.params||{}))if(value!=null)url.searchParams.set(key,value);
 const response=await window.fetch(url.href);const data=await response.json();if(!response.ok)throw new Error(data.message||`GET ${response.status}`);return {data,status:response.status,statusText:response.statusText,headers:{},config};
};
const modules=new Map();
for(const page of pages)modules.set(page.route,React.lazy(()=>import(/* @vite-ignore */ page.loadPath)));
class Boundary extends React.Component{constructor(props){super(props);this.state={error:null};}static getDerivedStateFromError(error){return {error:error.message};}render(){return this.state.error?<p role="alert">{this.state.error}</p>:this.props.children;}}
function Harness(){
 const [selected,setSelected]=useState('/seeds'),[run,setRun]=useState(0),[version,setVersion]=useState(0);
 changed=()=>setVersion(value=>value+1);
 const page=pages.find(page=>page.route===selected),Component=modules.get(selected);
 const route=selected.replace(':id','6955680ee70dc59f22debb80').replace(':token','audit-token');
 return <><header className="p-3"><h1>Form audit · requests are captured, not saved</h1><label htmlFor="audit-page">Page under test</label><select id="audit-page" value={selected} onChange={event=>{requests.length=0;readErrors.length=0;setSelected(event.target.value);setRun(value=>value+1);}}>{pages.map(page=><option key={page.route} value={page.route}>{page.route} · {page.label}</option>)}</select><button onClick={()=>{requests.length=0;readErrors.length=0;setRun(value=>value+1);}}>Reset page</button><p role="status">{pending?`Loading ${pending} reference requests`:'Reference requests settled'}</p></header>
 <Boundary key={selected+run}><MemoryRouter key={selected+run} initialEntries={[route]}><Suspense fallback={<p>Loading page component…</p>}><Routes><Route path={selected} element={<Component user={user}/>}/></Routes></Suspense></MemoryRouter></Boundary>
 <section className="p-3"><h2>Captured submissions</h2><pre id="audit-submissions">{JSON.stringify(requests,null,2)}</pre><h2>Reference errors</h2><pre id="audit-read-errors">{JSON.stringify(readErrors,null,2)}</pre></section></>;
}
createRoot(document.getElementById('audit-root')).render(<IconProvider><Harness/></IconProvider>);
