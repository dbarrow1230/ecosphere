import {Link,useParams} from "react-router-dom";
import {Container,Row,Col,Card} from "react-bootstrap";
import compass from "../../assests/compass rose.jpg";
import morse from "../../assests/morse code.jpg";
import phonetic from "../../assests/phonetic alaphbet.jpg";
import utm from "../../assests/utm.jpg";
import wind from "../../assests/wind barbs.jpg";
import hiking from "../../assests/Hiker log.webp";
import travel from "../../assests/travel notes.webp";

export const references=[
 {slug:"compass-rose",title:"Compass rose",image:compass},
 {slug:"morse-code",title:"Morse code",image:morse},
 {slug:"phonetic-alphabet",title:"Phonetic alphabet",image:phonetic},
 {slug:"utm",title:"UTM",image:utm},
 {slug:"wind-barbs",title:"Wind barbs",image:wind},
 {slug:"hiking-log-template",title:"Hiking log template",image:hiking,form:"/hiking-logs/add"},
 {slug:"travel-notes-template",title:"Travel notes template",image:travel,form:"/trips/add"}
];
export default function ReferencePages(){
 const {slug}=useParams();
 const reference=references.find(item=>item.slug===slug);
 return <Container className="py-4">
  <h1>{reference?.title || "Travel references"}</h1>
  {slug && !reference ? <p>Reference not found. <Link to="/reference">Browse references</Link></p> : reference ? <>
   <p><Link to="/reference">All references</Link>{reference.form && <> · <Link to={reference.form}>Create a log from this template</Link></>}</p>
   <a href={reference.image} target="_blank" rel="noreferrer">Open full-size image</a>
   <img src={reference.image} alt={reference.title+" reference chart"} className="img-fluid d-block mt-3"/>
  </> : <Row>{references.map(item=><Col md={6} lg={4} key={item.slug} className="mb-3"><Card className="h-100"><Card.Body>
   <Card.Title><Link to={`/reference/${item.slug}`}>{item.title}</Link></Card.Title>
   <p>{item.form ? "Log template with an editable form." : "Reference chart from your assets folder."}</p>
   {item.form && <Link to={item.form}>Create log</Link>}
  </Card.Body></Card></Col>)}</Row>}
 </Container>;
}
