import {useEffect,useState} from 'react';
import {Alert,Button,Card,Table} from 'react-bootstrap';
import {Link} from 'react-router-dom';
import {savedGrowingLocations} from '../../utils/savedGrowingLocations.js';

export default function SavedGrowingLocations({hydroOnly=false}){
 const [locations,setLocations]=useState([]),[equipment,setEquipment]=useState([]),[error,setError]=useState(''),[loading,setLoading]=useState(true);
 useEffect(()=>{
  let active=true;
  Promise.all(['/api/garden-references','/api/plantings','/api/plants',...(hydroOnly?['/api/equipment']:[])].map(async url=>{const response=await fetch(url);const data=await response.json();if(!response.ok)throw new Error(data.message||'Unable to load saved growing locations');return data;})).then(([references,runs,plants,devices=[]])=>{if(active){setLocations(savedGrowingLocations(references.savedLocations||[],runs,plants));setEquipment(devices.filter(item=>/hydroponics (?:growing system|grower kit)/i.test(item.description||'')));}}).catch(error=>{if(active)setError(error.message);}).finally(()=>{if(active)setLoading(false);});
  return()=>{active=false;};
 },[hydroOnly]);
 const shown=hydroOnly?locations.filter(item=>/hydro|hydoponic|aero|wall garden/i.test(item.name)):locations;
 return <Card className="mb-3"><Card.Header>{hydroOnly?'Saved hydro growing locations':'Saved growing locations'}</Card.Header><Card.Body>
  {error&&<Alert variant="danger">{error}</Alert>}
  <Table responsive><thead><tr><th>Location</th><th>Growing runs</th><th>Plant records</th><th>Open</th></tr></thead><tbody>{shown.map(item=><tr key={item.name}><td>{item.name}{item.description&&<p>{item.description}</p>}</td><td>{item.runs.length}</td><td>{item.plants.length}</td><td><Button as={Link} to={`/plantings?location=${encodeURIComponent(item.name)}`} size="sm">Open growing records</Button></td></tr>)}{!shown.length&&<tr><td colSpan="4">{loading?'Loading saved growing locations…':'No saved growing locations found.'}</td></tr>}</tbody></Table>
  {hydroOnly&&equipment.length>0&&<><h3>Saved hydro equipment</h3><Table responsive><thead><tr><th>Device</th><th>Description</th></tr></thead><tbody>{equipment.map(item=><tr key={item._id}><td>{item.name||item.brand}</td><td>{item.description}</td></tr>)}</tbody></Table><Button as={Link} to="/equipment">Open equipment records</Button></>}
 </Card.Body></Card>;
}
