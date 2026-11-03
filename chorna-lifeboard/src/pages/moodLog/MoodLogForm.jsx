// src/pages/moodLog/MoodLogForm.jsx
import {useEffect,useMemo,useState} from "react";
import {Alert,Button,Col,Form,Row} from "react-bootstrap";
import {Smile,Laugh,Meh,Frown,Angry,Annoyed,Zap,BatteryLow,CloudRain,Heart,Brain} from "lucide-react";

function MoodLogForm({record=null,embedded=false,onCancel,onSaved}){

 const moodOptions=[
  {value:"Energized",label:"Energized",icon:Zap,color:"#16a34a"},
  {value:"Happy",label:"Happy",icon:Laugh,color:"#22c55e"},
  {value:"Grateful",label:"Grateful",icon:Heart,color:"#65a30d"},
  {value:"Calm",label:"Calm",icon:Smile,color:"#84cc16"},
  {value:"Neutral",label:"Neutral",icon:Meh,color:"#ca8a04"},
  {value:"Tired",label:"Tired",icon:BatteryLow,color:"#d97706"},
  {value:"Sad",label:"Sad",icon:Frown,color:"#f97316"},
  {value:"Depressed",label:"Depressed",icon:CloudRain,color:"#ea580c"},
  {value:"Anxious",label:"Anxious",icon:Annoyed,color:"#dc2626"},
  {value:"Stressed",label:"Stressed",icon:Brain,color:"#b91c1c"},
  {value:"Angry",label:"Angry",icon:Angry,color:"#991b1b"}
 ];

 const normalizeId=value=>{
  if(!value)return "";
  if(typeof value==="object"&&value?.$oid)return String(value.$oid);
  if(typeof value==="object"&&value?._id)return normalizeId(value._id);
  if(typeof value==="object"&&value?.id)return normalizeId(value.id);
  return String(value).trim();
 };

 const getStoredUser=()=>{
  const keys=["userInfo","user","authUser","currentUser"];

  for(const key of keys){
   try{
    const raw=localStorage.getItem(key)||sessionStorage.getItem(key);
    if(!raw)continue;

    const parsed=JSON.parse(raw);

    if(parsed?._id||parsed?.id||parsed?.username||parsed?.email)return parsed;
    if(parsed?.user?._id||parsed?.user?.id||parsed?.user?.username||parsed?.user?.email)return parsed.user;
    if(parsed?.data?._id||parsed?.data?.id||parsed?.data?.username||parsed?.data?.email)return parsed.data;
   }catch(err){
    console.error(`Failed to parse stored user from ${key}`,err);
   }
  }

  return null;
 };

 const formatDateForInput=value=>{
  if(!value)return "";
  const date=new Date(value);

  if(Number.isNaN(date.getTime()))return "";

  return date.toISOString().slice(0,10);
 };

 const getToken=()=>{
  return localStorage.getItem("token")||sessionStorage.getItem("token")||"";
 };

 const getHeaders=()=>{
  const token=getToken();

  return {
   "Content-Type":"application/json",
   ...(token?{Authorization:`Bearer ${token}`}:{})
  };
 };

 const currentUser=getStoredUser();
 const userId=normalizeId(currentUser?._id)||normalizeId(currentUser?.id);
 const recordId=normalizeId(record?._id)||normalizeId(record?.id);

 const [form,setForm]=useState({
  user:normalizeId(record?.user)||userId,
  logDate:formatDateForInput(record?.logDate)||new Date().toISOString().slice(0,10),
  mood:record?.mood||"",
  energy:record?.energy??"",
  stress:record?.stress??"",
  notes:record?.notes||"",
  sourceType:record?.sourceType||"manual",
  journalEntry:normalizeId(record?.journalEntry),
  mindfulnessEntry:normalizeId(record?.mindfulnessEntry)
 });

 const [saving,setSaving]=useState(false);
 const [error,setError]=useState("");

 useEffect(()=>{
  setForm({
   user:normalizeId(record?.user)||userId,
   logDate:formatDateForInput(record?.logDate)||new Date().toISOString().slice(0,10),
   mood:record?.mood||"",
   energy:record?.energy??"",
   stress:record?.stress??"",
   notes:record?.notes||"",
   sourceType:record?.sourceType||"manual",
   journalEntry:normalizeId(record?.journalEntry),
   mindfulnessEntry:normalizeId(record?.mindfulnessEntry)
  });
 },[recordId,userId]);

 const selectedMood=useMemo(()=>{
  return moodOptions.find(item=>item.value.toLowerCase()===String(form.mood||"").toLowerCase())||null;
 },[form.mood]);

 const SelectedMoodIcon=selectedMood?.icon||Smile;
 const selectedMoodColor=selectedMood?.color||"#3846b8";

 const updateField=(name,value)=>{
  setForm(prev=>({...prev,[name]:value}));
 };

 const buildPayload=()=>{
  const next={
   ...form,
   user:form.user||userId
  };

  if(!next.user){
   throw new Error("User is required. Please log in again.");
  }

  if(next.energy!==""&&next.energy!==undefined&&next.energy!==null){
   next.energy=Number(next.energy);
  }

  if(next.stress!==""&&next.stress!==undefined&&next.stress!==null){
   next.stress=Number(next.stress);
  }

  if(next.energy===""||next.energy===undefined||next.energy===null||Number.isNaN(next.energy)){
   delete next.energy;
  }

  if(next.stress===""||next.stress===undefined||next.stress===null||Number.isNaN(next.stress)){
   delete next.stress;
  }

  if(!next.journalEntry)delete next.journalEntry;
  if(!next.mindfulnessEntry)delete next.mindfulnessEntry;

  return next;
 };

 const handleSubmit=async e=>{
  e.preventDefault();

  try{
   setSaving(true);
   setError("");

   const res=await fetch(recordId?`/api/mood-log/${recordId}`:"/api/mood-log",{
    method:recordId?"PUT":"POST",
    headers:getHeaders(),
    body:JSON.stringify(buildPayload())
   });

   const data=await res.json().catch(()=>({}));

   if(!res.ok)throw new Error(data.message||"Failed to save mood log");

   if(onSaved){
    onSaved(data);
    return;
   }
  }catch(err){
   setError(err.message||"Failed to save mood log");
  }finally{
   setSaving(false);
  }
 };

 return(
  <Form onSubmit={handleSubmit} className={embedded?"lifeboard-form lifeboard-form-embedded":"lifeboard-form"}>

   {error&&(
    <Alert variant="danger" dismissible onClose={()=>setError("")}>
     {error}
    </Alert>
   )}

   <input type="hidden" value={form.user} onChange={(e)=>updateField("user",e.target.value)}/>

   <Row className="g-3">
    <Col md={6}>
     <Form.Group as={Row} className="align-items-center">
      <Form.Label column sm={4}>Log Date:</Form.Label>
      <Col sm={8}>
       <Form.Control
        type="date"
        value={form.logDate}
        onChange={(e)=>updateField("logDate",e.target.value)}
        required
       />
      </Col>
     </Form.Group>
    </Col>

    <Col md={6}>
     <Form.Group as={Row} className="align-items-center">
      <Form.Label column sm={4}>Mood:</Form.Label>
      <Col sm={8}>
       <div className="d-flex align-items-center gap-2">
        <span
         className="d-inline-flex align-items-center justify-content-center rounded-circle"
         style={{
          color:selectedMoodColor,
          border:"1px solid "+selectedMoodColor,
          backgroundColor:selectedMoodColor+"18",
          width:"36px",
          height:"36px",
          flex:"0 0 36px"
         }}
        >
         <SelectedMoodIcon size={22} strokeWidth={2.4}/>
        </span>

        <Form.Select
         value={form.mood}
         onChange={(e)=>updateField("mood",e.target.value)}
         required
        >
         <option value="">Select mood</option>
         {moodOptions.map(item=>(
          <option key={item.value} value={item.value}>{item.label}</option>
         ))}
        </Form.Select>
       </div>
      </Col>
     </Form.Group>
    </Col>

    <Col md={6}>
     <Form.Group as={Row} className="align-items-center">
      <Form.Label column sm={4}>Energy:</Form.Label>
      <Col sm={8}>
       <Form.Control
        type="number"
        min="1"
        max="10"
        value={form.energy}
        onChange={(e)=>updateField("energy",e.target.value)}
       />
      </Col>
     </Form.Group>
    </Col>

    <Col md={6}>
     <Form.Group as={Row} className="align-items-center">
      <Form.Label column sm={4}>Stress:</Form.Label>
      <Col sm={8}>
       <Form.Control
        type="number"
        min="1"
        max="10"
        value={form.stress}
        onChange={(e)=>updateField("stress",e.target.value)}
       />
      </Col>
     </Form.Group>
    </Col>

    <Col md={6}>
     <Form.Group as={Row} className="align-items-center">
      <Form.Label column sm={4}>Source:</Form.Label>
      <Col sm={8}>
       <Form.Select value={form.sourceType} onChange={(e)=>updateField("sourceType",e.target.value)}>
        <option value="manual">Manual</option>
        <option value="journal">Journal</option>
        <option value="mindfulness">Mindfulness</option>
       </Form.Select>
      </Col>
     </Form.Group>
    </Col>

    <Col xs={12}>
     <div className="d-flex flex-wrap gap-2">
      {moodOptions.map(item=>{
       const Icon=item.icon;
       const isActive=form.mood===item.value;

       return(
        <button
         key={item.value}
         type="button"
         className="btn btn-sm"
         onClick={()=>updateField("mood",item.value)}
         style={{
          border:"1px solid "+item.color,
          backgroundColor:isActive?item.color:item.color+"14",
          color:isActive?"#ffffff":item.color,
          fontWeight:isActive?700:600
         }}
        >
         <span className="d-inline-flex align-items-center gap-1">
          <Icon size={16} strokeWidth={2.3}/>
          <span>{item.label}</span>
         </span>
        </button>
       );
      })}
     </div>
    </Col>

    <Col xs={12}>
     <Form.Group as={Row}>
      <Form.Label column sm={2}>Notes:</Form.Label>
      <Col sm={10}>
       <Form.Control
        as="textarea"
        rows={5}
        value={form.notes}
        onChange={(e)=>updateField("notes",e.target.value)}
       />
      </Col>
     </Form.Group>
    </Col>
   </Row>

   <div className="lifeboard-form-actions mt-4">
    {onCancel&&(
     <Button type="button" variant="secondary" onClick={onCancel} disabled={saving}>
      Cancel
     </Button>
    )}

    <Button type="submit" variant="primary" disabled={saving}>
     {saving?"Saving...":recordId?"Update Mood Log":"Save Mood Log"}
    </Button>
   </div>

  </Form>
 );
}

export default MoodLogForm;