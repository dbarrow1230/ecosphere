import {Alert} from "react-bootstrap";

export default function Menus(){
 return(
  <main className="container py-4">
   <h1 className="h3 mb-2">Menus</h1>
   <Alert variant="info" className="mb-0">
    Menu management is not yet connected to a backend model in this application. This safe placeholder keeps the navigation workflow testable without writing dummy records to MongoDB.
   </Alert>
  </main>
 );
}
