import Alert from "../../components/AppAlert.jsx";
// /src/forms/CurrencyForm.jsx
import React,{useEffect,useRef,useState} from 'react';

export default function CurrencyForm({initialData={},countries=[],endpoint='/api/currencies',method='POST',onSuccess}){
const [form,setForm]=useState({
name:initialData.name||'',
code:initialData.code||'',
symbol:initialData.symbol||'',
country:initialData.country?._id||initialData.country||'',
isActive:typeof initialData.isActive==='boolean'?initialData.isActive:true
});
const [loading,setLoading]=useState(false);
const [alert,setAlert]=useState({type:'',message:'',show:false});
const alertTimerRef=useRef(null);

const showAutoCloseAlert=(type,message)=>{
if(alertTimerRef.current)clearTimeout(alertTimerRef.current);
setAlert({type,message,show:true});
alertTimerRef.current=setTimeout(()=>{
setAlert(prev=>({...prev,show:false}));
},3000);
};

const closeAlert=()=>{
if(alertTimerRef.current)clearTimeout(alertTimerRef.current);
setAlert(prev=>({...prev,show:false}));
};

useEffect(()=>{
return()=>{
if(alertTimerRef.current)clearTimeout(alertTimerRef.current);
};
},[]);

const handleChange=e=>{
const {name,value,type,checked}=e.target;
setForm(prev=>({...prev,[name]:type==='checkbox'?checked:value}));
};

const handleSubmit=async e=>{
e.preventDefault();
setLoading(true);
try{
const payload={
...form,
code:form.code.toUpperCase().trim()
};
const res=await fetch(endpoint,{
method,
headers:{'Content-Type':'application/json'},
body:JSON.stringify(payload)
});
const data=await res.json();
if(!res.ok)throw new Error(data.message||'Failed to save currency');
showAutoCloseAlert('success',data.message||'Currency saved successfully');
if(onSuccess)onSuccess(data);
}catch(err){
showAutoCloseAlert('danger',err.message||'Something went wrong');
}finally{
setLoading(false);
}
};

return(
<form onSubmit={handleSubmit}>
{alert.show&&(
<Alert variant={alert.type} dismissible onClose={closeAlert}>{alert.message}</Alert>
)}

<div className="row g-3">
<div className="col-md-6">
<label className="form-label">Name</label>
<input type="text" className="form-control" name="name" value={form.name} onChange={handleChange} required />
</div>

<div className="col-md-3">
<label className="form-label">Code</label>
<input type="text" className="form-control" name="code" value={form.code} onChange={handleChange} required />
</div>

<div className="col-md-3">
<label className="form-label">Symbol</label>
<input type="text" className="form-control" name="symbol" value={form.symbol} onChange={handleChange} />
</div>

<div className="col-md-6">
<label className="form-label">Country</label>
<select className="form-select" name="country" value={form.country} onChange={handleChange}>
<option value="">Select Country</option>
{countries.map(country=>(
<option key={country._id} value={country._id}>{country.name}</option>
))}
</select>
</div>

<div className="col-md-6 d-flex align-items-end">
<div className="form-check">
<input type="checkbox" className="form-check-input" id="isActive" name="isActive" checked={form.isActive} onChange={handleChange} />
<label className="form-check-label" htmlFor="isActive">Active</label>
</div>
</div>

<div className="col-12">
<button type="submit" className="btn btn-primary" disabled={loading}>
{loading?'Saving...':'Save Currency'}
</button>
</div>
</div>
</form>
);
}