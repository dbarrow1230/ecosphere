// src/pages/MorsePracticePage.jsx
import {Container} from "react-bootstrap";
import MorsePracticeForm from "./forms/morse/MorsePracticeForm.jsx";
import "../styles/MorsePractice.css";

export default function MorsePracticePage({currentUser}){
 return(
  <Container className="py-4 morse-practice-page">
   <h1>Morse Practice</h1>
   <p className="text-muted">Generate, paste, upload, save, and review Morse code practice text.</p>
   <MorsePracticeForm currentUser={currentUser}/>
  </Container>
 );
}
