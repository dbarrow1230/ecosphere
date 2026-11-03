import {useEffect,useState} from "react";
import {Button,Form,InputGroup,Modal} from "react-bootstrap";
import {convertBetweenUnits} from "../../utils/measurementConversion.js";

const quickFactors=[0.25,0.5,1.5,2,3,4];
const numeric=value=>Number.isFinite(Number(value))?Number(value):0;
const rounded=value=>Math.round((Number(value)+Number.EPSILON)*100)/100;
const display=value=>value===null||!Number.isFinite(value)?"":String(rounded(value));
const unitName=value=>typeof value==="object"?value?.name||value?.symbol||"":String(value||"");
const measure=(quantity,unit)=>numeric(quantity)>0?`${display(numeric(quantity))} ${unitName(unit)}`.trim():"—";
const unitLabel=(unitId,units)=>{const unit=units.find(item=>String(item._id)===String(unitId));return unit?.symbol||unit?.name||"";};

export default function ScaleRecipeModal({show,recipe,imperialUnits=[],metricUnits=[],onHide,onSave,saving}){
 const [factor,setFactor]=useState(0);
 const [method,setMethod]=useState("multiplier");
 const [editing,setEditing]=useState({field:"",value:""});
 const [imperialUnit,setImperialUnit]=useState("");
 const [metricUnit,setMetricUnit]=useState("");
 const [servingImperial,setServingImperial]=useState("");
 const [servingMetric,setServingMetric]=useState("");
 const [servingImperialUnit,setServingImperialUnit]=useState("");
 const [servingMetricUnit,setServingMetricUnit]=useState("");
 const id=value=>String(typeof value==="object"?value?._id||"":value||"");
 useEffect(()=>{if(show&&recipe){setFactor(0);setMethod("");setEditing({field:"",value:""});setImperialUnit(id(recipe.yield?.imperialUnit));setMetricUnit(id(recipe.yield?.metricUnit));setServingImperial(display(numeric(recipe.servingSize?.imperialQuantity)));setServingMetric(display(numeric(recipe.servingSize?.metricQuantity)));setServingImperialUnit(id(recipe.servingSize?.imperialUnit));setServingMetricUnit(id(recipe.servingSize?.metricUnit));}},[show,recipe]);

 const originalImperial=rounded(numeric(recipe?.yield?.imperialQuantity));
 const originalMetric=rounded(numeric(recipe?.yield?.metricQuantity));
 const metricYieldInServingUnit=convertBetweenUnits(originalMetric,id(recipe?.yield?.metricUnit),id(recipe?.servingSize?.metricUnit),metricUnits);
 const imperialYieldInServingUnit=convertBetweenUnits(originalImperial,id(recipe?.yield?.imperialUnit),id(recipe?.servingSize?.imperialUnit),imperialUnits);
 const derivedServings=metricYieldInServingUnit&&numeric(recipe?.servingSize?.metricQuantity)>0?metricYieldInServingUnit/numeric(recipe.servingSize.metricQuantity):imperialYieldInServingUnit&&numeric(recipe?.servingSize?.imperialQuantity)>0?imperialYieldInServingUnit/numeric(recipe.servingSize.imperialQuantity):0;
 const originalServings=numeric(recipe?.servings)||derivedServings;
 const imperialBase=convertBetweenUnits(originalImperial,id(recipe?.yield?.imperialUnit),imperialUnit,imperialUnits)??originalImperial;
 const metricBase=convertBetweenUnits(originalMetric,id(recipe?.yield?.metricUnit),metricUnit,metricUnits)??originalMetric;
 const scaledImperial=imperialBase*factor;
 const scaledMetric=metricBase*factor;
 const allUnits=[...imperialUnits,...metricUnits];
 const imperialInServingUnit=convertBetweenUnits(scaledImperial,imperialUnit,servingImperialUnit,allUnits);
 const metricInServingUnit=convertBetweenUnits(scaledMetric,metricUnit,servingMetricUnit,allUnits);
 const imperialServings=imperialInServingUnit&&numeric(servingImperial)>0?imperialInServingUnit/numeric(servingImperial):0;
 const metricServings=metricInServingUnit&&numeric(servingMetric)>0?metricInServingUnit/numeric(servingMetric):0;
 const changeFactor=(nextFactor,nextMethod)=>{if(Number.isFinite(nextFactor)&&nextFactor>0){setFactor(nextFactor);setMethod(nextMethod);}};
 const editFactor=(field,value,source,nextMethod)=>{setEditing({field,value});const requested=numeric(value);if(requested>0&&source>0)changeFactor(requested/source,nextMethod);};
 const finishEditing=()=>setEditing({field:"",value:""});

 const imperialYieldLabel=factor>0&&scaledImperial>0?`${display(scaledImperial)} ${unitLabel(imperialUnit,imperialUnits)}`.trim():"";
 const metricYieldLabel=factor>0&&scaledMetric>0?`${display(scaledMetric)} ${unitLabel(metricUnit,metricUnits)}`.trim():"";
 const scaledYieldLabel=imperialYieldLabel||metricYieldLabel;
 const sourceName=String(recipe?.name||"Recipe").replace(/\s+-\s+Scaled$/i,"");
 const measurementPattern=/\d+(?:\.\d+)?\s*(?:fl\s*oz|oz|ounces?|lb|lbs|pounds?|cups?|pints?|pt|quarts?|qt|gallons?|gal|mg|g|kg|ml|liters?|litres?|l)\b/i;
 const scaledName=factor>0?`${measurementPattern.test(sourceName)?sourceName.replace(measurementPattern,scaledYieldLabel):`${sourceName} (${scaledYieldLabel})`} - Scaled`:`${sourceName} - Scaled`;
 return <Modal show={show} onHide={onHide} size="lg" dialogClassName="recipe-scale-modal" centered><Modal.Header closeButton><Modal.Title>Scale Recipe</Modal.Title></Modal.Header><Modal.Body>
  <div className="recipe-scale-fields">
   <div className="recipe-scale-name"><span>Scaled Recipe:</span><strong>{scaledName}</strong></div>
   <div className="recipe-scale-source"><span>Original Yield:</span><strong>{[measure(originalImperial,recipe?.yield?.imperialUnit),measure(originalMetric,recipe?.yield?.metricUnit)].filter(value=>value!=="—").join(" / ")||"—"}</strong></div>
   <div className="recipe-scale-source"><span>Original Serving Size:</span><strong>{[measure(recipe?.servingSize?.imperialQuantity,recipe?.servingSize?.imperialUnit),measure(recipe?.servingSize?.metricQuantity,recipe?.servingSize?.metricUnit)].filter(value=>value!=="—").join(" / ")||"—"}</strong></div>
   <div className="recipe-scale-field"><span className="recipe-scale-label">Quick Scale:</span><div className="d-flex flex-wrap gap-2">{quickFactors.map(value=><Button key={value} type="button" size="sm" variant={method==="multiplier"&&factor===value?"primary":"outline-primary"} onClick={()=>{finishEditing();changeFactor(value,"multiplier");}}>{value}×</Button>)}</div></div>
   <Form.Group className="recipe-scale-field"><Form.Label>Multiplier:</Form.Label><Form.Control type="text" inputMode="decimal" placeholder="Enter multiplier" value={editing.field==="multiplier"?editing.value:factor>0?display(factor):""} onChange={event=>editFactor("multiplier",event.target.value,1,"multiplier")} onBlur={finishEditing}/></Form.Group>
   <div className="recipe-scale-field"><span className="recipe-scale-label">New Servings:</span><strong>{factor>0?`Imperial: ${imperialServings?`${display(imperialServings)} servings`:"—"} / Metric: ${metricServings?`${display(metricServings)} servings`:"—"}`:"—"}</strong></div>
   <Form.Group className="recipe-scale-field"><Form.Label>Imperial Yield:</Form.Label><InputGroup><Form.Control type="text" inputMode="decimal" value={editing.field==="imperialYield"?editing.value:factor>0?display(imperialBase*factor):""} onChange={event=>editFactor("imperialYield",event.target.value,imperialBase,"imperialYield")} onBlur={finishEditing}/><Form.Select value={imperialUnit} onChange={event=>setImperialUnit(event.target.value)}>{imperialUnits.map(unit=><option key={unit._id} value={unit._id}>{unit.name}</option>)}</Form.Select></InputGroup></Form.Group>
   <Form.Group className="recipe-scale-field"><Form.Label>Metric Yield:</Form.Label><InputGroup><Form.Control type="text" inputMode="decimal" value={editing.field==="metricYield"?editing.value:factor>0?display(metricBase*factor):""} onChange={event=>editFactor("metricYield",event.target.value,metricBase,"metricYield")} onBlur={finishEditing}/><Form.Select value={metricUnit} onChange={event=>setMetricUnit(event.target.value)}>{metricUnits.map(unit=><option key={unit._id} value={unit._id}>{unit.name}</option>)}</Form.Select></InputGroup></Form.Group>
   <Form.Group className="recipe-scale-field"><Form.Label>New Imperial Serving Size:</Form.Label><InputGroup><Form.Control type="text" inputMode="decimal" value={servingImperial} onChange={event=>setServingImperial(event.target.value)}/><Form.Select value={servingImperialUnit} onChange={event=>setServingImperialUnit(event.target.value)}>{imperialUnits.map(unit=><option key={unit._id} value={unit._id}>{unit.name}</option>)}</Form.Select></InputGroup></Form.Group>
   <Form.Group className="recipe-scale-field"><Form.Label>New Metric Serving Size:</Form.Label><InputGroup><Form.Control type="text" inputMode="decimal" value={servingMetric} onChange={event=>setServingMetric(event.target.value)}/><Form.Select value={servingMetricUnit} onChange={event=>setServingMetricUnit(event.target.value)}>{metricUnits.map(unit=><option key={unit._id} value={unit._id}>{unit.name}</option>)}</Form.Select></InputGroup></Form.Group>
  </div>
  <div className="recipe-scale-rcf"><span>Recipe Conversion Factor (RCF):</span><strong>{factor>0?factor.toFixed(4):"—"}</strong></div>
 </Modal.Body><Modal.Footer><Button variant="secondary" onClick={onHide}>Cancel</Button><Button onClick={()=>onSave({name:scaledName,method,factor,newServings:metricServings||imperialServings||originalServings*factor,yieldOverride:{imperialQuantity:scaledImperial,imperialUnit,metricQuantity:scaledMetric,metricUnit}})} disabled={saving||factor<=0}>{saving?"Saving...":"Save Linked Scaled Recipe"}</Button></Modal.Footer></Modal>;
}
