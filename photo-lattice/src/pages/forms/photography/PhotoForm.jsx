import {useState} from "react";
import {Alert,Form} from "react-bootstrap";
import RecordForm from "../../../components/photography/RecordForm.jsx";
import {photoFields} from "../../../config/photographyFields.js";
import {photographyApi} from "../../../utils/photographyApi.js";

export default function PhotoForm(props){
 const [uploading,setUploading]=useState(false),[error,setError]=useState("");
 const upload=async(event,onChange)=>{
  const file=event.target.files?.[0];
  if(!file)return;
  setError("");
  if(!["image/jpeg","image/png","image/webp","image/gif","image/avif"].includes(file.type)||file.size>25*1024*1024){setError("Choose a JPEG, PNG, WebP, GIF, or AVIF image up to 25 MB.");return;}
  setUploading(true);
  try{
   const body=new FormData();body.append("file",file);
   const result=await photographyApi("/api/upload/images",{method:"POST",body});
   if(!result.url)throw new Error("Upload did not return an image path.");
   onChange("fileUrl",result.url);
  }catch(error){setError(error.message);}finally{setUploading(false);}
 };
 return <>
  {error&&<Alert variant="danger">{error}</Alert>}
  {uploading&&<Alert variant="info">Uploading image…</Alert>}
  <RecordForm {...props} fields={photoFields} disabled={uploading} renderBeforeFields={({onChange})=><Form.Group className="mb-3" controlId="photo-upload"><Form.Label>Upload image</Form.Label><Form.Control type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" onChange={event=>upload(event,onChange)}/><Form.Text>Upload a file or enter an image URL below. Save to add it to your library.</Form.Text></Form.Group>}/>
 </>;
}
