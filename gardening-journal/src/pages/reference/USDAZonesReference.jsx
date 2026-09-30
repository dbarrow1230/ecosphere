import {useState,useEffect,useMemo} from "react";
import {Container,Card,Table,Button,Alert,Spinner} from "react-bootstrap";
import USDAZones from "../../components/usdaZones";
import zoneMap from "../../assets/USDA Plant Hardiness Zone Map.png";
import usdaLogo from "../../assets/USDA Logo.png";

const zoneColors={
 "1a":"#d6d6ff","1b":"#c4c4f2",
 "2a":"#ababd9","2b":"#ebb0eb",
 "3a":"#e091eb","3b":"#cf7ddb",
 "4a":"#a66bff","4b":"#5a75ed",
 "5a":"#73a1ff","5b":"#5ec9e0",
 "6a":"#47ba47","6b":"#78c756",
 "7a":"#abd669","7b":"#cddb70",
 "8a":"#edda85","8b":"#ebcb57",
 "9a":"#dbb64f","9b":"#f5b678",
 "10a":"#eb9c36","10b":"#e6781e",
 "11a":"#e6561e","11b":"#e88564",
 "12a":"#d4594e","12b":"#b51228",
 "13a":"#962f1d","13b":"#751a00"
};

const getZoneTextColor=(color)=>{
 const [red,green,blue]=color.match(/\w\w/g).map(value=>parseInt(value,16));
 const luminance=(red*299+green*587+blue*114)/1000;

 return luminance>145?"#1f1f1f":"#ffffff";
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
           color:getZoneTextColor(color),
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
               color:getZoneTextColor(color),
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
