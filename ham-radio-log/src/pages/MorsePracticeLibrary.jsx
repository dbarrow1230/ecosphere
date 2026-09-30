import {useEffect,useState} from "react";
import {Alert,Button,Container,Table} from "react-bootstrap";

const authHeaders=()=>({Authorization:`Bearer ${localStorage.getItem("token")||sessionStorage.getItem("token")||""}`});

export default function MorsePracticeLibrary({currentUser}){
 const [rows,setRows]=useState([]);
 const [error,setError]=useState("");

 useEffect(()=>{
  loadRows();
 },[currentUser]);

 const loadRows=async()=>{
  if(!currentUser?._id){
   setError("Missing current user.");
   return;
  }

  const res=await fetch("/api/morse/practice-texts",{headers:authHeaders()});
  const data=await res.json();

  if(!data.success){
   setError(data.message||"Practice texts could not be loaded.");
   return;
  }

  setRows(data.data);
  setError("");
 };

 return (
  <Container className="py-4">
   <h1>Morse Practice Library</h1>
   <p className="text-muted">Saved generated, pasted, and uploaded practice text.</p>

   {error&&<Alert variant="danger">{error}</Alert>}

   <Table striped bordered hover responsive>
    <thead>
     <tr>
      <th>Title</th>
      <th>Practice Type</th>
      <th>Source</th>
      <th>Level</th>
      <th>Starting WPM</th>
      <th>Words</th>
      <th>Characters</th>
      <th>Created</th>
      <th>Action</th>
     </tr>
    </thead>
    <tbody>
     {rows.map((row)=>(
      <tr key={row._id}>
       <td>{row.title}</td>
       <td>{row.practiceType}</td>
       <td>{row.sourceType}</td>
       <td>{row.level}</td>
       <td>{row.startingWpm}</td>
       <td>{row.wordCount}</td>
       <td>{row.characterCount}</td>
       <td>{new Date(row.createdAt).toLocaleDateString()}</td>
       <td>
        <Button size="sm" href={`/morse/practice?text=${row._id}`}>Practice</Button>
       </td>
      </tr>
     ))}
    </tbody>
   </Table>
  </Container>
 );
}
