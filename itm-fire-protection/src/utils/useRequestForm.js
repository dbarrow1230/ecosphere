import {useRef,useState} from "react";

export default function useRequestForm(kind){
 const [feedback,setFeedback]=useState({pending:false,error:"",message:""});
 const submitting=useRef(false);
 const onSubmit=async event=>{
  event.preventDefault();
  const form=event.currentTarget;
  if(submitting.current||!form.reportValidity())return;
  submitting.current=true;
  setFeedback({pending:true,error:"",message:""});
  try{
   const response=await fetch("/api/requests",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...Object.fromEntries(new FormData(form)),kind})});
   const data=await response.json().catch(()=>({}));
   if(!response.ok)throw new Error(data.message||"Unable to save your request.");
   if(!data.id)throw new Error("The server did not confirm that your request was saved.");
   form.reset();
   setFeedback({pending:false,error:"",message:`Request saved. Reference: ${data.id}`});
  }catch(error){setFeedback({pending:false,error:error.message,message:""});}
  finally{submitting.current=false;}
 };
 return {...feedback,onSubmit};
}
