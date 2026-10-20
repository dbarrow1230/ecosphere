from pathlib import Path
import json
rows=[
 ('Broccoli','Brassica oleracea',18,22,7,10,['Salads','Sandwiches','Smoothies','Soups and wraps']),
 ('Sunflower','Helianthus annuus',20,24,7,10,['Salads','Grain bowls','Pesto','Stir-fries']),
 ('Pea shoots','Pisum sativum',15,20,7,14,['Salads','Stir-fries','Pasta','Garnish']),
 ('Radish','Raphanus sativus',18,22,5,7,['Salads','Tacos','Sandwiches','Garnish']),
 ('Kale','Brassica oleracea',18,22,7,10,['Salads','Smoothies','Soups','Wraps']),
 ('Mustard','Brassica juncea',18,22,5,7,['Salads','Sandwiches','Sushi','Stir-fries']),
 ('Basil','Ocimum basilicum',22,25,10,14,['Pesto','Salads','Pizza','Garnish']),
 ('Cilantro','Coriandrum sativum',18,22,10,14,['Salsas','Tacos','Curries','Garnish']),
 ('Beetroot','Beta vulgaris',18,22,8,12,['Salads','Juices','Grain bowls','Garnish'])]
Path('src/pages/reference/microgreensData.js').write_text('export const microgreens='+json.dumps([dict(name=n,botanicalName=b,minTemperature=lo,maxTemperature=hi,minDays=a,maxDays=z,uses=uses) for n,b,lo,hi,a,z,uses in rows],indent=2)+';\n',encoding='utf-8')
Path('src/pages/reference/MicrogreensGuidePage.jsx').write_text('''import {useState} from "react";
import {Card,Col,Container,Form,Row} from "react-bootstrap";
import {Clock,Leaf,Search,Sun,Thermometer,Droplets,Utensils} from "lucide-react";
import {microgreens} from "./microgreensData.js";
import "./microgreensGuide.css";

export default function MicrogreensGuidePage(){
 const [search,setSearch]=useState("");
 const [quickOnly,setQuickOnly]=useState(false);
 const shown=microgreens.filter(crop=>`${crop.name} ${crop.botanicalName} ${crop.uses.join(" ")}`.toLowerCase().includes(search.toLowerCase())&&(!quickOnly||crop.maxDays<=7));
 return <Container className="microgreens-guide py-4">
  <header className="microgreens-guide-header"><Leaf size={32} aria-hidden="true"/><div><h1>Microgreens Guide</h1><p>Growing conditions, harvest windows, and ways to use nine microgreens.</p></div></header>
  <Card className="mb-3"><Card.Body><h2 className="h4">Start a tray</h2><ol><li>Use a shallow tray with drainage and a seed-starting mix.</li><li>Sow seeds evenly and keep the growing medium moist, without waterlogging it.</li><li>Provide bright light for 12–16 hours each day and good airflow.</li><li>Harvest with clean scissors just above the soil line.</li></ol><p className="mb-0">Harvest windows below are estimates from your supplied guide. Variety and growing conditions affect timing.</p></Card.Body></Card>
  <div className="microgreens-guide-filters"><Form.Group controlId="microgreens-search"><Form.Label><Search size={16} aria-hidden="true"/> Find a microgreen</Form.Label><Form.Control type="search" value={search} onChange={event=>setSearch(event.target.value)} placeholder="Crop, botanical name, or serving idea"/></Form.Group><Form.Check id="microgreens-quick" label="Ready within 7 days" checked={quickOnly} onChange={event=>setQuickOnly(event.target.checked)}/></div>
  <p role="status">{shown.length} of {microgreens.length} microgreens</p>
  <Row className="g-3">{shown.map(crop=><Col md={6} lg={4} key={crop.name}><Card className="h-100"><Card.Body><h2 className="h4">{crop.name}</h2><p><em>{crop.botanicalName}</em></p><dl className="microgreens-facts"><div><dt><Thermometer size={16} aria-hidden="true"/> Temperature</dt><dd>{crop.minTemperature}–{crop.maxTemperature} °C</dd></div><div><dt><Sun size={16} aria-hidden="true"/> Light</dt><dd>Bright light, 12–16 hours/day</dd></div><div><dt><Droplets size={16} aria-hidden="true"/> Moisture</dt><dd>Moist growing medium; avoid waterlogging</dd></div><div><dt><Clock size={16} aria-hidden="true"/> Harvest</dt><dd>{crop.minDays}–{crop.maxDays} days</dd></div></dl><h3 className="h6"><Utensils size={16} aria-hidden="true"/> Serving ideas</h3><ul>{crop.uses.map(use=><li key={use}>{use}</li>)}</ul></Card.Body></Card></Col>)}</Row>
  {!shown.length&&<Card body>No microgreens match your search.</Card>}
 </Container>;
}
''',encoding='utf-8')
Path('src/pages/reference/microgreensGuide.css').write_text('''.microgreens-guide-header{display:flex;align-items:center;gap:1rem;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-md);padding:1.25rem;margin-bottom:1rem;color:var(--primary)}
.microgreens-guide h1,.microgreens-guide h2,.microgreens-guide h3{color:var(--primary)}
.microgreens-guide-header p{margin:0}
.microgreens-guide-filters{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:1rem;align-items:center;margin-bottom:1rem}
.microgreens-facts>div{border-bottom:1px solid var(--border);padding:.45rem 0}
.microgreens-facts dt{display:flex;gap:.35rem;align-items:center;color:var(--primary)}
.microgreens-facts dd{margin:.25rem 0 0}
@media(max-width:600px){.microgreens-guide-filters{grid-template-columns:1fr}}
''',encoding='utf-8')
p=Path('src/App.jsx');s=p.read_text(encoding='utf-8').replace('import GardenReferencePage from "./pages/planning/GardenReferencePage.jsx";','import MicrogreensGuidePage from "./pages/reference/MicrogreensGuidePage.jsx";');s=s.replace('<Route path="/garden-reference" element={<GardenReferencePage/>}/>','<Route path="/microgreens-guide" element={<MicrogreensGuidePage/>}/>\n     <Route path="/garden-reference" element={<Navigate to="/microgreens-guide" replace/>}/>');p.write_text(s,encoding='utf-8')
p=Path('src/components/Navigation.jsx');s=p.read_text(encoding='utf-8').replace('/garden-reference','/microgreens-guide').replace('Garden Worksheets & Microgreens Guide','Microgreens Guide')
a=s.index('             {user&&<>');b=s.index('               </>}',a)+len('               </>}');library=s[a:b];s=s[:a]+s[b:]
library=library.replace('             {user&&<>','').replace('               </>}','').replace('Plant Library','Plant Catalogs & Relationships')
# Records are work; only actual guides remain under Reference.
pos=s.index('id="work-nav"');end=s.index('</NavDropdown>',pos);s=s[:end]+library+s[end:]
for slug in ['plants','seeds','seed-collections','companion-planting']:
 s=s.replace('||isActive("/'+slug+'")','')
s=s.replace('||isActive("/diseases")}','||isActive("/diseases")||isActive("/plants")||isActive("/seeds")||isActive("/seed-collections")||isActive("/companion-planting")}')
p.write_text(s,encoding='utf-8')
Path('src/pages/planning/GardenReferencePage.jsx').unlink()
# Remove the generated PDF/image gallery copies by its exact authored manifest.
p=Path('src/pages/planning/worksheetSources.json')
for item in json.loads(p.read_text(encoding='utf-8')):
 target=(Path('public')/item['url'].lstrip('/')).resolve()
 if target.parent==Path('public/garden-reference').resolve() and target.exists():target.unlink()
p.unlink()
