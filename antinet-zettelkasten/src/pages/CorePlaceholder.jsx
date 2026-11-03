import {Container,Alert} from "react-bootstrap";

export default function CorePlaceholder({title,description}){
 return <Container className="py-5"><h1>{title}</h1><Alert variant="info" className="mt-3">{description}</Alert></Container>;
}
