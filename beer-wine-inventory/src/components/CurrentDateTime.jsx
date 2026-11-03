import {useEffect,useState} from "react";
import {Form} from "react-bootstrap";
import {formatDate} from "../utils/dateFormat.js";
import "@shared/components/CurrentDateTime.css";

export default function CurrentDateTime(){
 const [now,setNow]=useState(()=>new Date());
 const [is24Hour,setIs24Hour]=useState(()=>{try{return JSON.parse(localStorage.getItem("is24Hour")||"false")===true;}catch{return false;}});
 useEffect(()=>{const timer=setInterval(()=>setNow(new Date()),1000);return()=>clearInterval(timer);},[]);
 useEffect(()=>{try{localStorage.setItem("is24Hour",JSON.stringify(is24Hour));}catch{/* Preference storage is optional. */}},[is24Hour]);
 return <div className="current-time"><div className="date"><strong>Current Date:</strong> {formatDate(now)}</div><div className="time-row"><div className="time"><strong>Time:</strong> {now.toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:!is24Hour})}</div><Form.Check type="switch" id="time-format" className="time-switch" label={is24Hour?"Switch to 12hr":"Switch to 24hr"} checked={is24Hour} onChange={()=>setIs24Hour(value=>!value)}/></div></div>;
}
