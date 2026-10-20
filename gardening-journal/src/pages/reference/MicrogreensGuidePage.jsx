import {useState} from "react";
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
