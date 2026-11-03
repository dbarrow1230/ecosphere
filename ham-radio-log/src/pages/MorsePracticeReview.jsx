import {useEffect,useState} from "react";
import {Alert,Container,Table} from "react-bootstrap";

const authHeaders=()=>({Authorization:`Bearer ${localStorage.getItem("token")||sessionStorage.getItem("token")||""}`});

export default function MorsePracticeReview({currentUser}){
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

  const res=await fetch("/api/morse/practice-sessions",{headers:authHeaders()});
  const data=await res.json();

  if(!data.success){
   setError(data.message||"Practice sessions could not be loaded.");
   return;
  }

  setRows(data.data);
  setError("");
 };

 return (
  <Container className="py-4">
   <h1>Morse Practice Review</h1>
   <p className="text-muted">Review saved practice attempts, WPM, and accuracy.</p>

   {error&&<Alert variant="danger">{error}</Alert>}

   <Table striped bordered hover responsive>
    <thead>
     <tr>
      <th>Date</th>
      <th>Title</th>
      <th>Type</th>
      <th>Level</th>
      <th>WPM</th>
      <th>Accuracy</th>
      <th>Correct</th>
      <th>Incorrect</th>
      <th>Missed</th>
     </tr>
    </thead>
    <tbody>
     {rows.map((row)=>(
      <tr key={row._id}>
       <td>{new Date(row.createdAt).toLocaleDateString()}</td>
       <td>{row.title}</td>
       <td>{row.practiceType}</td>
       <td>{row.level}</td>
       <td>{row.wpm}</td>
       <td>{row.accuracy}%</td>
       <td>{row.correctCharacters}</td>
       <td>{row.incorrectCharacters}</td>
       <td>{row.missedCharacters}</td>
      </tr>
     ))}
    </tbody>
   </Table>
  </Container>
 );
}
