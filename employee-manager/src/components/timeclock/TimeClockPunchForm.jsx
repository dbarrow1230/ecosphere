import {useEffect,useMemo,useRef,useState} from "react";
import "../../styles/time-clock.css";

const digitSegments={
 "0":["a","b","c","d","e","f"],
 "1":["b","c"],
 "2":["a","b","d","e","g"],
 "3":["a","b","c","d","g"],
 "4":["b","c","f","g"],
 "5":["a","c","d","f","g"],
 "6":["a","c","d","e","f","g"],
 "7":["a","b","c"],
 "8":["a","b","c","d","e","f","g"],
 "9":["a","b","c","d","f","g"]
};

const actionLabels={clockIn:"Clock In",breakOut:"Start Break",breakIn:"End Break",clockOut:"Clock Out",complete:"Shift Complete"};

function SevenSegmentDigit({value,small=false}){
 const active=digitSegments[value]||[];
 return <span className={`seven-digit${small?" seven-digit-small":""}`} aria-hidden="true">{["a","b","c","d","e","f","g"].map(segment=><i key={segment} className={`segment segment-${segment}${active.includes(segment)?" is-on":""}`}/>)}</span>;
}

function DigitalNumber({value,small=false}){
 return <span className="digital-number" aria-label={value}>{String(value).split("").map((character,index)=><SevenSegmentDigit key={`${character}-${index}`} value={character} small={small}/>)}</span>;
}

function TimeClockPunchForm({onLookup,onPunch}){
 const [now,setNow]=useState(()=>new Date());
 const [employeeNumber,setEmployeeNumber]=useState("");
 const [status,setStatus]=useState(null);
 const [message,setMessage]=useState("");
 const [messageType,setMessageType]=useState("");
 const [working,setWorking]=useState(false);
 const inputRef=useRef(null);

 useEffect(()=>{
  const timer=window.setInterval(()=>setNow(new Date()),1000);
  return()=>window.clearInterval(timer);
 },[]);

 const display=useMemo(()=>{
  const hours24=now.getHours();
  const hours12=hours24%12||12;
  return{
   hours:String(hours12).padStart(2,"0"),
   minutes:String(now.getMinutes()).padStart(2,"0"),
   seconds:String(now.getSeconds()).padStart(2,"0"),
   period:hours24>=12?"PM":"AM"
  };
 },[now]);

 const submit=async event=>{
  event.preventDefault();
  const id=employeeNumber.trim();
  if(!id){setMessageType("error");setMessage("ENTER YOUR EMPLOYEE ID");inputRef.current?.focus();return;}
  try{
   setWorking(true);setMessage("");setMessageType("");
   const current=await onLookup(id);
   if(current.nextAction==="complete"){
    setStatus(current);
    setMessageType("info");
    setMessage(`${current.employee.firstName.toUpperCase()}, YOUR SHIFT IS ALREADY COMPLETE`);
    return;
   }
   const action=current.nextAction;
   const entry=await onPunch(id,action);
   setStatus({...current,entry,nextAction:entry.nextAction});
   setMessageType("success");
   setMessage(`${actionLabels[action].toUpperCase()} RECORDED FOR ${current.employee.firstName.toUpperCase()} ${current.employee.lastName.toUpperCase()}`);
   setEmployeeNumber("");
  }catch(error){
   setStatus(null);setMessageType("error");setMessage(String(error.message||"TIME CLOCK ENTRY FAILED").toUpperCase());
  }finally{
   setWorking(false);
   window.setTimeout(()=>inputRef.current?.focus(),0);
  }
 };

 return(
  <section className="time-clock-board" aria-label="Employee time clock">
   <div className="time-clock-board-shine"/>
   <button className="time-clock-start-button" type="submit" form="time-clock-punch-form" disabled={working}><span aria-hidden="true">▶</span>{working?"Recording…":"Start / Stop Clock"}</button>
   <div className="time-clock-display" aria-label={`${display.hours}:${display.minutes}:${display.seconds} ${display.period}`}>
    <DigitalNumber value={display.hours}/><span className="digital-colon"><i/><i/></span><DigitalNumber value={display.minutes}/>
    <div className="time-clock-seconds"><DigitalNumber value={display.seconds} small/><strong>{display.period}</strong></div>
   </div>
   <form id="time-clock-punch-form" className="time-clock-id-form" onSubmit={submit}>
    <label htmlFor="employee-time-clock-id">ENTER EMPLOYEE ID:</label>
    <input ref={inputRef} id="employee-time-clock-id" value={employeeNumber} onChange={event=>setEmployeeNumber(event.target.value)} autoComplete="off" inputMode="numeric" disabled={working} autoFocus/>
   </form>
   <div className={`time-clock-message${messageType?` time-clock-message-${messageType}`:""}`} role="status">{message||"ENTER YOUR ID AND PRESS ENTER OR START / STOP CLOCK"}</div>
   {status?.entry?<div className="time-clock-last-entry"><span>IN {status.entry.clockIn||"—"}</span><span>BREAK OUT {status.entry.breakOut||"—"}</span><span>BREAK IN {status.entry.breakIn||"—"}</span><span>OUT {status.entry.clockOut||"—"}</span></div>:null}
  </section>
 );
}

export default TimeClockPunchForm;
