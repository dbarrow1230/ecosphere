import {useEffect,useState} from "react";
import {Form} from "react-bootstrap";
import "./CurrentDateTime.css";

function CurrentDateTime(){

 const [now,setNow]=useState(new Date());
 const [is24Hour,setIs24Hour]=useState(false);
 const [loaded,setLoaded]=useState(false);

 useEffect(()=>{
  const saved=window.localStorage.getItem("is24Hour");
  if(saved!==null)setIs24Hour(JSON.parse(saved));
  setLoaded(true);
 },[]);

 useEffect(()=>{
  if(!loaded)return;
  window.localStorage.setItem("is24Hour",JSON.stringify(is24Hour));
 },[is24Hour,loaded]);

 useEffect(()=>{
  const timer=setInterval(()=>{
   setNow(new Date());
  },1000);

  return()=>clearInterval(timer);
 },[]);

 const day=now.toLocaleDateString(undefined,{weekday:"long"});
 const date=now.toLocaleDateString(undefined,{month:"long",day:"numeric"});
 const year=now.toLocaleDateString(undefined,{year:"numeric"});

 const time=now.toLocaleTimeString(undefined,{
  hour:"2-digit",
  minute:"2-digit",
  second:"2-digit",
  hour12:!is24Hour
 });

 return(
  <div className="current-time">

   <div className="date">
    <strong>Current Date:</strong> {day}, {date}, {year}
   </div>

   <div className="time-row">

    <div className="time">
     <strong>Time:</strong> {time}
    </div>

    {loaded&&(
     <Form.Check
      type="switch"
      id="time-format"
      className="time-switch"
      label={is24Hour?"Switch to 12hr":"Switch to 24hr"}
      checked={is24Hour}
      onChange={()=>setIs24Hour(v=>!v)}
     />
    )}

   </div>

  </div>
 );
}

export default CurrentDateTime;