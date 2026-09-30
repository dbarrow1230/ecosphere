import {Container,Row,Col,Card} from "react-bootstrap";

function Menus(){

 const menus=[
  {
   name:"Wedding Buffet",
   description:"Elegant buffet service designed for weddings and large celebrations.",
   items:[
    "Herb roasted chicken",
    "Garlic mashed potatoes",
    "Seasonal roasted vegetables",
    "Garden salad",
    "Dinner rolls",
    "Chef dessert selection"
   ]
  },
  {
   name:"Corporate Lunch",
   description:"Perfect for meetings, office gatherings, and corporate events.",
   items:[
    "Grilled chicken breast",
    "Rice pilaf",
    "Seasonal vegetables",
    "Fresh garden salad",
    "Artisan bread",
    "Assorted cookies"
   ]
  },
  {
   name:"Private Dinner Service",
   description:"A plated multi-course dining experience for intimate events.",
   items:[
    "Chef appetizer selection",
    "Seasonal soup or salad",
    "Choice of entrée",
    "Chef sides",
    "Dessert course"
   ]
  }
 ];

 return(
  <Container className="py-5">

   <Row className="text-center mb-5">
    <Col>
     <h1>Our Catering Menus</h1>
     <p className="text-muted">
      Carefully crafted menus designed for weddings, corporate events, and private gatherings.
     </p>
    </Col>
   </Row>

   <Row className="g-4">

    {menus.map((menu,i)=>(
     <Col lg={4} md={6} key={i}>

      <Card className="h-100 shadow-sm">
       <Card.Body>

        <Card.Title>{menu.name}</Card.Title>

        <Card.Text className="text-muted">
         {menu.description}
        </Card.Text>

        <ul>
         {menu.items.map((item,index)=>(
          <li key={index}>{item}</li>
         ))}
        </ul>

       </Card.Body>
      </Card>

     </Col>
    ))}

   </Row>

  </Container>
 );

}

export default Menus;