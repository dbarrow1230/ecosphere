import {Link} from "react-router-dom";
import {idOf} from "../../utils/publishingApi.js";
export function CatalogNotice({catalog}){
 return catalog.error?<div className="alert alert-warning" role="alert">{catalog.error} <button type="button" className="btn btn-sm btn-outline-secondary" onClick={catalog.reload}>Retry catalog connection</button></div>:null;
}
export function MultiSelect({label,values=[],options,onChange}){
 return <fieldset className="publishing-options"><legend>{label}</legend>{options.length?options.map(option=><label key={option._id}><input type="checkbox" checked={values.map(idOf).includes(idOf(option))} onChange={e=>onChange(e.target.checked?[...values,idOf(option)]:values.filter(value=>idOf(value)!==idOf(option)))}/> {option.name}</label>):<span>No {label.toLowerCase()} saved yet.</span>}</fieldset>;
}
export function PublisherFields({form,setForm,catalog}){
 const set=(key,value)=>setForm(previous=>({...previous,[key]:value}));
 const matches=publisher=>(!form.genres?.length||form.genres.some(genre=>(publisher.genres||[]).map(idOf).includes(idOf(genre))))&&(!form.categories?.length||form.categories.some(category=>(publisher.categories||[]).map(idOf).includes(idOf(category))));
 const publishers=catalog.publishers.filter(publisher=>(publisher.isActive!==false&&matches(publisher))||idOf(publisher)===idOf(form.publisher));
 return <><CatalogNotice catalog={catalog}/><MultiSelect label="Genres" options={catalog.genres} values={form.genres} onChange={value=>set("genres",value)}/><MultiSelect label="Categories" options={catalog.categories} values={form.categories} onChange={value=>set("categories",value)}/><label>Publisher<select className="form-select" value={idOf(form.publisher)} onChange={e=>set("publisher",e.target.value)}><option value="">Select publisher</option>{publishers.map(publisher=><option key={publisher._id} value={publisher._id}>{publisher.name}{publisher.isActive===false?" (inactive)":""}</option>)}</select><small>Filtered by selected genres and categories. Your current selection stays available.</small></label><Link to="/publishers?new=1">Add or categorize publishers</Link><button type="button" className="btn btn-sm btn-outline-secondary" onClick={catalog.reload} disabled={catalog.loading}>Refresh publisher choices</button></>;
}
