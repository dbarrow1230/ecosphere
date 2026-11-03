// E:\React-Projects\bible-study\src\pages\forms\StudyTaskForm.js
import {useState} from "react";
import {Form,Row,Col,Button,Card} from "react-bootstrap";

export default function StudyTaskForm({
 initialData={},
 studies=[],
 priorities=[],
 statuses=[],
 onSubmit,
 loading=false,
 mode="add"
}){
 const isEdit=mode==="edit"||!!initialData?._id;

 const initialDue=getDateTimeParts(initialData.dueDate);
 const initialReminder=getDateTimeParts(initialData.reminderAt);
 const initialCompleted=getDateTimeParts(initialData.completedAt);

 const [formData,setFormData]=useState({
  study:initialData.study?._id||initialData.study||"",
  title:initialData.title||"",
  description:initialData.description||"",
  context:initialData.context||"",
  dueLabel:initialData.dueLabel||"",
  dueDateDate:initialDue.date,
  dueDateTime:initialDue.time,
  priority:initialData.priority?._id||initialData.priority||"",
  status:initialData.status?._id||initialData.status||"",
  completed:initialData.completed||false,
  completedAtDate:initialCompleted.date,
  completedAtTime:initialCompleted.time,
  reminderAtDate:initialReminder.date,
  reminderAtTime:initialReminder.time,
  tags:Array.isArray(initialData.tags)?initialData.tags.join(", "):""
 });

 const timeOptions=getTimeOptions();

 const handleChange=e=>{
  const {name,value,type,checked}=e.target;

  if(name==="completed"){
   if(checked){
    const now=getNowDateTimeParts();
    setFormData(prev=>({
     ...prev,
     completed:true,
     completedAtDate:now.date,
     completedAtTime:now.time
    }));
    return;
   }

   setFormData(prev=>({
    ...prev,
    completed:false,
    completedAtDate:"",
    completedAtTime:""
   }));
   return;
  }

  setFormData(prev=>({
   ...prev,
   [name]:type==="checkbox"?checked:value
  }));
 };

 const handleSubmit=e=>{
  e.preventDefault();
  const payload={
   study:formData.study||null,
   title:formData.title.trim(),
   description:formData.description.trim(),
   context:formData.context.trim(),
   dueLabel:formData.dueLabel.trim(),
   dueDate:combineDateTime(formData.dueDateDate,formData.dueDateTime),
   priority:formData.priority||null,
   status:formData.status||null,
   completed:formData.completed,
   completedAt:formData.completed?combineDateTime(formData.completedAtDate,formData.completedAtTime):null,
   reminderAt:combineDateTime(formData.reminderAtDate,formData.reminderAtTime),
   tags:formData.tags.split(",").map(tag=>tag.trim()).filter(Boolean)
  };
  if(onSubmit)onSubmit(payload);
 };

 return (
  <Card className="shadow-sm">
   <Card.Body>
    <Form onSubmit={handleSubmit}>
     <Row>
      <Col md={6}>
       <Form.Group className="mb-3">
        <Form.Label>Study</Form.Label>
        <Form.Select name="study" value={formData.study} onChange={handleChange}>
         <option value="">No Study</option>
         {studies.map(item=>(
          <option key={item._id} value={item._id}>{item.title||item.name}</option>
         ))}
        </Form.Select>
       </Form.Group>
      </Col>

      <Col md={6}>
       <Form.Group className="mb-3">
        <Form.Label>Title</Form.Label>
        <Form.Control type="text" name="title" value={formData.title} onChange={handleChange} required />
       </Form.Group>
      </Col>

      <Col md={6}>
       <Form.Group className="mb-3">
        <Form.Label>Due Label</Form.Label>
        <Form.Control type="text" name="dueLabel" value={formData.dueLabel} onChange={handleChange} />
       </Form.Group>
      </Col>

      <Col md={3}>
       <Form.Group className="mb-3">
        <Form.Label>Due Date</Form.Label>
        <Form.Control type="date" name="dueDateDate" value={formData.dueDateDate} onChange={handleChange} />
       </Form.Group>
      </Col>

      <Col md={3}>
       <Form.Group className="mb-3">
        <Form.Label>Due Time</Form.Label>
        <Form.Select name="dueDateTime" value={formData.dueDateTime} onChange={handleChange}>
         <option value="">Select Time</option>
         {timeOptions.map(item=>(
          <option key={item.value} value={item.value}>{item.label}</option>
         ))}
        </Form.Select>
       </Form.Group>
      </Col>

      <Col md={6}>
       <Form.Group className="mb-3">
        <Form.Label>Priority</Form.Label>
        <Form.Select name="priority" value={formData.priority} onChange={handleChange}>
         <option value="">Select Priority</option>
         {priorities.map(item=>(
          <option key={item._id} value={item._id}>{item.name||item.title}</option>
         ))}
        </Form.Select>
       </Form.Group>
      </Col>

      <Col md={6}>
       <Form.Group className="mb-3">
        <Form.Label>Status</Form.Label>
        <Form.Select name="status" value={formData.status} onChange={handleChange}>
         <option value="">Select Status</option>
         {statuses.map(item=>(
          <option key={item._id} value={item._id}>{item.name||item.title}</option>
         ))}
        </Form.Select>
       </Form.Group>
      </Col>

      <Col md={12}>
       <Form.Group className="mb-3">
        <Form.Label>Description</Form.Label>
        <Form.Control as="textarea" rows={3} name="description" value={formData.description} onChange={handleChange} />
       </Form.Group>
      </Col>

      <Col md={12}>
       <Form.Group className="mb-3">
        <Form.Label>Context</Form.Label>
        <Form.Control as="textarea" rows={3} name="context" value={formData.context} onChange={handleChange} />
       </Form.Group>
      </Col>

      <Col md={3}>
       <Form.Group className="mb-3">
        <Form.Label>Reminder Date</Form.Label>
        <Form.Control type="date" name="reminderAtDate" value={formData.reminderAtDate} onChange={handleChange} />
       </Form.Group>
      </Col>

      <Col md={3}>
       <Form.Group className="mb-3">
        <Form.Label>Reminder Time</Form.Label>
        <Form.Select name="reminderAtTime" value={formData.reminderAtTime} onChange={handleChange}>
         <option value="">Select Time</option>
         {timeOptions.map(item=>(
          <option key={item.value} value={item.value}>{item.label}</option>
         ))}
        </Form.Select>
       </Form.Group>
      </Col>

      <Col md={6}>
       <Form.Group className="mb-3">
        <Form.Label>Tags</Form.Label>
        <Form.Control type="text" name="tags" value={formData.tags} onChange={handleChange} placeholder="exam, reading, notes" />
       </Form.Group>
      </Col>

      <Col md={3}>
       <Form.Group className="mb-3">
        <Form.Label>&nbsp;</Form.Label>
        <Form.Check type="checkbox" name="completed" label="Completed" checked={formData.completed} onChange={handleChange} />
       </Form.Group>
      </Col>

      <Col md={4}>
       <Form.Group className="mb-3">
        <Form.Label>Completed Date</Form.Label>
        <Form.Control type="date" name="completedAtDate" value={formData.completedAtDate} onChange={handleChange} disabled={!formData.completed} />
       </Form.Group>
      </Col>

      <Col md={5}>
       <Form.Group className="mb-3">
        <Form.Label>Completed Time</Form.Label>
        <Form.Select name="completedAtTime" value={formData.completedAtTime} onChange={handleChange} disabled={!formData.completed}>
         <option value="">Select Time</option>
         {timeOptions.map(item=>(
          <option key={item.value} value={item.value}>{item.label}</option>
         ))}
        </Form.Select>
       </Form.Group>
      </Col>

      <Col md={12} className="d-flex gap-2">
       <Button type="submit" disabled={loading}>{loading?isEdit?"Updating...":"Saving...":isEdit?"Update Task":"Add Task"}</Button>
      </Col>
     </Row>
    </Form>
   </Card.Body>
  </Card>
 );
}

function getDateTimeParts(value){
 if(!value)return {date:"",time:""};
 const date=new Date(value);
 if(Number.isNaN(date.getTime()))return {date:"",time:""};
 const offset=date.getTimezoneOffset();
 const localDate=new Date(date.getTime()-offset*60000);
 const iso=localDate.toISOString();
 return {
  date:iso.slice(0,10),
  time:roundTimeToStep(iso.slice(11,16))
 };
}

function getNowDateTimeParts(){
 const now=new Date();
 const offset=now.getTimezoneOffset();
 const localDate=new Date(now.getTime()-offset*60000);
 const iso=localDate.toISOString();
 return {
  date:iso.slice(0,10),
  time:roundTimeToStep(iso.slice(11,16))
 };
}

function combineDateTime(date,time){
 if(!date)return null;
 return new Date(`${date}T${time||"00:00"}`);
}

function getTimeOptions(){
 const options=[];
 for(let hour=0;hour<24;hour++){
  for(let minute=0;minute<60;minute+=15){
   const value=`${String(hour).padStart(2,"0")}:${String(minute).padStart(2,"0")}`;
   options.push({value,label:formatTimeLabel(hour,minute)});
  }
 }
 return options;
}

function formatTimeLabel(hour,minute){
 const suffix=hour>=12?"PM":"AM";
 const displayHour=hour%12===0?12:hour%12;
 return `${displayHour}:${String(minute).padStart(2,"0")} ${suffix}`;
}

function roundTimeToStep(time){
 if(!time)return "";
 const [hours,minutes]=time.split(":").map(Number);
 const totalMinutes=(hours*60)+minutes;
 const rounded=Math.round(totalMinutes/15)*15;
 const normalized=rounded>=1440?1435:rounded;
 const hh=String(Math.floor(normalized/60)).padStart(2,"0");
 const mm=String(normalized%60).padStart(2,"0");
 return `${hh}:${mm}`;
}