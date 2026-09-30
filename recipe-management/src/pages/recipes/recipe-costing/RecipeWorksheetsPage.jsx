import {Card,Col,Container,Row} from "react-bootstrap";
import {Link} from "react-router-dom";
import "../../../styles/CostingWorksheets.css";

export const worksheetTypes=[
 {slug:"bakery-recipe-costing",title:"Bakery Recipe Costing Spreadsheet",description:"Batch cost, total weight, and cost per unit."},
 {slug:"cash-flow",title:"Cash Flow Sheet",description:"Monthly money-in, money-out, totals, averages, and balances."},
 {slug:"chef-recipe-cost-calculator",title:"Chef Recipe Cost Calculator",description:"Recipe portions, scaled quantities, and food-item costs."},
 {slug:"food-cost-analysis",title:"Food Cost Worksheet",description:"Ingredient portions, unit pricing, markup, and menu pricing."},
 {slug:"food-cost-spreadsheet",title:"Recipe Food Cost",description:"Recipe yield, portion size, purchase cost, and actual ingredient cost."},
 {slug:"food-production",title:"Food Production Record",description:"Projected production, planned quantities, actual usage, and leftovers."},
 {slug:"meal-prep-cost-estimation",title:"Food Cost Calculator",description:"Primary and secondary ingredients, margin, and net profit."},
 {slug:"recipe-analysis",title:"Recipe Analysis",description:"Yield, servings, purchase units, conversion, and remaining quantity."},
 {slug:"recipe-costing",title:"Recipe Costing Sheet",description:"Recipe units, quantities, extensions, gross profit, and food-cost percentage."},
 {slug:"restaurant-recipe-costing",title:"Restaurant Recipe Cost Worksheet",description:"Purchase units, Q factor, total recipe cost, and portion cost."},
 {slug:"standardized-recipe-cost",title:"Standardized Recipe Cost Sheet",description:"Ingredient amount, unit cost, total cost, and portion cost."}
];

export default function RecipeWorksheetsPage(){
 return <Container fluid className="costing-index-page py-4 px-3 px-lg-4">
  <div className="costing-index-heading"><div><h1>Recipe Costing Worksheets</h1><p>Select the professional worksheet required for the recipe or production task.</p></div></div>
  <Row xs={1} md={2} xl={3} className="g-3">
   {worksheetTypes.map(item=><Col key={item.slug}><Card className="costing-type-card h-100"><Card.Body><span className="costing-sheet-mark">Costing Sheet</span><Card.Title>{item.title}</Card.Title><Card.Text>{item.description}</Card.Text><Link className="btn btn-primary" to={`/recipes/costing-worksheets/${item.slug}`}>Open Worksheet</Link></Card.Body></Card></Col>)}
  </Row>
 </Container>;
}
