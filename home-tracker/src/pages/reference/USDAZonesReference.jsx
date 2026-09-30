import {useState,useEffect,useMemo} from "react";
import {Container,Card,Table,Button,Alert,Spinner} from "react-bootstrap";
import USDAZones from "../../components/usdaZones";
import zoneMap from "../../assets/USDA Plant Hardiness Zone Map.png";
import usdaLogo from "../../assets/USDA Logo.png";

const zoneColors={
 "1a":"#4b0082","1b":"#4f00a8",
 "2a":"#5a00b3","2b":"#6a0dad",
 "3a":"#7b1fa2","3b":"#8e24aa",
 "4a":"#3949ab","4b":"#1e88e5",
 "5a":"#039be5","5b":"#00acc1",
 "6a":"#43a047","6b":"#7cb342",
 "7a":"#c0ca33","7b":"#fdd835",
 "8a":"#ffb300","8b":"#fb8c00",
 "9a":"#f4511e","9b":"#e53935",
 "10a":"#d32f2f","10b":"#c62828",
 "11a":"#ad1457","11b":"#880e4f",
 "12a":"#6a1b9a","12b":"#4a148c",
 "13a":"#3e2723","13b":"#2e1b16"
};

export default function USDAZonesReference()
{
 const [zones,setZones]=useState([]);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");
 const [selectedZone,setSelectedZone]=useState("");
 const [lookupResult,setLookupResult]=useState(null);

 useEffect(()=>{
  const fetchZones=async()=>{
   try
   {
    setLoading(true);
    setError("");

    const res=await fetch("/api/reference/usda-zones");
    const data=await res.json();

    if(!res.ok)
    {
     throw new Error(data?.message||"Failed to load USDA zones");
    }

    const records=Array.isArray(data?.data)?data.data:Array.isArray(data)?data:[];
    setZones(records);
   }
   catch(err)
   {
    console.error("USDA zones load error",err);
    setError(err.message||"Failed to load USDA zones");
    setZones([]);
   }
   finally
   {
    setLoading(false);
   }
  };

  fetchZones();
 },[]);

 const sortedZones=useMemo(()=>{
  return [...zones].sort((a,b)=>String(a.zone||"").localeCompare(String(b.zone||""),undefined,{numeric:true,sensitivity:"base"}));
 },[zones]);

 const filteredZones=useMemo(()=>{
  if(!selectedZone)
  {
   return sortedZones;
  }

  return sortedZones.filter(item=>String(item.zone||"").toLowerCase()===String(selectedZone||"").toLowerCase());
 },[sortedZones,selectedZone]);

 const handleZoneSelect=(zoneData)=>{
  setLookupResult(zoneData||null);

  if(zoneData?.zone)
  {
   setSelectedZone(String(zoneData.zone).toLowerCase());
  }
 };

 const handleZoneFilterClick=(zone)=>{
  setSelectedZone(prev=>String(prev||"").toLowerCase()===String(zone||"").toLowerCase()?"":String(zone||"").toLowerCase());
 };

 return(
  <Container fluid className="py-4">

   <Card className="shadow-sm mb-4">
    <Card.Body>
     <Card.Title className="mb-3">Zone Lookup Tool</Card.Title>
     <USDAZones onZoneSelect={handleZoneSelect}/>
     {lookupResult&&<Alert variant="success" className="mt-3 mb-0">Showing filtered results for zone <strong>{String(lookupResult.zone||"").toUpperCase()}</strong>.</Alert>}
    </Card.Body>
   </Card>

   <Card className="shadow-sm mb-4">
    <Card.Body>
     <Card.Title className="mb-3">USDA Plant Hardiness Zone Map</Card.Title>
     <div className="text-center">
      <img src={zoneMap} alt="USDA Plant Hardiness Zone Map" className="img-fluid rounded border"/>
     </div>
    </Card.Body>
   </Card>

   <Card className="shadow-sm mb-4">
    <Card.Body>
     <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
      <div>
       <Card.Title className="mb-1">USDA Zone Reference Table</Card.Title>
       <div className="text-muted">{selectedZone?`Filtered to ${String(selectedZone).toUpperCase()}`:"Showing all zones"}</div>
      </div>
      {selectedZone&&<Button variant="secondary" onClick={()=>setSelectedZone("")}>Clear Filter</Button>}
     </div>

     {error&&<Alert variant="danger" className="mb-3">{error}</Alert>}

     {!loading&&(
      <div className="mb-3 d-flex flex-wrap gap-2">
       {sortedZones.map(item=>{
        const zoneKey=String(item.zone||"").toLowerCase();
        const color=zoneColors[zoneKey]||"#cccccc";
        const isSelected=String(selectedZone||"").toLowerCase()===zoneKey;

        return(
         <Button
          key={item._id||item.zone}
          size="sm"
          style={{
           backgroundColor:color,
           border:isSelected?"2px solid #1f1f1f":"none",
           color:"#ffffff",
           fontWeight:"600",
           opacity:isSelected?1:0.9
          }}
          onClick={()=>handleZoneFilterClick(item.zone)}
         >
          {String(item.zone||"").toUpperCase()}
         </Button>
        );
       })}
      </div>
     )}

     {loading?(
      <div className="text-center py-5">
       <Spinner animation="border"/>
      </div>
     ):(
      <div className="table-responsive">
       <Table striped bordered hover>
        <thead>
         <tr>
          <th>Zone</th>
          <th>Region</th>
          <th>Temp Range °F</th>
          <th>Temp Range °C</th>
          <th>Description</th>
          <th>Last Spring Frost</th>
          <th>First Fall Frost</th>
          <th>Indoor Start</th>
          <th>Transplant Outside</th>
          <th>Direct Sow</th>
          <th>Harvest Window</th>
         </tr>
        </thead>
        <tbody>
         {filteredZones.length?filteredZones.map(item=>{
          const zoneKey=String(item.zone||"").toLowerCase();
          const color=zoneColors[zoneKey]||"#ccc";

          return(
           <tr key={item._id||item.zone}>
            <td>
             <Button
              size="sm"
              style={{
               backgroundColor:color,
               border:"none",
               color:"#fff",
               fontWeight:"600"
              }}
              onClick={()=>handleZoneFilterClick(item.zone)}
             >
              {String(item.zone||"").toUpperCase()}
             </Button>
            </td>

            <td>{item.region||""}</td>

            <td>
             <div style={{
              background:`linear-gradient(90deg, ${color}, #ffffff)`,
              padding:"4px 8px",
              borderRadius:"4px"
             }}>
              {item.temperatureRange?.fahrenheit?.min??""} to {item.temperatureRange?.fahrenheit?.max??""}
             </div>
            </td>

            <td>
             <div style={{
              background:`linear-gradient(90deg, ${color}, #ffffff)`,
              padding:"4px 8px",
              borderRadius:"4px"
             }}>
              {item.temperatureRange?.celsius?.min??""} to {item.temperatureRange?.celsius?.max??""}
             </div>
            </td>

            <td>{item.description||""}</td>
            <td>{item.avgFrostDates?.lastSpringFrost||""}</td>
            <td>{item.avgFrostDates?.firstFallFrost||""}</td>
            <td>{item.plantingWindows?.indoorStart||""}</td>
            <td>{item.plantingWindows?.transplantOutside||""}</td>
            <td>{item.plantingWindows?.directSow||""}</td>
            <td>{item.plantingWindows?.harvestWindow||""}</td>
           </tr>
          );
         }):(
          <tr>
           <td colSpan="11" className="text-center">No USDA zone records found.</td>
          </tr>
         )}
        </tbody>
       </Table>
      </div>
     )}
    </Card.Body>
   </Card>

   <Card className="shadow-sm">
    <Card.Body className="text-center">
     <a href="https://planthardiness.ars.usda.gov/" target="_blank" rel="noreferrer" className="d-inline-flex flex-column align-items-center text-decoration-none">
      <img src={usdaLogo} alt="USDA Logo" className="img-fluid mb-3" style={{maxHeight:"120px"}}/>
      <span className="fw-semibold">USDA Plant Hardiness Zone Map</span>
     </a>
    </Card.Body>
   </Card>

  </Container>
 );
}