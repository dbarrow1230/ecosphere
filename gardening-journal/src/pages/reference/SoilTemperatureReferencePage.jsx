import {useMemo,useState} from "react";
import {Link} from "react-router-dom";
import {Card,Col,Form,Row,Table} from "react-bootstrap";
import {Leaf,MapPin,Thermometer} from "lucide-react";
import {displaySoilTemperature,hardinessZones,soilGerminationStatus,soilTemperatureCrops,soilTemperatureSources,zoneWinterRange} from "./soilTemperatureData.js";
import "./soilTemperatureReference.css";

const types=[...new Set(soilTemperatureCrops.map(crop=>crop.type))].sort();
export default function SoilTemperatureReferencePage({user}){
 const [type,setType]=useState("all");
 const [cropName,setCropName]=useState("all");
 const [zone,setZone]=useState(()=>{
  const value=user?.hardinessZone?.zone||user?.hardinessZone?.name||"";
  return hardinessZones.includes(String(value).toLowerCase())?String(value).toLowerCase():"";
 });
 const [unit,setUnit]=useState("F");
 const [reading,setReading]=useState("");
 const crops=useMemo(()=>soilTemperatureCrops.filter(crop=>(type==="all"||crop.type===type)&&(cropName==="all"||crop.name===cropName)).sort((a,b)=>a.name.localeCompare(b.name)),[type,cropName]);
 const winter=zoneWinterRange(zone);
 const format=value=>displaySoilTemperature(value,unit);
 return <section className="soil-temperature-reference">
  <header className="soil-temperature-header"><Thermometer size={30} aria-hidden="true"/><div><h1>Soil Temperature Reference</h1><p>Seed germination guidance by plant type and crop, with growing-zone context.</p></div></header>
  <Card><Card.Body><Row className="g-3">
   <Col md={6} xl={3}><Form.Group controlId="soil-reference-type"><Form.Label>Plant type</Form.Label><Form.Select value={type} onChange={event=>{setType(event.target.value);setCropName("all");}}><option value="all">All plant types</option>{types.map(value=><option key={value}>{value}</option>)}</Form.Select></Form.Group></Col>
   <Col md={6} xl={3}><Form.Group controlId="soil-reference-crop"><Form.Label>Crop</Form.Label><Form.Select value={cropName} onChange={event=>setCropName(event.target.value)}><option value="all">All crops</option>{soilTemperatureCrops.filter(crop=>type==="all"||crop.type===type).sort((a,b)=>a.name.localeCompare(b.name)).map(crop=><option key={crop.name}>{crop.name}</option>)}</Form.Select></Form.Group></Col>
   <Col md={6} xl={3}><Form.Group controlId="soil-reference-zone"><Form.Label>USDA zone</Form.Label><Form.Select value={zone} onChange={event=>setZone(event.target.value)}><option value="">Choose your zone</option>{hardinessZones.map(value=><option key={value} value={value}>{value.toUpperCase()}</option>)}</Form.Select></Form.Group></Col>
   <Col md={6} xl={3}><Form.Group controlId="soil-reference-unit"><Form.Label>Units</Form.Label><Form.Select value={unit} onChange={event=>{setUnit(event.target.value);setReading("");}}><option value="F">Fahrenheit (°F)</option><option value="C">Celsius (°C)</option></Form.Select></Form.Group></Col>
  </Row></Card.Body></Card>
  <div className="soil-reference-context">
   <Card><Card.Body><h2><MapPin size={20} aria-hidden="true"/> {zone?`Zone ${zone.toUpperCase()}`:"Growing-zone context"}</h2>{winter&&<p>Average annual extreme winter minimum: <strong>{format(winter.minimum)} to {format(winter.maximum)}</strong>.</p>}<p>USDA zones describe winter cold. They do not specify soil temperature or a planting date. Use your local frost dates and a soil reading when deciding when to sow.</p><p>Crop germination targets below apply across zones; your location affects when the soil reaches them.</p><Link to="/hardiness-zones">Find your hardiness zone</Link></Card.Body></Card>
   <Card><Card.Body><h2><Thermometer size={20} aria-hidden="true"/> Compare a soil reading</h2><Form.Group controlId="soil-reference-reading"><Form.Label>Soil reading (°{unit})</Form.Label><Form.Control type="number" step="any" value={reading} onChange={event=>setReading(event.target.value)} placeholder="Optional"/></Form.Group><p className="mt-3 mb-0">Enter a temperature to compare it with each crop’s germination range. These are seed-starting ranges, not transplanting or winter-survival temperatures.</p></Card.Body></Card>
  </div>
  <Card><Card.Body><h2><Leaf size={20} aria-hidden="true"/> Germination temperatures</h2><p role="status">{crops.length} crops shown</p><Table responsive className="soil-reference-table"><caption>Crop-specific soil temperatures for seed germination. Source: Oregon State University Extension.</caption><thead><tr><th scope="col">Crop</th><th scope="col">Plant type</th><th scope="col">Minimum</th><th scope="col">Preferred range</th><th scope="col">Optimum</th><th scope="col">Maximum</th>{reading!==""&&<th scope="col">Your reading</th>}</tr></thead><tbody>{crops.map(crop=>{
   const status=soilGerminationStatus(crop,reading,unit);
   return <tr key={crop.name}><th scope="row">{crop.name}</th><td>{crop.type}</td><td>{format(crop.minimum)}</td><td>{format(crop.optimumLow)}–{format(crop.optimumHigh)}</td><td>{format(crop.optimum)}</td><td>{format(crop.maximum)}</td>{reading!==""&&<td><span className={`soil-reading-status soil-reading-${status?.level||"unknown"}`}>{status?.label||"Enter a valid temperature"}</span></td>}</tr>;
  })}</tbody></Table><p className="soil-reference-note">The source notes that daily temperature fluctuation, including nights at or below 60 °F, matters to germination. A single reading does not describe the whole day.</p></Card.Body></Card>
  <footer className="soil-reference-sources"><h2>Reference sources</h2><a href={soilTemperatureSources.crops} target="_blank" rel="noreferrer">OSU Extension: crop germination temperatures</a><a href={soilTemperatureSources.zones} target="_blank" rel="noreferrer">USDA: understanding hardiness zones</a><a href={soilTemperatureSources.planting} target="_blank" rel="noreferrer">University of Minnesota Extension: planting guidance</a></footer>
 </section>;
}
