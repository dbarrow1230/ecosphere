import {Alert,Button,Card,Col,Container,Row,Table} from "react-bootstrap";
import {Link} from "react-router-dom";

const sampleOrders=[
 {orderNumber:"DRAFT-1001",client:"Sample Client",status:"Draft",total:"$0.00"},
 {orderNumber:"DRAFT-1002",client:"Walk-in",status:"Pending",total:"$0.00"}
];

function OrdersScaffold(){
 return(
  <section className="py-4">
   <Container fluid="lg">
    <Row className="g-4 mb-4 align-items-center">
     <Col>
      <p className="text-muted mb-2">Order Management</p>
      <h1 className="mb-2">Orders</h1>
      <p className="text-muted mb-0">This workflow is scaffolded because order models and routes are not present yet.</p>
     </Col>

     <Col xs="auto">
      <Button as={Link} to="/clients" variant="outline-primary">View Clients</Button>
     </Col>
    </Row>

    <Alert variant="warning">
     Orders are visible in navigation, but this repo does not currently include Mongo models, controllers, or Express routes for orders or events.
    </Alert>

    <Card>
     <Card.Body className="p-0">
      <Table responsive hover className="mb-0 align-middle">
       <thead>
        <tr>
         <th>Order #</th>
         <th>Client</th>
         <th>Status</th>
         <th>Total</th>
        </tr>
       </thead>

       <tbody>
        {sampleOrders.map(order=>(
         <tr key={order.orderNumber}>
          <td>{order.orderNumber}</td>
          <td>{order.client}</td>
          <td>{order.status}</td>
          <td>{order.total}</td>
         </tr>
        ))}
       </tbody>
      </Table>
     </Card.Body>
    </Card>
   </Container>
  </section>
 );
}

export default OrdersScaffold;
