import {Container,Row,Col,Card} from "react-bootstrap";
import "../styles/Menu.css";

const menuItems=[
 {
  category:"Signature Doughnuts",
  items:[
   {name:"Alchemy Glaze",price:"$4.50",text:"Vanilla bean glaze with gold sugar shimmer."},
   {name:"Velvet Spell",price:"$4.95",text:"Red velvet doughnut with cream cheese icing."},
   {name:"Midnight Mocha",price:"$5.25",text:"Dark chocolate glaze with espresso drizzle."},
   {name:"Berry Enchantment",price:"$4.95",text:"Mixed berry glaze finished with freeze-dried berries."}
  ]
 },
 {
  category:"Filled Doughnuts",
  items:[
   {name:"Caramel Cauldron",price:"$5.50",text:"Soft doughnut filled with salted caramel cream."},
   {name:"Lemon Elixir",price:"$5.25",text:"Bright lemon curd filling with a light sugar finish."},
   {name:"Strawberry Charm",price:"$5.25",text:"Fresh strawberry cream filling with pink glaze."},
   {name:"Cookies & Cream Potion",price:"$5.75",text:"Cookies and cream filling with chocolate topping."}
  ]
 },
 {
  category:"Mini Doughnuts",
  items:[
   {name:"Mini Glazed Dozen",price:"$10.00",text:"Twelve bite-sized glazed doughnuts."},
   {name:"Mini Mixed Dozen",price:"$12.50",text:"Assorted minis with chocolate, berry, and vanilla flavors."},
   {name:"Mini Cinnamon Sugar",price:"$9.50",text:"Warm minis tossed in cinnamon sugar."}
  ]
 },
 {
  category:"Beverages",
  items:[
   {name:"House Coffee",price:"$3.00",text:"Fresh brewed coffee."},
   {name:"Iced Coffee",price:"$3.75",text:"Chilled coffee served over ice."},
   {name:"Hot Chocolate",price:"$3.50",text:"Rich cocoa topped with whipped cream."},
   {name:"Milk",price:"$2.50",text:"Cold milk served plain or chocolate."}
  ]
 }
];

function Menu(){

 return(
  <section className="menu-page">
   <Container className="py-5">

    <Row className="mb-4">
     <Col lg={12}>
      <div className="menu-page-header">
       <h1 className="menu-page-title">Menu</h1>
       <p className="menu-page-text">Explore handcrafted doughnuts, filled favorites, minis, and drinks made to satisfy every craving.</p>
      </div>
     </Col>
    </Row>

    <Row className="g-4">
     {menuItems.map((section)=>(
      <Col xs={12} key={section.category}>
       <Card className="menu-section">
        <Card.Body>
         <h2 className="menu-section-title">{section.category}</h2>

         <Row className="g-4">
          {section.items.map((item)=>(
           <Col md={6} key={item.name}>
            <div className="menu-item">
             <div className="menu-item-head">
              <h3 className="menu-item-name">{item.name}</h3>
              <p className="menu-item-price">{item.price}</p>
             </div>

             <p className="menu-item-text">{item.text}</p>
            </div>
           </Col>
          ))}
         </Row>
        </Card.Body>
       </Card>
      </Col>
     ))}
    </Row>

   </Container>
  </section>
 );

}

export default Menu;