import {useEffect,useState} from "react";
import {Toast,ToastContainer} from "react-bootstrap";
import {Bell} from "lucide-react";
import {io} from "socket.io-client";
import "../styles/ReminderNotifications.css";

function getObjectId(value){
 if(!value)return "";
 if(typeof value==="string")return value;
 return String(value._id?.$oid||value.id?.$oid||value._id||value.id||value.$oid||"");
}

export default function ReminderNotifications({user}){
 const userId=getObjectId(user);
 const [notifications,setNotifications]=useState([]);

 useEffect(()=>{
  if(!userId){
   queueMicrotask(()=>setNotifications([]));
   return undefined;
  }

  // The shell proxies this application's Socket.IO path to its own backend.
  // Using VITE_BACKEND_URL here connected reminders to the Eco Sphere backend
  // instead of the Antinet backend that runs the reminder scheduler.
  const socket=io({
   withCredentials:true,
   transports:["websocket","polling"]
  });

  const register=()=>socket.emit("registerUser",userId);
  const receive=(reminder,acknowledge)=>{
   setNotifications(current=>{
    const withoutDuplicate=current.filter(item=>item.id!==reminder.id);
    return [...withoutDuplicate,reminder];
   });
   if(typeof acknowledge==="function")acknowledge({received:true});
   window.setTimeout(()=>{
    window.dispatchEvent(new CustomEvent("reminder-delivered",{detail:{id:reminder.id}}));
   },500);
  };

  socket.on("connect",register);
  socket.on("reminder",receive);

  return()=>{
   socket.off("connect",register);
   socket.off("reminder",receive);
   socket.disconnect();
  };
 },[userId]);

 const dismiss=async reminder=>{
  setNotifications(current=>current.filter(item=>item.id!==reminder.id));
  if(!reminder.id)return;
  try{
   await fetch(`/api/reminders/${encodeURIComponent(reminder.id)}/dismiss?userId=${encodeURIComponent(userId)}`,{
    method:"PATCH",
    credentials:"include"
   });
  }catch(error){
   console.error("Unable to dismiss reminder",error);
  }
 };

 if(!notifications.length)return null;

 return (
  <ToastContainer className="reminder-notifications" aria-live="assertive">
   {notifications.map(reminder=>(
    <Toast key={reminder.id} show onClose={()=>dismiss(reminder)}>
     <Toast.Header>
      <Bell size={16}/>
      <strong className="me-auto ms-2">{reminder.title||"Reminder"}</strong>
     </Toast.Header>
     <Toast.Body>{reminder.message||"This reminder is due now."}</Toast.Body>
    </Toast>
   ))}
  </ToastContainer>
 );
}
