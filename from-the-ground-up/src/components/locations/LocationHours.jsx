// src/components/locations/LocationHours.jsx
import {useEffect,useState} from "react";
import axios from "axios";
import "./LocationHours.css";

function LocationHours(){
 const [locations,setLocations]=useState([]);
 const [selectedId,setSelectedId]=useState("");
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");

 useEffect(()=>{
  const fetchLocations=async()=>{
   try{
    setLoading(true);
    setError("");
    const {data}=await axios.get("/api/locations");
    setLocations(data||[]);
    if(data&&data.length>0)setSelectedId(data[0]._id);
   }catch(err){
    setError(err.response?.data?.message||"Unable to load locations.");
   }finally{
    setLoading(false);
   }
  };

  fetchLocations();
 },[]);

 const selectedLocation=locations.find(location=>location._id===selectedId);

 return(
  <section className="location-hours">
   {loading&&<p className="location-hours-status">Loading locations...</p>}
   {error&&<p className="location-hours-status">{error}</p>}

   {!loading&&!error&&locations.length>0&&(
    <>
     <div className="location-hours-control">
      <label htmlFor="locationSelect" className="location-hours-label">
       <span className="location-hours-label-text">Choose a Location</span>
       <select id="locationSelect" value={selectedId} onChange={(e)=>setSelectedId(e.target.value)} className="location-hours-select">
        {locations.map(location=>(
         <option key={location._id} value={location._id}>{location.name}</option>
        ))}
       </select>
      </label>
     </div>

     {selectedLocation&&(
      <div className="location-hours-card">
       <p className="location-hours-address"> {selectedLocation.address?.replace(/^(.+?),\s*(.+)$/, '$1\n$2')}</p>
       {selectedLocation.phone&&<p className="location-hours-phone"><span className="location-hours-meta-label">Phone:</span> <span className="location-hours-meta-value">{selectedLocation.phone}</span></p>}
       {selectedLocation.overnightPhone&&<p className="location-hours-phone"><span className="location-hours-meta-label">Overnight:</span> <span className="location-hours-meta-value">{selectedLocation.overnightPhone}</span></p>}
       <br/>
       {(selectedLocation.onCallPerson||selectedLocation.onCallPhone)&&(
        <p className="location-hours-phone location-hours-phone-inline">
         {selectedLocation.onCallPerson&&<span><span className="location-hours-meta-label">On Call:</span> <span className="location-hours-meta-value">{selectedLocation.onCallPerson}</span></span>}
         {selectedLocation.onCallPhone&&<span><span className="location-hours-meta-label">On Call Number:</span> <span className="location-hours-meta-value">{selectedLocation.onCallPhone}</span></span>}
        </p>
       )}

       {selectedLocation.hours&&selectedLocation.hours.length>0?(
        <ul className="location-hours-list">
         {selectedLocation.hours.map((item,index)=>(
          <li key={item._id||index} className="location-hours-item">
           <span className="location-hours-day">{item.day}</span>
           <span className="location-hours-time">
            {item.closed?"Closed":`${item.open} - ${item.close}`}
           </span>
          </li>
         ))}
        </ul>
       ):(
        <p className="location-hours-status">No hours available for this location.</p>
       )}
      </div>
     )}
    </>
   )}

   {!loading&&!error&&locations.length===0&&<p className="location-hours-status">No locations found.</p>}
  </section>
 );
}

export default LocationHours;