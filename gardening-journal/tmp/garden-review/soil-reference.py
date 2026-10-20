from pathlib import Path
import json
# Verified germination values from OSU Extension; omit rows with inconsistent published ranges.
data=[
 ('Asparagus','Perennial vegetables',50,60,85,75,95),('Bean','Legumes',60,60,85,80,95),
 ('Beet','Root crops',40,50,85,85,95),('Carrot','Root crops',40,45,85,80,95),
 ('Cauliflower','Brassicas',40,45,85,80,100),('Swiss chard','Leafy greens',40,50,85,85,95),
 ('Corn','Fruiting vegetables',50,60,95,95,105),('Cucumber','Fruiting vegetables',60,60,95,95,105),
 ('Eggplant','Fruiting vegetables',60,75,90,85,95),('Lettuce','Leafy greens',35,40,80,75,95),
 ('Muskmelon','Melons',60,75,95,90,100),('Onion','Alliums',35,50,95,75,95),
 ('Parsley','Herbs',40,50,85,75,90),('Parsnip','Root crops',35,50,70,65,85),
 ('Pea','Legumes',40,40,75,75,85),('Pepper','Fruiting vegetables',60,65,95,85,95),
 ('Radish','Root crops',40,45,90,85,95),('Spinach','Leafy greens',35,45,75,70,85),
 ('Squash','Fruiting vegetables',60,70,95,95,100),('Tomato','Fruiting vegetables',50,60,85,85,95),
 ('Turnip','Root crops',40,60,105,85,105),('Watermelon','Melons',60,70,95,95,105)]
Path('src/pages/reference/soilTemperatureData.js').write_text('''// Source: OSU Extension, Soil temperature conditions for vegetable seed germination.
// Values are germination references in Fahrenheit, not transplanting thresholds.
export const soilTemperatureSources={
 crops:"https://extension.oregonstate.edu/catalog/soil-temperature-conditions-vegetable-seed-germination",
 zones:"https://planthardiness.ars.usda.gov/pages/how-to-use-the-maps",
 planting:"https://extension.umn.edu/garden-and-home/yard-and-garden/gardening-in-minnesota/planting-the-vegetable-garden"
};
export const soilTemperatureCrops='''+json.dumps([dict(name=n,type=t,minimum=mi,optimumLow=lo,optimumHigh=hi,optimum=opt,maximum=ma) for n,t,mi,lo,hi,opt,ma in data],indent=2)+''';

export const hardinessZones=Array.from({length:26},(_,index)=>`${Math.floor(index/2)+1}${index%2?"b":"a"}`);
export const toCelsius=fahrenheit=>(fahrenheit-32)*5/9;
export const toFahrenheit=celsius=>celsius*9/5+32;
export const displaySoilTemperature=(value,unit)=>`${Number((unit==="C"?toCelsius(value):value).toFixed(1))} °${unit}`;

export function zoneWinterRange(zone){
 if(!hardinessZones.includes(zone))return null;
 const number=Number(zone.slice(0,-1));
 const minimum=number*10-70+(zone.endsWith("b")?5:0);
 return {minimum,maximum:minimum+5};
}

export function soilGerminationStatus(crop,reading,unit){
 if(reading===""||reading===null||reading===undefined)return null;
 const value=Number(reading);
 if(!Number.isFinite(value))return null;
 const fahrenheit=unit==="C"?toFahrenheit(value):value;
 if(fahrenheit<crop.minimum)return {level:"cold",label:"Below germination minimum"};
 if(fahrenheit>crop.maximum)return {level:"hot",label:"Above germination maximum"};
 if(fahrenheit<crop.optimumLow)return {level:"cool",label:"Below preferred germination range"};
 if(fahrenheit>crop.optimumHigh)return {level:"warm",label:"Above preferred germination range"};
 return {level:"preferred",label:"Within preferred germination range"};
}
''',encoding='utf-8')
Path('src/pages/reference/SoilTemperatureReferencePage.jsx').write_text('''import {useMemo,useState} from "react";
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
''',encoding='utf-8')
Path('src/pages/reference/soilTemperatureReference.css').write_text('''.soil-temperature-reference{display:grid;gap:1rem;padding:1.5rem 2rem;color:var(--primary)}
.soil-temperature-header{display:flex;align-items:center;gap:1rem;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-md);padding:1.25rem}
.soil-temperature-header h1{color:var(--primary);font-size:1.8rem}
.soil-temperature-header p{margin:0;color:var(--primary)}
.soil-temperature-reference h2{display:flex;align-items:center;gap:.4rem;font-size:1.15rem;color:var(--primary)}
.soil-reference-context{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1rem}
.soil-reference-table{--bs-table-bg:transparent;--bs-table-color:var(--primary);box-shadow:none}
.soil-reference-table th{color:var(--primary);font-size:.875rem;white-space:nowrap}
.soil-reference-table caption{caption-side:bottom;color:var(--primary)}
.soil-reading-status{font-size:.85rem;font-weight:700}
.soil-reading-cold,.soil-reading-hot{color:#9b2929}
.soil-reading-cool,.soil-reading-warm{color:#80571d}
.soil-reading-preferred{color:var(--primary)}
.soil-reference-note{font-size:.85rem;margin-bottom:0}
.soil-reference-sources{display:grid;gap:.4rem;background:var(--surface);border:1px solid var(--border);padding:1rem;border-radius:var(--radius-md)}
@media(max-width:760px){.soil-temperature-reference{padding:1rem}.soil-reference-context{grid-template-columns:1fr}}
''',encoding='utf-8')
p=Path('src/App.jsx');s=p.read_text(encoding='utf-8').replace('import MicrogreensGuidePage from','import SoilTemperatureReferencePage from "./pages/reference/SoilTemperatureReferencePage.jsx";\nimport MicrogreensGuidePage from');s=s.replace('<Route path="/microgreens-guide"','<Route path="/soil-temperatures" element={<SoilTemperatureReferencePage user={user}/>}/>\n     <Route path="/microgreens-guide"');p.write_text(s,encoding='utf-8')
p=Path('src/components/Navigation.jsx');s=p.read_text(encoding='utf-8').replace('BookOpen,Bug,','BookOpen,Bug,Thermometer,').replace('active={isActive("/microgreens-guide")','active={isActive("/soil-temperatures")||isActive("/microgreens-guide")');s=s.replace('       <NavDropdown.Item as={NavLink} to="/microgreens-guide">','       <NavDropdown.Item as={NavLink} to="/soil-temperatures"><Thermometer size={16} aria-hidden="true"/> Soil Temperatures</NavDropdown.Item>\n       <NavDropdown.Item as={NavLink} to="/microgreens-guide">');p.write_text(s,encoding='utf-8')
