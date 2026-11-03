import {useState} from "react";
import {Alert,Button,Container} from "react-bootstrap";
import {photographyApi} from "../../utils/photographyApi.js";

export default function ExportPage(){
 const [busy,setBusy]=useState(false),[error,setError]=useState(""),[done,setDone]=useState(false);
 const download=async()=>{
  setBusy(true);setError("");setDone(false);
  try{
   const data=await photographyApi("/api/photography/export");
   const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:"application/json"}));
   const anchor=document.createElement("a");anchor.href=url;anchor.download=`photo-lattice-${new Date().toISOString().slice(0,10)}.json`;
   document.body.append(anchor);anchor.click();anchor.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);setDone(true);
  }catch(error){setError(error.message);}finally{setBusy(false);}
 };
 return <Container className="py-4"><h1>Export photography records</h1><p>Download your photos’ metadata, albums, shoots, equipment, tags, and reminders as JSON. Image files are not included; copy your original images separately.</p><p>This export does not run or schedule a MongoDB backup. Import and restore are not available on this page.</p>{error&&<Alert variant="danger">{error}</Alert>}{done&&<Alert variant="success">Your records download has started.</Alert>}<Button disabled={busy} onClick={download}>{busy?"Exporting…":"Download my records"}</Button></Container>;
}
