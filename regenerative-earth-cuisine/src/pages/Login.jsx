import {useState} from "react";
import {useNavigate} from "react-router-dom";
import "./Login.css";

export default function Login({onLogin}){
 const navigate=useNavigate();
 const [form,setForm]=useState({username:"",password:"",remember:true});
 const [error,setError]=useState("");
 const [busy,setBusy]=useState(false);
 const submit=async event=>{
  event.preventDefault(); setBusy(true); setError("");
  try{
   const response=await fetch("/api/users/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({username:form.username,password:form.password})});
   const result=await response.json();
   if(!response.ok) throw new Error(result.message||"Unable to sign in");
   onLogin(result,form.remember); navigate("/dashboard");
  }catch(err){setError(err.message);}finally{setBusy(false);}
 };
 return <main className="login-page"><form className="login-card" onSubmit={submit}><p className="eyebrow">Account access</p><h1>Login</h1><p>Sign in to continue to Regenerative Earth Cuisine.</p>{error&&<div className="form-error" role="alert">{error}</div>}<label>Username<input value={form.username} onChange={e=>setForm({...form,username:e.target.value})} autoComplete="username" required/></label><label>Password<input type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} autoComplete="current-password" required/></label><label className="remember"><input type="checkbox" checked={form.remember} onChange={e=>setForm({...form,remember:e.target.checked})}/> Remember me</label><button type="submit" disabled={busy}>{busy?"Signing in…":"Login"}</button></form></main>;
}
