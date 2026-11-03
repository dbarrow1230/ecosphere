// /src/pages/StoreLocationPage.jsx
import {useEffect,useMemo,useRef,useState} from 'react';
import {Alert,Button,Card,Col,Form,InputGroup,Row,Spinner,Table} from 'react-bootstrap';

const toRadians=value=>value*(Math.PI/180);

const calculateDistanceKm=(lat1,lng1,lat2,lng2)=>{
const earthRadiusKm=6371;
const dLat=toRadians(lat2-lat1);
const dLng=toRadians(lng2-lng1);
const a=
Math.sin(dLat/2)*Math.sin(dLat/2)+
Math.cos(toRadians(lat1))*Math.cos(toRadians(lat2))*
Math.sin(dLng/2)*Math.sin(dLng/2);
const c=2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
return earthRadiusKm*c;
};

const formatAddress=(store,getStateName,getCountryName)=>{
const parts=[
store.address1,
store.address2,
store.city,
getStateName(store.state),
store.postalCode,
getCountryName(store.country)
].filter(Boolean);
return parts.join(', ');
};

export default function StoreLocationPage(){
const [stores,setStores]=useState([]);
const [states,setStates]=useState([]);
const [countries,setCountries]=useState([]);
const [loading,setLoading]=useState(true);
const [searching,setSearching]=useState(false);
const [query,setQuery]=useState('');
const [radiusKm,setRadiusKm]=useState(25);
const [userCoords,setUserCoords]=useState(null);
const [results,setResults]=useState([]);
const [alert,setAlert]=useState({show:false,type:'success',message:''});
const alertTimerRef=useRef(null);

const activePhysicalStores=useMemo(()=>{
return stores.filter(store=>{
const coordinates=store?.location?.coordinates;
const hasCoords=Array.isArray(coordinates)&&coordinates.length===2&&Number(coordinates[0])!==0&&Number(coordinates[1])!==0;
return store.isActive&&!store.isOnline&&hasCoords;
});
},[stores]);

const showAutoCloseAlert=(type,message)=>{
if(alertTimerRef.current)clearTimeout(alertTimerRef.current);
setAlert({show:true,type,message});
alertTimerRef.current=setTimeout(()=>{
setAlert(prev=>({...prev,show:false}));
},5000);
};

const closeAlert=()=>{
if(alertTimerRef.current)clearTimeout(alertTimerRef.current);
setAlert(prev=>({...prev,show:false}));
};

useEffect(()=>{
loadData();
return()=>{
if(alertTimerRef.current)clearTimeout(alertTimerRef.current);
};
},[]);

const loadData=async()=>{
setLoading(true);
try{
const [storeRes,stateRes,countryRes]=await Promise.all([
fetch('/api/stores?isActive=true'),
fetch('/api/states'),
fetch('/api/countries')
]);
const storeData=await storeRes.json();
const stateData=await stateRes.json();
const countryData=await countryRes.json();

if(!storeRes.ok)throw new Error(storeData.message||'Failed to load stores');

setStores(storeData.stores||storeData.data||storeData||[]);
setStates(stateData.states||stateData.data||stateData||[]);
setCountries(countryData.countries||countryData.data||countryData||[]);
}catch(err){
showAutoCloseAlert('danger',err.message||'Failed to load store locations');
}finally{
setLoading(false);
}
};

const getStateName=value=>{
if(!value)return '';
if(typeof value==='object')return value.name||'';
const found=states.find(item=>item._id===value);
return found?found.name:'';
};

const getCountryName=value=>{
if(!value)return '';
if(typeof value==='object')return value.name||'';
const found=countries.find(item=>item._id===value);
return found?found.name:'';
};

const geocodeAddress=async address=>{
const res=await fetch(`/api/geocode/search?query=${encodeURIComponent(address)}`);
const data=await res.json();
if(!res.ok)throw new Error(data.message||'Unable to find that address');
const first=data.result||data.location||(Array.isArray(data.results)?data.results[0]:null);
if(!first)throw new Error('No matching address found');
const lat=Number(first.lat??first.latitude);
const lng=Number(first.lng??first.lon??first.longitude);
if(!Number.isFinite(lat)||!Number.isFinite(lng))throw new Error('Invalid geocode result');
return{lat,lng,label:first.formattedAddress||first.display_name||address};
};

const searchNearbyStores=coords=>{
const matched=activePhysicalStores.map(store=>{
const lng=Number(store.location.coordinates[0]);
const lat=Number(store.location.coordinates[1]);
const distanceKm=calculateDistanceKm(coords.lat,coords.lng,lat,lng);
return{...store,distanceKm};
}).filter(store=>store.distanceKm<=Number(radiusKm||0)).sort((a,b)=>a.distanceKm-b.distanceKm);
setResults(matched);
if(!matched.length)showAutoCloseAlert('warning','No nearby stores found in that radius');
};

const handleUseMyLocation=()=>{
if(!navigator.geolocation){
showAutoCloseAlert('danger','Geolocation is not supported in this browser');
return;
}
setSearching(true);
navigator.geolocation.getCurrentPosition(
position=>{
const coords={lat:position.coords.latitude,lng:position.coords.longitude,label:'My Current Location'};
setUserCoords(coords);
searchNearbyStores(coords);
setSearching(false);
},
error=>{
showAutoCloseAlert('danger',error.message||'Unable to get your location');
setSearching(false);
},
{enableHighAccuracy:true,timeout:10000,maximumAge:0}
);
};

const handleAddressSearch=async e=>{
e.preventDefault();
if(!query.trim()){
showAutoCloseAlert('danger','Enter an address or postal code');
return;
}
setSearching(true);
try{
const coords=await geocodeAddress(query.trim());
setUserCoords(coords);
searchNearbyStores(coords);
}catch(err){
showAutoCloseAlert('danger',err.message||'Unable to search that address');
}finally{
setSearching(false);
}
};

return(
<div className="container py-4">
<div className="d-flex justify-content-between align-items-center mb-3">
<h3 className="mb-0">Store Locator</h3>
</div>

{alert.show&&(
<Alert variant={alert.type} dismissible onClose={closeAlert}>
{alert.message}
</Alert>
)}

<Card className="shadow-sm mb-4">
<Card.Body>
<Row className="g-3">
<Col lg={8}>
<Form onSubmit={handleAddressSearch}>
<Form.Label>Enter an address, city, or postal code</Form.Label>
<InputGroup>
<Form.Control
type="text"
value={query}
onChange={e=>setQuery(e.target.value)}
placeholder="Search by address, city, or postal code"
/>
<Button type="submit" variant="primary" disabled={searching}>
{searching?'Searching...':'Find Nearby Stores'}
</Button>
</InputGroup>
</Form>
</Col>

<Col lg={2}>
<Form.Label>Radius (km)</Form.Label>
<Form.Select value={radiusKm} onChange={e=>setRadiusKm(e.target.value)}>
<option value={5}>5 km</option>
<option value={10}>10 km</option>
<option value={25}>25 km</option>
<option value={50}>50 km</option>
<option value={100}>100 km</option>
</Form.Select>
</Col>

<Col lg={2} className="d-flex align-items-end">
<Button type="button" variant="outline-secondary" className="w-100" onClick={handleUseMyLocation} disabled={searching}>
Use My Location
</Button>
</Col>
</Row>

{userCoords&&(
<div className="mt-3">
<strong>Search point:</strong> {userCoords.label} ({userCoords.lat.toFixed(6)}, {userCoords.lng.toFixed(6)})
</div>
)}
</Card.Body>
</Card>

<Card className="shadow-sm">
<Card.Body>
{loading?(
<div className="text-center py-4">
<Spinner animation="border" />
</div>
):(
<div className="table-responsive">
<Table striped bordered hover responsive className="align-middle mb-0">
<thead>
<tr>
<th>Store</th>
<th>Address</th>
<th>Phone</th>
<th>Website</th>
<th>Distance</th>
</tr>
</thead>
<tbody>
{results.length?results.map(store=>(
<tr key={store._id}>
<td>{store.name}</td>
<td>{formatAddress(store,getStateName,getCountryName)}</td>
<td>{store.phone||''}</td>
<td>
{store.website?(
<a href={store.website} target="_blank" rel="noreferrer">{store.website}</a>
):''}
</td>
<td>{store.distanceKm.toFixed(2)} km</td>
</tr>
)):(
<tr>
<td colSpan="5" className="text-center">
{userCoords?'No nearby stores found':'Search for a location to find nearby stores'}
</td>
</tr>
)}
</tbody>
</Table>
</div>
)}
</Card.Body>
</Card>
</div>
);
}