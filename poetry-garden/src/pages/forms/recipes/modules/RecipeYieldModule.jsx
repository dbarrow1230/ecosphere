import {Card,Col,Form,Row} from "react-bootstrap";

export default function RecipeYieldModule({data,lookups,measurementChange,measurementQuantityChange,servingsChange,descriptionChange,SelectOptions}){
 const sections=[["yield","Recipe Yield"],["servingSize","Serving Size"]];

 return <Card><Card.Body>
  <section className="recipe-measurement-section">
   <h3 className="h5">Servings</h3>
   <Row><Col md={4}><Form.Group className="recipe-inline-field"><Form.Label>Number of Servings</Form.Label><Form.Control type="text" inputMode="decimal" value={data.servings??""} onChange={event=>servingsChange(event.target.value)}/></Form.Group></Col></Row>
  </section>
  {sections.map(([section,title])=><section key={section} className="recipe-measurement-section">
   <h3 className="h5">{title}</h3>
   {section==="servingSize"?<Form.Group className="recipe-inline-field mb-3"><Form.Label>Serving Description</Form.Label><Form.Control value={data.servingSizeDescription||""} onChange={event=>descriptionChange(event.target.value)} placeholder="e.g. 2 patties with gravy"/></Form.Group>:null}
   <Row className="g-3">
    <Col md={6}><Form.Group className="recipe-inline-field"><Form.Label>Imperial Quantity</Form.Label><Form.Control type="text" inputMode="decimal" value={data[section].imperialQuantity??""} onChange={event=>measurementQuantityChange(section,"imperialQuantity",event.target.value)} onBlur={event=>measurementChange(section,"imperialQuantity",event.target.value)}/></Form.Group></Col>
    <Col md={6}><Form.Group className="recipe-inline-field"><Form.Label>Imperial Unit</Form.Label><Form.Select value={data[section].imperialUnit} onChange={event=>measurementChange(section,"imperialUnit",event.target.value)}><SelectOptions items={lookups.imperialUnits} placeholder="Select unit"/></Form.Select></Form.Group></Col>
    <Col md={6}><Form.Group className="recipe-inline-field"><Form.Label>Metric Quantity</Form.Label><Form.Control type="text" inputMode="decimal" value={data[section].metricQuantity??""} onChange={event=>measurementQuantityChange(section,"metricQuantity",event.target.value)} onBlur={event=>measurementChange(section,"metricQuantity",event.target.value)}/></Form.Group></Col>
    <Col md={6}><Form.Group className="recipe-inline-field"><Form.Label>Metric Unit</Form.Label><Form.Select value={data[section].metricUnit} onChange={event=>measurementChange(section,"metricUnit",event.target.value)}><SelectOptions items={lookups.metricUnits} placeholder="Select unit"/></Form.Select></Form.Group></Col>
   </Row>
  </section>)}
 </Card.Body></Card>;
}
