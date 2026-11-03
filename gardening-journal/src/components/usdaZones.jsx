import {useState,useEffect} from "react";
import {Form,Button,Card,Spinner,Alert} from "react-bootstrap";
import "./usdaZones.css";

export default function USDAZones({zipCode="",zone="",coordinates={lat:null,lon:null},onZoneSelect=()=>{}})
{
 const [inputZipCode,setInputZipCode]=useState(zipCode||"");
 const [result,setResult]=useState(zone?{zipCode,zone,coordinates}:null);
 const [error,setError]=useState("");
 const [loading,setLoading]=useState(false);

 useEffect(()=>{
  setInputZipCode(zipCode||"");
 },[zipCode]);

 const fetchZone=async(zip)=>{
  const response=await fetch(`https://phzmapi.org/${zip}.json`);

  if(!response.ok)
  {
   throw new Error("Unable to fetch growing zone data.");
  }

  return await response.json();
 };

 const handleFindZone=async()=>{
  const zipCodeRegex=/^\d{5}$/;

  if(!zipCodeRegex.test(inputZipCode))
  {
   setError("Please enter a valid 5-digit ZIP code.");
   setResult(null);
   return;
  }

  try
  {
   setLoading(true);
   setError("");

   const data=await fetchZone(inputZipCode);

   const zoneData={
    zipCode:inputZipCode,
    zone:data.zone||"",
    coordinates:{
     lat:data.coordinates?.lat!==undefined?Number(data.coordinates.lat):null,
     lon:data.coordinates?.lon!==undefined?Number(data.coordinates.lon):null
    }
   };

   setResult(zoneData);
   onZoneSelect(zoneData);
  }
  catch(err)
  {
   setError("Could not retrieve data. Please try again.");
   setResult(null);
  }
  finally
  {
   setLoading(false);
  }
 };

 return(
  <>
   <Form.Group controlId="zipCodeTB" className="mb-3">
    <Form.Label>Enter Your Zip Code to Find Your Growing Zone:</Form.Label>
    <Form.Control type="text" placeholder="Zip Code" value={inputZipCode} onChange={(e)=>setInputZipCode(e.target.value)}/>
   </Form.Group>

   <Button type="button" onClick={handleFindZone} disabled={loading}>
    {loading?(
     <>
      <Spinner size="sm" className="me-2"/>
      Loading...
     </>
    ):(
     "Find Zone"
    )}
   </Button>

   {error&&(
    <Alert variant="danger" className="mt-3">
     {error}
    </Alert>
   )}

   {result&&(
    <Card className="mt-4">
     <Card.Body>
      <Card.Title>Your Growing Zone</Card.Title>
      <div>ZIP Code: {result.zipCode||""}</div>
      <div>Zone: {result.zone}</div>
      <div>Lat: {result.coordinates?.lat??""}</div>
      <div>Lon: {result.coordinates?.lon??""}</div>
     </Card.Body>
    </Card>
   )}
  </>
 );
}