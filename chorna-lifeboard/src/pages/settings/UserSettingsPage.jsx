// src/pages/settings/UserSettingsPage.jsx
import {useEffect,useState} from "react";
import {Alert,Button,Form} from "react-bootstrap";
import "../../styles/LifeboardPage.css";

function UserSettingsPage({user}){

 const getDefaultSettings=()=>({
  dashboard:{
   defaultView:"daily",
   showPrivateJournalCount:false,
   showMoodSummary:true,
   showHabitProgress:true,
   showUpcomingReminders:true,
   showTimelinePreview:true
  },
  journal:{
   defaultJournalType:"daily",
   defaultPrivate:false,
   showPromptsByDefault:true,
   requireMood:false,
   requireEnergy:false
  },
  mindfulness:{
   showPromptsByDefault:true,
   requireMood:false,
   requireEnergy:false,
   requireStress:false
  },
  reminders:{
   defaultChannels:{
    email:false,
    sms:false,
    inApp:true
   },
   defaultOffsetMinutes:30,
   allowRecurring:true
  },
  calendar:{
   weekStartsOn:"sunday",
   defaultEventView:"month",
   showCompletedEvents:true,
   slotMinutes:30,
   dayStartHour:0,
   dayEndHour:24
  },
  privacy:{
   privateJournalLocked:true,
   hidePrivateEntriesFromTimeline:true,
   hidePrivateEntriesFromDashboard:true
  },
  appearance:{
   theme:"system",
   accentColor:"",
   compactMode:false
  },
  timezone:"America/New_York",
  locale:"en-US"
 });

 const [settings,setSettings]=useState(()=>getDefaultSettings());
 const [loading,setLoading]=useState(true);
 const [saving,setSaving]=useState(false);
 const [error,setError]=useState("");
 const [alert,setAlert]=useState(null);

 const showAlert=(variant,message)=>{
  setAlert({
   variant,
   message
  });
 };

 useEffect(()=>{
  if(!alert)return;

  const timer=setTimeout(()=>{
   setAlert(null);
  },5000);

  return()=>{
   clearTimeout(timer);
  };
 },[alert]);

 const getToken=()=>{
  return localStorage.getItem("token")||sessionStorage.getItem("token")||"";
 };

 const normalizeId=value=>{
  if(!value)return "";
  if(typeof value==="object"&&value?.$oid)return String(value.$oid);
  if(typeof value==="object"&&value?._id)return normalizeId(value._id);
  if(typeof value==="object"&&value?.id)return normalizeId(value.id);
  return String(value).trim();
 };

 const normalizeCalendarHour=(value,fallback,min,max)=>{
  const numberValue=Number(value);

  if(Number.isNaN(numberValue))return fallback;
  if(numberValue<min)return min;
  if(numberValue>max)return max;

  return numberValue;
 };

 const normalizeCalendarSettings=calendar=>{
  const defaults=getDefaultSettings().calendar;
  const incoming=calendar||{};
  const dayStartHour=normalizeCalendarHour(incoming.dayStartHour,defaults.dayStartHour,0,23);
  const rawEndHour=incoming.dayEndHour;
  const dayEndHour=rawEndHour===0||rawEndHour==="0"?24:normalizeCalendarHour(rawEndHour,defaults.dayEndHour,1,24);

  return {
   ...defaults,
   ...incoming,
   weekStartsOn:incoming.weekStartsOn||defaults.weekStartsOn,
   slotMinutes:[5,10,15,20,30,60].includes(Number(incoming.slotMinutes))?Number(incoming.slotMinutes):defaults.slotMinutes,
   dayStartHour,
   dayEndHour
  };
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

 const getCurrentUser=()=>{
  return user||getStoredUser();
 };

 const getUserQueryValue=()=>{
  const currentUser=getCurrentUser();

  const userId=normalizeId(currentUser?._id)||normalizeId(currentUser?.id);
  if(userId)return userId;

  if(currentUser?.username)return currentUser.username;
  if(currentUser?.email)return currentUser.email;

  return "";
 };

 const getUserPayload=()=>{
  const currentUser=getCurrentUser();

  return{
   user:normalizeId(currentUser?._id)||normalizeId(currentUser?.id)||undefined,
   username:currentUser?.username||undefined,
   email:currentUser?.email||undefined
  };
 };

 const mergeSettings=data=>{
  const incoming=data.userSetting||data.settings||data.data||{};
  const defaults=getDefaultSettings();

  return {
   ...defaults,
   ...incoming,
   dashboard:{
    ...defaults.dashboard,
    ...(incoming.dashboard||{})
   },
   journal:{
    ...defaults.journal,
    ...(incoming.journal||{})
   },
   mindfulness:{
    ...defaults.mindfulness,
    ...(incoming.mindfulness||{})
   },
   reminders:{
    ...defaults.reminders,
    ...(incoming.reminders||{}),
    defaultChannels:{
     ...defaults.reminders.defaultChannels,
     ...(incoming.reminders?.defaultChannels||{})
    }
   },
   calendar:normalizeCalendarSettings(incoming.calendar),
   privacy:{
    ...defaults.privacy,
    ...(incoming.privacy||{})
   },
   appearance:{
    ...defaults.appearance,
    ...(incoming.appearance||{})
   }
  };
 };

 useEffect(()=>{
  let ignore=false;

  const loadSettings=async()=>{
   try{
    setLoading(true);
    setError("");
    setAlert(null);

    const userQueryValue=getUserQueryValue();

    if(!userQueryValue){
     setSettings(getDefaultSettings());
     return;
    }

    const token=getToken();
    const res=await fetch(`/api/user-settings?user=${encodeURIComponent(userQueryValue)}`,{
     headers:{
      "Content-Type":"application/json",
      ...(token?{Authorization:`Bearer ${token}`}:{})
     }
    });

    const data=await res.json().catch(()=>({}));

    if(!res.ok)throw new Error(data.message||"Failed to load settings");

    if(!ignore){
     setSettings(mergeSettings(data));
     setError("");
    }
   }catch(err){
    if(!ignore){
     setError(err.message);
     showAlert("danger",err.message);
    }
   }finally{
    if(!ignore)setLoading(false);
   }
  };

  loadSettings();

  return()=>{
   ignore=true;
  };
 },[user?._id,user?.id,user?.username,user?.email]);

 const updateNested=(section,field,value)=>{
  setSettings(prev=>({
   ...prev,
   [section]:{
    ...(prev?.[section]||{}),
    [field]:value
   }
  }));
 };

 const updateReminderChannel=(field,value)=>{
  setSettings(prev=>({
   ...prev,
   reminders:{
    ...(prev?.reminders||{}),
    defaultChannels:{
     ...(prev?.reminders?.defaultChannels||{}),
     [field]:value
    }
   }
  }));
 };

 const saveSettings=async()=>{
  try{
   setSaving(true);
   setError("");
   setAlert(null);

   const userQueryValue=getUserQueryValue();

   if(!userQueryValue){
    throw new Error("You must be logged in to update user settings.");
   }

   const token=getToken();
   const normalizedSettings={
    ...settings,
    calendar:normalizeCalendarSettings(settings?.calendar)
   };

   const res=await fetch("/api/user-settings",{
    method:"PUT",
    headers:{
     "Content-Type":"application/json",
     ...(token?{Authorization:`Bearer ${token}`}:{})
    },
    body:JSON.stringify({
     ...normalizedSettings,
     ...getUserPayload()
    })
   });

   const data=await res.json().catch(()=>({}));

   if(!res.ok)throw new Error(data.message||"Failed to save settings");

   setSettings(mergeSettings(data.userSetting||data.settings||data.data?data:{data:normalizedSettings}));
   showAlert("success","Settings saved successfully.");
  }catch(err){
   setError(err.message);
   showAlert("danger",err.message);
  }finally{
   setSaving(false);
  }
 };

 if(loading){
  return(
   <section className="lifeboard-page">
    <div className="lifeboard-page-empty">Loading settings...</div>
   </section>
  );
 }

 if(!getUserQueryValue()){
  return(
   <section className="lifeboard-page">
    <header className="lifeboard-page-header">
     <div>
      <p className="lifeboard-page-eyebrow">Settings</p>
      <h1 className="lifeboard-page-title">User Settings</h1>
      <p className="lifeboard-page-text">You must be logged in to view or update user settings.</p>
     </div>
    </header>

    <Alert variant="warning">
     Please log in to manage your settings.
    </Alert>
   </section>
  );
 }

 return(
  <section className="lifeboard-page">

   <header className="lifeboard-page-header">
    <div>
     <p className="lifeboard-page-eyebrow">Settings</p>
     <h1 className="lifeboard-page-title">User Settings</h1>
     <p className="lifeboard-page-text">Control dashboard display, journal defaults, mindfulness defaults, reminders, calendar preferences, privacy, and appearance.</p>
    </div>

    <Button type="button" onClick={saveSettings} className="lifeboard-page-action" disabled={saving}>
     {saving?"Saving...":"Save Settings"}
    </Button>
   </header>

   {alert&&(
    <Alert variant={alert.variant} dismissible onClose={()=>setAlert(null)}>
     {alert.message}
    </Alert>
   )}

   {!alert&&error&&(
    <Alert variant="danger" dismissible onClose={()=>setError("")}>
     {error}
    </Alert>
   )}

   <section className="lifeboard-page-card lifeboard-form">

    <div className="lifeboard-form-grid">
     <label className="lifeboard-form-field">
      <span>Default Dashboard View</span>
      <Form.Select className="lifeboard-page-search" value={settings?.dashboard?.defaultView||"daily"} onChange={(e)=>updateNested("dashboard","defaultView",e.target.value)}>
       <option value="daily">Daily</option>
       <option value="weekly">Weekly</option>
       <option value="monthly">Monthly</option>
       <option value="yearly">Yearly</option>
      </Form.Select>
     </label>

     <label className="lifeboard-form-field">
      <span>Default Calendar View</span>
      <Form.Select className="lifeboard-page-search" value={settings?.calendar?.defaultEventView||"month"} onChange={(e)=>updateNested("calendar","defaultEventView",e.target.value)}>
       <option value="day">Day</option>
       <option value="week">Week</option>
       <option value="month">Month</option>
       <option value="agenda">Agenda</option>
      </Form.Select>
     </label>

     <label className="lifeboard-form-field">
      <span>Week Starts On</span>
      <Form.Select className="lifeboard-page-search" value={settings?.calendar?.weekStartsOn||"sunday"} onChange={(e)=>updateNested("calendar","weekStartsOn",e.target.value)}>
       <option value="sunday">Sunday</option>
       <option value="monday">Monday</option>
       <option value="tuesday">Tuesday</option>
       <option value="wednesday">Wednesday</option>
       <option value="thursday">Thursday</option>
       <option value="friday">Friday</option>
       <option value="saturday">Saturday</option>
      </Form.Select>
     </label>

     <label className="lifeboard-form-field">
      <span>Calendar Time Blocks</span>
      <Form.Select className="lifeboard-page-search" value={settings?.calendar?.slotMinutes||30} onChange={(e)=>updateNested("calendar","slotMinutes",Number(e.target.value))}>
       <option value={5}>5 minutes</option>
       <option value={10}>10 minutes</option>
       <option value={15}>15 minutes</option>
       <option value={20}>20 minutes</option>
       <option value={30}>30 minutes</option>
       <option value={60}>1 hour</option>
      </Form.Select>
     </label>

     <label className="lifeboard-form-field">
      <span>Calendar Start Hour</span>
      <Form.Select className="lifeboard-page-search" value={settings?.calendar?.dayStartHour??0} onChange={(e)=>updateNested("calendar","dayStartHour",Number(e.target.value))}>
       <option value={0}>12:00 AM</option>
       <option value={1}>1:00 AM</option>
       <option value={2}>2:00 AM</option>
       <option value={3}>3:00 AM</option>
       <option value={4}>4:00 AM</option>
       <option value={5}>5:00 AM</option>
       <option value={6}>6:00 AM</option>
       <option value={7}>7:00 AM</option>
       <option value={8}>8:00 AM</option>
       <option value={9}>9:00 AM</option>
       <option value={10}>10:00 AM</option>
       <option value={11}>11:00 AM</option>
       <option value={12}>12:00 PM</option>
       <option value={13}>1:00 PM</option>
       <option value={14}>2:00 PM</option>
       <option value={15}>3:00 PM</option>
       <option value={16}>4:00 PM</option>
       <option value={17}>5:00 PM</option>
       <option value={18}>6:00 PM</option>
       <option value={19}>7:00 PM</option>
       <option value={20}>8:00 PM</option>
       <option value={21}>9:00 PM</option>
       <option value={22}>10:00 PM</option>
       <option value={23}>11:00 PM</option>
      </Form.Select>
     </label>

     <label className="lifeboard-form-field">
      <span>Calendar End Hour</span>
      <Form.Select className="lifeboard-page-search" value={settings?.calendar?.dayEndHour===0?24:settings?.calendar?.dayEndHour??24} onChange={(e)=>updateNested("calendar","dayEndHour",Number(e.target.value))}>
       <option value={1}>1:00 AM</option>
       <option value={2}>2:00 AM</option>
       <option value={3}>3:00 AM</option>
       <option value={4}>4:00 AM</option>
       <option value={5}>5:00 AM</option>
       <option value={6}>6:00 AM</option>
       <option value={7}>7:00 AM</option>
       <option value={8}>8:00 AM</option>
       <option value={9}>9:00 AM</option>
       <option value={10}>10:00 AM</option>
       <option value={11}>11:00 AM</option>
       <option value={12}>12:00 PM</option>
       <option value={13}>1:00 PM</option>
       <option value={14}>2:00 PM</option>
       <option value={15}>3:00 PM</option>
       <option value={16}>4:00 PM</option>
       <option value={17}>5:00 PM</option>
       <option value={18}>6:00 PM</option>
       <option value={19}>7:00 PM</option>
       <option value={20}>8:00 PM</option>
       <option value={21}>9:00 PM</option>
       <option value={22}>10:00 PM</option>
       <option value={23}>11:00 PM</option>
       <option value={24}>12:00 AM — End of day</option>
      </Form.Select>
     </label>

     <label className="lifeboard-form-field">
      <span>Timezone</span>
      <Form.Control className="lifeboard-page-search" value={settings?.timezone||"America/New_York"} onChange={(e)=>setSettings(prev=>({...prev,timezone:e.target.value}))}/>
     </label>

     <label className="lifeboard-form-field">
      <span>Locale</span>
      <Form.Control className="lifeboard-page-search" value={settings?.locale||"en-US"} onChange={(e)=>setSettings(prev=>({...prev,locale:e.target.value}))}/>
     </label>

     <label className="lifeboard-form-field">
      <span>Default Journal Type</span>
      <Form.Select className="lifeboard-page-search" value={settings?.journal?.defaultJournalType||"daily"} onChange={(e)=>updateNested("journal","defaultJournalType",e.target.value)}>
       <option value="daily">Daily</option>
       <option value="private">Private</option>
       <option value="reflection">Reflection</option>
       <option value="gratitude">Gratitude</option>
       <option value="memory">Memory</option>
       <option value="dream">Dream</option>
       <option value="free-write">Free Write</option>
      </Form.Select>
     </label>

     <label className="lifeboard-form-field">
      <span>Reminder Offset</span>
      <Form.Control className="lifeboard-page-search" type="number" min="0" value={settings?.reminders?.defaultOffsetMinutes??30} onChange={(e)=>updateNested("reminders","defaultOffsetMinutes",Number(e.target.value))}/>
     </label>

     <div className="lifeboard-form-field lifeboard-form-field-full">
      <Form.Check type="checkbox" label="Show completed events on calendar" checked={!!settings?.calendar?.showCompletedEvents} onChange={(e)=>updateNested("calendar","showCompletedEvents",e.target.checked)}/>
     </div>

     <div className="lifeboard-form-field lifeboard-form-field-full">
      <Form.Check type="checkbox" label="Show private journal count on dashboard" checked={!!settings?.dashboard?.showPrivateJournalCount} onChange={(e)=>updateNested("dashboard","showPrivateJournalCount",e.target.checked)}/>
     </div>

     <div className="lifeboard-form-field lifeboard-form-field-full">
      <Form.Check type="checkbox" label="Show mood summary" checked={!!settings?.dashboard?.showMoodSummary} onChange={(e)=>updateNested("dashboard","showMoodSummary",e.target.checked)}/>
     </div>

     <div className="lifeboard-form-field lifeboard-form-field-full">
      <Form.Check type="checkbox" label="Show habit progress" checked={!!settings?.dashboard?.showHabitProgress} onChange={(e)=>updateNested("dashboard","showHabitProgress",e.target.checked)}/>
     </div>

     <div className="lifeboard-form-field lifeboard-form-field-full">
      <Form.Check type="checkbox" label="Show upcoming reminders" checked={!!settings?.dashboard?.showUpcomingReminders} onChange={(e)=>updateNested("dashboard","showUpcomingReminders",e.target.checked)}/>
     </div>

     <div className="lifeboard-form-field lifeboard-form-field-full">
      <Form.Check type="checkbox" label="Show timeline preview" checked={!!settings?.dashboard?.showTimelinePreview} onChange={(e)=>updateNested("dashboard","showTimelinePreview",e.target.checked)}/>
     </div>

     <div className="lifeboard-form-field lifeboard-form-field-full">
      <Form.Check type="checkbox" label="New journals are private by default" checked={!!settings?.journal?.defaultPrivate} onChange={(e)=>updateNested("journal","defaultPrivate",e.target.checked)}/>
     </div>

     <div className="lifeboard-form-field lifeboard-form-field-full">
      <Form.Check type="checkbox" label="Show journal prompts by default" checked={!!settings?.journal?.showPromptsByDefault} onChange={(e)=>updateNested("journal","showPromptsByDefault",e.target.checked)}/>
     </div>

     <div className="lifeboard-form-field lifeboard-form-field-full">
      <Form.Check type="checkbox" label="Require mood for journal entries" checked={!!settings?.journal?.requireMood} onChange={(e)=>updateNested("journal","requireMood",e.target.checked)}/>
     </div>

     <div className="lifeboard-form-field lifeboard-form-field-full">
      <Form.Check type="checkbox" label="Require energy for journal entries" checked={!!settings?.journal?.requireEnergy} onChange={(e)=>updateNested("journal","requireEnergy",e.target.checked)}/>
     </div>

     <div className="lifeboard-form-field lifeboard-form-field-full">
      <Form.Check type="checkbox" label="Show mindfulness prompts by default" checked={!!settings?.mindfulness?.showPromptsByDefault} onChange={(e)=>updateNested("mindfulness","showPromptsByDefault",e.target.checked)}/>
     </div>

     <div className="lifeboard-form-field lifeboard-form-field-full">
      <Form.Check type="checkbox" label="Require mood for mindfulness" checked={!!settings?.mindfulness?.requireMood} onChange={(e)=>updateNested("mindfulness","requireMood",e.target.checked)}/>
     </div>

     <div className="lifeboard-form-field lifeboard-form-field-full">
      <Form.Check type="checkbox" label="Require energy for mindfulness" checked={!!settings?.mindfulness?.requireEnergy} onChange={(e)=>updateNested("mindfulness","requireEnergy",e.target.checked)}/>
     </div>

     <div className="lifeboard-form-field lifeboard-form-field-full">
      <Form.Check type="checkbox" label="Require stress for mindfulness" checked={!!settings?.mindfulness?.requireStress} onChange={(e)=>updateNested("mindfulness","requireStress",e.target.checked)}/>
     </div>

     <div className="lifeboard-form-field lifeboard-form-field-full">
      <Form.Check type="checkbox" label="Reminders default to email" checked={!!settings?.reminders?.defaultChannels?.email} onChange={(e)=>updateReminderChannel("email",e.target.checked)}/>
     </div>

     <div className="lifeboard-form-field lifeboard-form-field-full">
      <Form.Check type="checkbox" label="Reminders default to SMS" checked={!!settings?.reminders?.defaultChannels?.sms} onChange={(e)=>updateReminderChannel("sms",e.target.checked)}/>
     </div>

     <div className="lifeboard-form-field lifeboard-form-field-full">
      <Form.Check type="checkbox" label="Reminders default to in-app" checked={!!settings?.reminders?.defaultChannels?.inApp} onChange={(e)=>updateReminderChannel("inApp",e.target.checked)}/>
     </div>

     <div className="lifeboard-form-field lifeboard-form-field-full">
      <Form.Check type="checkbox" label="Allow recurring reminders" checked={!!settings?.reminders?.allowRecurring} onChange={(e)=>updateNested("reminders","allowRecurring",e.target.checked)}/>
     </div>

     <div className="lifeboard-form-field lifeboard-form-field-full">
      <Form.Check type="checkbox" label="Lock private journal" checked={!!settings?.privacy?.privateJournalLocked} onChange={(e)=>updateNested("privacy","privateJournalLocked",e.target.checked)}/>
     </div>

     <div className="lifeboard-form-field lifeboard-form-field-full">
      <Form.Check type="checkbox" label="Hide private entries from dashboard" checked={!!settings?.privacy?.hidePrivateEntriesFromDashboard} onChange={(e)=>updateNested("privacy","hidePrivateEntriesFromDashboard",e.target.checked)}/>
     </div>

     <div className="lifeboard-form-field lifeboard-form-field-full">
      <Form.Check type="checkbox" label="Hide private entries from timeline" checked={!!settings?.privacy?.hidePrivateEntriesFromTimeline} onChange={(e)=>updateNested("privacy","hidePrivateEntriesFromTimeline",e.target.checked)}/>
     </div>

     <label className="lifeboard-form-field">
      <span>Theme</span>
      <Form.Select className="lifeboard-page-search" value={settings?.appearance?.theme||"system"} onChange={(e)=>updateNested("appearance","theme",e.target.value)}>
       <option value="system">System</option>
       <option value="light">Light</option>
       <option value="dark">Dark</option>
      </Form.Select>
     </label>

     <label className="lifeboard-form-field">
      <span>Accent Color</span>
      <Form.Control className="lifeboard-page-search" value={settings?.appearance?.accentColor||""} onChange={(e)=>updateNested("appearance","accentColor",e.target.value)} placeholder="#3846B8"/>
     </label>

     <div className="lifeboard-form-field lifeboard-form-field-full">
      <Form.Check type="checkbox" label="Compact mode" checked={!!settings?.appearance?.compactMode} onChange={(e)=>updateNested("appearance","compactMode",e.target.checked)}/>
     </div>
    </div>

   </section>

  </section>
 );
}

export default UserSettingsPage;