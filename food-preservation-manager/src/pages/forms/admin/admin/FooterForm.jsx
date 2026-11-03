//src/pages/forms/admin/footerForm.jsx
import {useEffect,useMemo,useState} from "react";
import {Form,Row,Col,Button,Card,Tabs,Tab} from "react-bootstrap";
import SortedSelect from "../../../../components/SortedSelect.jsx";

const defaultFormData={
 business_id:"",
 seasonRef:"",
 name:"",
 lines:[""],
 showDate:true,
 showTime:true,
 showCashier:false,
 isDefault:false,
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

const InlineField=({label,children,labelMd=3,inputMd=9,className=""})=>(
 <Form.Group as={Row} className={`align-items-center mb-3 ${className}`}>
  <Form.Label column md={labelMd} className="fw-semibold mb-0">{label}</Form.Label>
  <Col md={inputMd}>
   {children}
  </Col>
 </Form.Group>
);

export default function FooterForm({
 initialData={},
 onSubmit,
 loading=false,
 businesses=[],
 seasons=[]
}){
 const [formData,setFormData]=useState(defaultFormData);
 const [activeTab,setActiveTab]=useState("general");

 const businessOptions=normalizeOptions(businesses);
 const seasonOptions=useMemo(()=>{
  const businessId=getObjectId(formData.business_id);
  return normalizeOptions(seasons).filter(season=>{
   const seasonBusinessId=getObjectId(season.business_id);
   return !businessId||!seasonBusinessId||seasonBusinessId===businessId;
  });
 },[seasons,formData.business_id]);

 useEffect(()=>{
  const nextData={
   ...defaultFormData,
   ...initialData,
   business_id:getObjectId(initialData?.business_id),
   seasonRef:getObjectId(initialData?.seasonRef),
   lines:Array.isArray(initialData?.lines)&&initialData.lines.length>0?initialData.lines:[""]
  };
  setFormData(nextData);
 },[initialData]);

 const handleChange=e=>{
  const {name,type,value,checked}=e.target;
  setFormData(prev=>({
   ...prev,
   [name]:type==="checkbox"?checked:value,
   ...(name==="business_id"?{seasonRef:""}:{})
  }));
 };

 const handleLineChange=(index,value)=>{
  setFormData(prev=>{
   const nextLines=Array.isArray(prev.lines)?[...prev.lines]:[];
   nextLines[index]=value;
   return{
    ...prev,
    lines:nextLines
   };
  });
 };

 const addLine=()=>{
  setFormData(prev=>({
   ...prev,
   lines:[...(Array.isArray(prev.lines)?prev.lines:[]),""]
  }));
 };

 const removeLine=index=>{
  setFormData(prev=>{
   const nextLines=(Array.isArray(prev.lines)?prev.lines:[]).filter((_,i)=>i!==index);
   return{
    ...prev,
    lines:nextLines.length>0?nextLines:[""]
   };
  });
 };

 const handleSubmit=e=>{
  e.preventDefault();
  const payload={
   ...formData,
   business_id:getObjectId(formData.business_id)||null,
   seasonRef:getObjectId(formData.seasonRef)||null,
   lines:(Array.isArray(formData.lines)?formData.lines:[]).map(line=>String(line||"").trim()).filter(Boolean)
  };
  onSubmit&&onSubmit(payload);
 };

 return(
  <Form onSubmit={handleSubmit}>
   <Tabs activeKey={activeTab} onSelect={(key)=>setActiveTab(key||"general")} className="mb-3">
    <Tab eventKey="general" title="General">
     <Card className="border-0 shadow-sm">
      <Card.Body>
       <Row>
        <Col md={12}>
         <InlineField label="Business" labelMd={2} inputMd={10}>
          <SortedSelect
           name="business_id"
           value={formData.business_id}
           onChange={handleChange}
           required
           options={businessOptions}
           getValue={getOptionValue}
           getLabel={getOptionLabel}
           placeholder="Select Business"
          />
         </InlineField>
        </Col>

        <Col md={12}>
         <InlineField label="Season" labelMd={2} inputMd={10}>
          <SortedSelect
           name="seasonRef"
           value={formData.seasonRef}
           onChange={handleChange}
           options={seasonOptions}
           getValue={getOptionValue}
           getLabel={getOptionLabel}
           placeholder="General / No Season"
          />
         </InlineField>
        </Col>

        <Col md={12}>
         <InlineField label="Name" labelMd={2} inputMd={10}>
          <Form.Control
           type="text"
           name="name"
           value={formData.name}
           onChange={handleChange}
           required
          />
         </InlineField>
        </Col>

        <Col md={6}>
         <InlineField label="Default" labelMd={4} inputMd={8}>
          <Form.Check
           type="switch"
           id="isDefault"
           name="isDefault"
           label=""
           checked={formData.isDefault}
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
    </Tab>

    <Tab eventKey="lines" title="Lines">
     <Card className="border-0 shadow-sm">
      <Card.Body>
       <Row>
        <Col md={12} className="mb-3">
         <div className="d-flex justify-content-end">
          <Button type="button" onClick={addLine}>Add Line</Button>
         </div>
        </Col>

        {(Array.isArray(formData.lines)?formData.lines:[""]).map((line,index)=>(
         <Col md={12} key={index}>
          <Form.Group as={Row} className="align-items-center mb-3">
           <Form.Label column md={2} className="fw-semibold mb-0">{`Line ${index+1}`}</Form.Label>
           <Col md={8}>
            <Form.Control
             type="text"
             value={line}
             onChange={(e)=>handleLineChange(index,e.target.value)}
            />
           </Col>
           <Col md={2}>
            <Button
             type="button"
             variant="outline-danger"
             onClick={()=>removeLine(index)}
             disabled={(Array.isArray(formData.lines)?formData.lines.length:0)<=1}
            >
             Remove
            </Button>
           </Col>
          </Form.Group>
         </Col>
        ))}
       </Row>
      </Card.Body>
     </Card>
    </Tab>

    <Tab eventKey="receipt" title="Receipt Options">
     <Card className="border-0 shadow-sm">
      <Card.Body>
       <Row>
        <Col md={6}>
         <InlineField label="Show Date" labelMd={5} inputMd={7}>
          <Form.Check
           type="switch"
           id="showDate"
           name="showDate"
           label=""
           checked={formData.showDate}
           onChange={handleChange}
          />
         </InlineField>
        </Col>

        <Col md={6}>
         <InlineField label="Show Time" labelMd={5} inputMd={7}>
          <Form.Check
           type="switch"
           id="showTime"
           name="showTime"
           label=""
           checked={formData.showTime}
           onChange={handleChange}
          />
         </InlineField>
        </Col>

        <Col md={6}>
         <InlineField label="Show Cashier" labelMd={5} inputMd={7}>
          <Form.Check
           type="switch"
           id="showCashier"
           name="showCashier"
           label=""
           checked={formData.showCashier}
           onChange={handleChange}
          />
         </InlineField>
        </Col>
       </Row>
      </Card.Body>
     </Card>
    </Tab>
   </Tabs>

   <div className="d-flex justify-content-end">
    <Button type="submit" disabled={loading}>
     {loading?"Saving...":"Save Footer"}
    </Button>
   </div>
  </Form>
 );
}
