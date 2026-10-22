import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import vm from "node:vm";
import test from "node:test";

const source=readFileSync(new URL("../../shared/ecosphereAuthBridge.js",import.meta.url),"utf8");
function browser(referrer="http://localhost:5174/applications/gardening-journal"){
 const messages=[];
 const listeners={};
 const parent={postMessage:(data,origin)=>messages.push({data,origin})};
 const location=new URL("http://localhost:6013/dashboard");
 const storage=()=>{const map=new Map();return {getItem:key=>map.get(key)??null,setItem:(key,value)=>map.set(key,value)};};
 const window={parent,location,addEventListener:(name,callback)=>(listeners[name]??=[]).push(callback),dispatchEvent:()=>{}};
 window.history={pushState(...args){location.href=new URL(args[2],location).href;},replaceState(...args){location.href=new URL(args[2],location).href;}};
 vm.runInNewContext(source,{window,document:{referrer},URL,localStorage:storage(),sessionStorage:storage(),CustomEvent:class{}});
 return {window,messages,emit:(name,event)=>listeners[name]?.forEach(listener=>listener(event))};
}
test("reports dashboard, navigation, query strings, fragments and history changes",()=>{
 const {window,messages,emit}=browser();
 assert.equal(messages.at(-1).data.path,"/dashboard");
 window.history.pushState({},"","/about?view=details#contact");
 assert.equal(messages.at(-1).data.path,"/about?view=details#contact");
 window.history.replaceState({},"","/journal?entry=123");
 assert.equal(messages.at(-1).data.path,"/journal?entry=123");
 window.location.pathname="/dashboard";
 emit("popstate",{});
 assert.equal(messages.at(-1).data.path,"/dashboard?entry=123");
 assert.ok(messages.every(message=>message.origin==="http://localhost:5174"));
});
test("ignores untrusted messages and supports missing referrers",()=>{
 const {window,messages,emit}=browser("");
 const data={type:"ECOSPHERE_AUTH_SYNC",version:1,storage:{}};
 emit("message",{origin:"https://example.com",source:window.parent,data});
 emit("message",{origin:"http://localhost:5174",source:{},data});
 assert.equal(messages.length,0);
 emit("message",{origin:"http://localhost:5174",source:window.parent,data});
 assert.equal(messages.at(-1).data.path,"/dashboard");
});
