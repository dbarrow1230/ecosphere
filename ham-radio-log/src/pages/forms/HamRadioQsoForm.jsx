import {useEffect,useState} from "react";
import {Alert,Button,Col,Form,Row,Spinner} from "react-bootstrap";

const bands=["160m","80m","60m","40m","30m","20m","17m","15m","12m","11m / CB","10m","6m","2m","1.25m","70cm","33cm","23cm","Other"];
const modes=["SSB","CW","FM","AM","FT8","FT4","RTTY","PSK31","JS8","DMR","D-STAR","C4FM","Other"];
const getId=value=>typeof value==="object"&&value?value._id||"":value||"";
const isCbBand=band=>String(band||"").toLowerCase().includes("11m")||String(band||"").toLowerCase().includes("cb");
const formatTime=value=>{
 const [hourText,minute="00"]=String(value||"").split(":");
 const hour=Number(hourText);
 return `${hour%12||12}:${minute} ${hour>=12?"PM":"AM"}`;
};
const standardTimeOptions=Array.from({length:288},(_,index)=>{
 const totalMinutes=index*5;
 return `${String(Math.floor(totalMinutes/60)).padStart(2,"0")}:${String(totalMinutes%60).padStart(2,"0")}`;
});
const frequencyOptionsByBand={
 "160m":[[1.843,"Digital activity"],[1.900,"Voice calling"]],
 "80m":[[3.573,"FT8"],[3.885,"AM calling"],[3.900,"Voice"]],
 "60m":[[5.332,"Channel 1"],[5.348,"Channel 2"],[5.3585,"Channel 3"],[5.373,"Channel 4"],[5.405,"Channel 5"]],
 "40m":[[7.030,"CW"],[7.074,"FT8"],[7.200,"Voice"],[7.285,"AM calling"]],
 "30m":[[10.116,"CW"],[10.136,"FT8"]],
 "20m":[[14.052,"CW"],[14.074,"FT8"],[14.230,"SSTV"],[14.250,"Voice"],[14.300,"Maritime mobile net"]],
 "17m":[[18.100,"FT8"],[18.130,"Voice"]],
 "15m":[[21.052,"CW"],[21.074,"FT8"],[21.300,"Voice"]],
 "12m":[[24.915,"CW"],[24.925,"FT8"],[24.950,"Voice"]],
 "10m":[[28.074,"FT8"],[28.400,"Voice"],[29.600,"FM simplex"]],
 "6m":[[50.125,"Voice calling"],[50.313,"FT8"],[52.525,"FM simplex"]],
 "2m":[[144.200,"SSB calling"],[144.390,"APRS"],[146.520,"FM simplex"]],
 "1.25m":[[223.500,"FM simplex"]],
 "70cm":[[432.100,"SSB calling"],[446.000,"FM simplex"]],
 "33cm":[[906.500,"FM simplex"],[927.500,"FM simplex"]],
 "23cm":[[1294.500,"FM simplex"],[1296.100,"SSB calling"]]
};
const cbChannelFrequencies=[26.965,26.975,26.985,27.005,27.015,27.025,27.035,27.055,27.065,27.075,27.085,27.105,27.115,27.125,27.135,27.155,27.165,27.175,27.185,27.205,27.215,27.225,27.255,27.235,27.245,27.265,27.275,27.285,27.295,27.305,27.315,27.325,27.335,27.345,27.355,27.365,27.375,27.385,27.395,27.405];
frequencyOptionsByBand["11m / CB"]=cbChannelFrequencies.map((frequency,index)=>[frequency,`CB Channel ${index+1}`]);

const getLocalParts=value=>{
 const date=value?new Date(value):new Date();
 if(Number.isNaN(date.getTime()))return {contactDate:"",contactTime:""};
 const year=date.getFullYear();
 const month=String(date.getMonth()+1).padStart(2,"0");
 const day=String(date.getDate()).padStart(2,"0");
 const hours=String(date.getHours()).padStart(2,"0");
 const minutes=String(date.getMinutes()).padStart(2,"0");
 return {
  contactDate:`${year}-${month}-${day}`,
  contactTime:`${hours}:${minutes}`
 };
};

const emptyForm=()=>({
 ...getLocalParts(),callSign:"",frequencyMHz:"",band:"20m",mode:"SSB",rstSent:"59",rstReceived:"59",
 contactName:"",qth:"",gridSquare:"",countryRef:"",stateRef:"",qslStatus:"not-requested",notes:""
});

export default function HamRadioQsoForm({initialData,hamRadioCallSign="",cbHandle="",onSubmit,onCancel,saving=false}){
 const [formData,setFormData]=useState(()=>initialData?{
  ...emptyForm(),...initialData,...getLocalParts(initialData.contactDate),frequencyMHz:initialData.frequencyMHz??"",
  countryRef:getId(initialData.countryRef),stateRef:getId(initialData.stateRef)
 }:emptyForm());
 const [countries,setCountries]=useState([]);
 const [states,setStates]=useState([]);
 const [locationsLoading,setLocationsLoading]=useState(true);
 const [locationError,setLocationError]=useState("");
 const cbBandSelected=isCbBand(formData.band);
 const operatorIdentity=cbBandSelected?cbHandle:hamRadioCallSign;
 const operatorLabel=cbBandSelected?"Operator CB handle":"Operator call sign";
 const timeOptions=standardTimeOptions.includes(formData.contactTime)?standardTimeOptions:[...standardTimeOptions,formData.contactTime].filter(Boolean).sort();
 const bandFrequencyOptions=frequencyOptionsByBand[formData.band]||[];
 const selectedFrequencyIsListed=bandFrequencyOptions.some(([frequency])=>String(frequency)===String(formData.frequencyMHz));

 useEffect(()=>{
  let ignore=false;
  const loadLocations=async()=>{
   try{
    const [countriesResponse,statesResponse]=await Promise.all([fetch("/api/countries"),fetch("/api/states")]);
    const [countriesData,statesData]=await Promise.all([countriesResponse.json(),statesResponse.json()]);
    if(!countriesResponse.ok)throw new Error(countriesData.message||"Failed to load countries");
    if(!statesResponse.ok)throw new Error(statesData.message||"Failed to load states");
    if(!ignore){
     setCountries(Array.isArray(countriesData.data)?countriesData.data:[]);
     setStates(Array.isArray(statesData.data)?statesData.data:[]);
    }
   }catch(error){
    if(!ignore)setLocationError(error.message);
   }finally{
    if(!ignore)setLocationsLoading(false);
   }
  };
  loadLocations();
  return()=>{ignore=true;};
 },[]);

 const handleChange=event=>{
  const {name,value}=event.target;
  setFormData(current=>name==="band"?{
   ...current,
   band:value,
   frequencyMHz:frequencyOptionsByBand[value]?.[0]?.[0]??""
  }:{...current,[name]:value});
 };

 const handleSubmit=event=>{
  event.preventDefault();
  const localDateTime=new Date(`${formData.contactDate}T${formData.contactTime}`);
  onSubmit({...formData,contactDate:localDateTime.toISOString()});
 };

 return(
  <Form onSubmit={handleSubmit} className="ham-radio-qso-form">
   {locationError?<Alert variant="danger">{locationError}</Alert>:null}
   {!operatorIdentity?<Alert variant="warning">Add a {cbBandSelected?"CB Handle":"Ham Radio Call Sign"} to this user’s details before saving this contact.</Alert>:null}
   <Row className="g-3">
    <Col md={3}><Form.Group controlId="qso-contact-date"><Form.Label>Date</Form.Label><Form.Control type="date" name="contactDate" value={formData.contactDate} onChange={handleChange} required/></Form.Group></Col>
    <Col md={3}><Form.Group controlId="qso-contact-time"><Form.Label>Time</Form.Label><Form.Select name="contactTime" value={formData.contactTime} onChange={handleChange} required>{timeOptions.map(time=><option key={time} value={time}>{formatTime(time)}</option>)}</Form.Select></Form.Group></Col>
    <Col md={6}><Form.Group controlId="qso-call-sign"><Form.Label>{cbBandSelected?"Contact CB handle":"Contact call sign"}</Form.Label><Form.Control name="callSign" value={formData.callSign} onChange={handleChange} placeholder={cbBandSelected?"CB handle":"W1AW"} required className="text-uppercase"/></Form.Group></Col>
    <Col md={4}><Form.Group controlId="qso-operator-call-sign"><Form.Label>{operatorLabel}</Form.Label><Form.Control value={operatorIdentity} readOnly className="text-uppercase" aria-describedby="qso-operator-help"/><Form.Text id="qso-operator-help">Loaded from the logged-in user record for the selected band.</Form.Text></Form.Group></Col>
    <Col md={4}><Form.Group controlId="qso-frequency"><Form.Label>Frequency (MHz)</Form.Label><Form.Select name="frequencyMHz" value={formData.frequencyMHz} onChange={handleChange}><option value="">Unknown / not recorded</option>{!selectedFrequencyIsListed&&formData.frequencyMHz!==""?<option value={formData.frequencyMHz}>{formData.frequencyMHz} MHz (saved value)</option>:null}{bandFrequencyOptions.map(([frequency,label])=><option key={`${formData.band}-${frequency}`} value={frequency}>{Number(frequency).toFixed(4)} MHz — {label}</option>)}</Form.Select><Form.Text>Select a known frequency or CB channel for radios without a frequency counter.</Form.Text></Form.Group></Col>
    <Col md={2}><Form.Group controlId="qso-band"><Form.Label>Band</Form.Label><Form.Select name="band" value={formData.band} onChange={handleChange} required>{bands.map(band=><option key={band}>{band}</option>)}</Form.Select></Form.Group></Col>
    <Col md={2}><Form.Group controlId="qso-mode"><Form.Label>Mode</Form.Label><Form.Select name="mode" value={formData.mode} onChange={handleChange} required>{modes.map(mode=><option key={mode}>{mode}</option>)}</Form.Select></Form.Group></Col>
    <Col md={3}><Form.Group><Form.Label>RST sent</Form.Label><Form.Control name="rstSent" value={formData.rstSent} onChange={handleChange}/><Form.Text>Signal report you gave the other operator.</Form.Text></Form.Group></Col>
    <Col md={3}><Form.Group><Form.Label>RST received</Form.Label><Form.Control name="rstReceived" value={formData.rstReceived} onChange={handleChange}/><Form.Text>Signal report the other operator gave you.</Form.Text></Form.Group></Col>
    <Col md={6}><Form.Group><Form.Label>Contact name</Form.Label><Form.Control name="contactName" value={formData.contactName} onChange={handleChange}/></Form.Group></Col>
    <Col md={4}><Form.Group><Form.Label>QTH</Form.Label><Form.Control name="qth" value={formData.qth} onChange={handleChange} placeholder="City or station location"/><Form.Text>The other station’s location.</Form.Text></Form.Group></Col>
    <Col md={2}><Form.Group><Form.Label>Grid square</Form.Label><Form.Control name="gridSquare" value={formData.gridSquare} onChange={handleChange} className="text-uppercase" placeholder="FN31"/><Form.Text>Maidenhead location code, if known.</Form.Text></Form.Group></Col>
    <Col md={4}><Form.Group><Form.Label>Country</Form.Label><Form.Select name="countryRef" value={formData.countryRef} onChange={handleChange} disabled={locationsLoading}><option value="">Select country</option>{countries.map(country=><option key={country._id} value={country._id}>{country.name}</option>)}</Form.Select></Form.Group></Col>
    <Col md={2}><Form.Group><Form.Label>State / region</Form.Label><Form.Select name="stateRef" value={formData.stateRef} onChange={handleChange} disabled={locationsLoading}><option value="">Select state</option>{states.map(state=><option key={state._id} value={state._id}>{state.name}{state.abbreviation?` (${state.abbreviation})`:""}</option>)}</Form.Select></Form.Group></Col>
    <Col md={6}><Form.Group><Form.Label>QSL status</Form.Label><Form.Select name="qslStatus" value={formData.qslStatus} onChange={handleChange}><option value="not-requested">Not requested</option><option value="requested">Requested</option><option value="sent">Sent</option><option value="received">Received</option><option value="confirmed">Confirmed</option></Form.Select><Form.Text>Tracks whether the radio contact was confirmed.</Form.Text></Form.Group></Col>
    <Col xs={12}><Form.Group><Form.Label>Notes</Form.Label><Form.Control as="textarea" rows={3} name="notes" value={formData.notes} onChange={handleChange}/></Form.Group></Col>
   </Row>
   <div className="d-flex justify-content-end gap-2 mt-4">
    <Button type="button" variant="outline-secondary" onClick={onCancel} disabled={saving}>Cancel</Button>
    <Button type="submit" disabled={saving||locationsLoading||!operatorIdentity}>{saving?<><Spinner size="sm"/> {initialData?"Updating...":"Saving..."}</>:initialData?"Update QSO":"Save QSO"}</Button>
   </div>
  </Form>
 );
}
