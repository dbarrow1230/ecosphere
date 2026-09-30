import {Card} from "react-bootstrap";

export default function WorkflowPlaceholderPage({title,description}){
 return(
  <div className="container py-4">
   <Card className="shadow-sm">
    <Card.Body>
     <h3>{title}</h3>
     <p className="mb-0 text-muted">
      {description||"This workflow is wired for testing, but its full page has not been implemented yet."}
     </p>
    </Card.Body>
   </Card>
  </div>
 );
}
