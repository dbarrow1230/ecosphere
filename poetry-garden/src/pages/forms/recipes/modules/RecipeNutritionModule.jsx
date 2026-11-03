import {Card,Form} from "react-bootstrap";

export default function RecipeNutritionModule({nutrition,fields,nestedChange}){
 return(
  <Card>
   <Card.Body>
    <div className="recipe-nutrition-grid">
     {fields.map(([key,title])=>{
      const fieldId=`recipe-nutrition-${key}`;

      return(
       <div className="recipe-nutrition-row" key={key}>
        <Form.Label htmlFor={fieldId}>{title}:</Form.Label>
        <div className="recipe-nutrition-control">
         <Form.Control
          id={fieldId}
          value={nutrition[key]}
          onChange={event=>nestedChange("nutrition",key,event.target.value)}
         />
        </div>
       </div>
      );
     })}
    </div>
   </Card.Body>
  </Card>
 );
}
