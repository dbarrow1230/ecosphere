import {useNavigate} from "react-router-dom";
import {Card,Container} from "react-bootstrap";
import NoteForm from "./forms/NoteForm.jsx";

function NewNote({user}){
 const navigate=useNavigate();

 const getObjectId=value=>{
  if(!value)return "";
  if(typeof value==="string")return value;
  if(typeof value.$oid==="string")return value.$oid;
  if(typeof value._id==="string")return value._id;
  if(typeof value.id==="string")return value.id;
  if(typeof value._id?.$oid==="string")return value._id.$oid;
  if(typeof value.id?.$oid==="string")return value.id.$oid;
  return "";
 };

 return(
  <Container className="py-4">
   <Card className="border-0 shadow-sm">
    <Card.Body>
     <h1 className="h3 mb-3">Add Note</h1>
     <NoteForm
      userId={getObjectId(user)}
      autoFocusTitle
      onSuccess={()=>navigate("/notes")}
     />
    </Card.Body>
   </Card>
  </Container>
 );
}

export default NewNote;
