// The caller supplies its own configured mail service; no mail is sent on import.
export function createContactHandler(sendContactEmail){
 return async(req,res)=>{
  const payload=Object.fromEntries(["name","email","subject","message"].map(key=>[key,typeof req.body?.[key]==="string"?req.body[key].trim():""]));
  if(Object.values(payload).some(value=>!value)||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email))return res.status(400).json({message:"Enter your name, a valid email, subject, and message."});
  if(payload.name.length>200||payload.email.length>320||payload.subject.length>300||payload.message.length>20000||/[\r\n]/.test(payload.email+payload.subject))return res.status(400).json({message:"The contact details are too long or contain invalid characters."});
  try{
   const result=await sendContactEmail(payload);
   if(!result?.sent)return res.status(503).json({message:result?.reason||"Contact email is not configured."});
   return res.json({message:"Your message was sent successfully."});
  }catch{return res.status(502).json({message:"Unable to send your message. Please try again later."});}
 };
}
