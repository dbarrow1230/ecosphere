//src/pages/forms/admin/occasionForm.jsx
import {useEffect,useState} from "react";
import {Form,Row,Col,Button,Card} from "react-bootstrap";
import {hourlyTimeOptions} from "../../../utils/timeOptions.js";

const defaultFormData={
 business_id:"",
 seasonRef:"",
 name:"",
 code:"",
 startDate:"",
 startTime:"",
 endDate:"",
 endTime:"",
 isRecurringAnnual:false,
 isActive:true,
 notes:""
};

const getObjectId=value=>{
 if(!value)return "";
 if(typeof value==="string")return value;
 if(typeof value==="object")return String(value?._id||value?.id||value?.value||"");
 return "";
};

const getOptionValue=item=>{
 return String(item?._id||item?.id||item?.value||"");
};

const getOptionLabel=item=>{
 return item?.name||item?.title||item?.code||item?.legalName||item?.value||"";
};

const normalizeOptions=items=>{
 return Array.isArray(items)?items.filter(item=>getOptionValue(item)&&getOptionLabel(item)):[];
};

const splitDateTime=value=>{
 if(!value)return {date:"",time:""};
 const date=new Date(value);
 if(Number.isNaN(date.getTime()))return {date:"",time:""};
 const year=date.getFullYear();
 const month=String(date.getMonth()+1).padStart(2,"0");
 const day=String(date.getDate()).padStart(2,"0");
 const hours=String(date.getHours()).padStart(2,"0");
 const minutes=String(date.getMinutes()).padStart(2,"0");
 return {date:`${year}-${month}-${day}`,time:`${hours}:${minutes}`};
};

const combineDateTime=(date,time)=>{
 if(!date)return null;
 return new Date(`${date}T${time||"00:00"}`).toISOString();
};

const InlineField=({label,children,labelMd=3,inputMd=9,className=""})=>(
 <Form.Group as={Row} className={`align-items-center mb-3 ${className}`}>
  <Form.Label column md={labelMd} className="fw-semibold mb-0">{label}</Form.Label>
  <Col md={inputMd}>
   {children}
  </Col>
 </Form.Group>
);

export default function OccasionForm({
 initialData={},
 onSubmit,
 loading=false,
 businesses=[],
 seasons=[]
}){
 const [formData,setFormData]=useState(defaultFormData);

 const businessOptions=normalizeOptions(businesses);
 const seasonOptions=normalizeOptions(seasons);

 useEffect(()=>{
  const startParts=splitDateTime(initialData?.startDate);
  const endParts=splitDateTime(initialData?.endDate);
  const nextData={
   ...defaultFormData,
   ...initialData,
   business_id:getObjectId(initialData?.business_id),
   seasonRef:getObjectId(initialData?.seasonRef),
   startDate:startParts.date,
   startTime:startParts.time,
   endDate:endParts.date,
   endTime:endParts.time
  };
  // eslint-disable-next-line react-hooks/set-state-in-effect
  setFormData(nextData);
 },[initialData]);

 const handleChange=e=>{
  const {name,type,value,checked}=e.target;
  setFormData(prev=>({
   ...prev,
   [name]:type==="checkbox"?checked:value
  }));
 };

 const handleSubmit=e=>{
  e.preventDefault();
  const {startTime,endTime,...rest}=formData;
  const payload={
   ...rest,
   business_id:getObjectId(formData.business_id)||null,
   seasonRef:getObjectId(formData.seasonRef)||null,
   startDate:combineDateTime(formData.startDate,startTime),
   endDate:combineDateTime(formData.endDate,endTime)
  };
  onSubmit&&onSubmit(payload);
 };

 return(
  <Form onSubmit={handleSubmit}>
   <Card className="border-0 shadow-sm">
    <Card.Body>
     <Row>
      <Col md={12}>
       <InlineField label="Business" labelMd={2} inputMd={10}>
        <Form.Select
         name="business_id"
         value={formData.business_id}
         onChange={handleChange}
         required
        >
         <option value="">Select Business</option>
         {businessOptions.map(item=>(
          <option key={getOptionValue(item)} value={getOptionValue(item)}>
           {getOptionLabel(item)}
          </option>
         ))}
        </Form.Select>
       </InlineField>
      </Col>

      <Col md={12}>
       <InlineField label="Season" labelMd={2} inputMd={10}>
        <Form.Select
         name="seasonRef"
         value={formData.seasonRef}
         onChange={handleChange}
        >
         <option value="">General / No Season</option>
         {seasonOptions.map(item=>(
          <option key={getOptionValue(item)} value={getOptionValue(item)}>
           {getOptionLabel(item)}
          </option>
         ))}
        </Form.Select>
       </InlineField>
      </Col>

      <Col md={8}>
       <InlineField label="Name">
        <Form.Control
         type="text"
         name="name"
         value={formData.name}
         onChange={handleChange}
         required
        />
       </InlineField>
      </Col>

      <Col md={4}>
       <InlineField label="Code" labelMd={4} inputMd={8}>
        <Form.Control
         type="text"
         name="code"
         value={formData.code}
         onChange={handleChange}
        />
       </InlineField>
      </Col>

      <Col md={6}>
       <InlineField label="Start Date" labelMd={4} inputMd={8}>
        <Form.Control
         type="date"
         name="startDate"
         value={formData.startDate}
         onChange={handleChange}
         required
        />
       </InlineField>
      </Col>

      <Col md={6}>
       <InlineField label="Start Time" labelMd={4} inputMd={8}>
        <Form.Select
         name="startTime"
         value={formData.startTime}
         onChange={handleChange}
        >
         <option value="">Select Time</option>
         {hourlyTimeOptions.map(option=>(
          <option key={option.value} value={option.value}>{option.label}</option>
         ))}
        </Form.Select>
       </InlineField>
      </Col>

      <Col md={6}>
       <InlineField label="End Date" labelMd={4} inputMd={8}>
        <Form.Control
         type="date"
         name="endDate"
         value={formData.endDate}
         onChange={handleChange}
         required
        />
       </InlineField>
      </Col>

      <Col md={6}>
       <InlineField label="End Time" labelMd={4} inputMd={8}>
        <Form.Select
         name="endTime"
         value={formData.endTime}
         onChange={handleChange}
        >
         <option value="">Select Time</option>
         {hourlyTimeOptions.map(option=>(
          <option key={option.value} value={option.value}>{option.label}</option>
         ))}
        </Form.Select>
       </InlineField>
      </Col>

      <Col md={6}>
       <InlineField label="Recurring Annual" labelMd={4} inputMd={8}>
        <Form.Check
         type="switch"
         id="isRecurringAnnual"
         name="isRecurringAnnual"
         label=""
         checked={formData.isRecurringAnnual}
         onChange={handleChange}
        />
       </InlineField>
      </Col>

      <Col md={6}>
       <InlineField label="Active" labelMd={4} inputMd={8}>
        <Form.Check
         type="switch"
         id="isActive"
         name="isActive"
         label=""
         checked={formData.isActive}
         onChange={handleChange}
        />
       </InlineField>
      </Col>

      <Col md={12}>
       <InlineField label="Notes" labelMd={2} inputMd={10}>
        <Form.Control
         as="textarea"
         rows={3}
         name="notes"
         value={formData.notes}
         onChange={handleChange}
        />
       </InlineField>
      </Col>
     </Row>
    </Card.Body>
   </Card>

   <div className="d-flex justify-content-end">
    <Button type="submit" disabled={loading}>
     {loading?"Saving...":"Save Occasion"}
    </Button>
   </div>
  </Form>
 );
}
