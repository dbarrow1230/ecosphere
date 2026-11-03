import {useEffect,useState} from "react";
import {Form,Row,Col,Button,Card,Tabs,Tab,InputGroup,Modal} from "react-bootstrap";
import PhoneInputImport from "react-phone-input-2";
import BusinessTypeForm from "./BusinessTypeForm.jsx";
import "react-phone-input-2/lib/bootstrap.css";

const PhoneInput=PhoneInputImport?.default||PhoneInputImport;

const themeTokenLabels={
 bg:"Background",
 bgAlt:"Background Alt",
 surface:"Surface",
 surface2:"Surface Secondary",
 text:"Text",
 textSoft:"Muted Text",
 textInverse:"Inverse Text",
 heading:"Heading",
 primary:"Primary",
 primaryHover:"Primary Hover",
 secondary:"Secondary",
 secondaryHover:"Secondary Hover",
 accent:"Accent",
 accentHover:"Accent Hover",
 accent2:"Accent Secondary",
 success:"Success",
 warning:"Warning",
 danger:"Danger",
 info:"Info",
 border:"Border",
 borderStrong:"Border Strong",
 gradientMain:"Gradient Main",
 gradientSoft:"Gradient Soft",
 overlay:"Overlay",
 tableStripe:"Table Stripe",
 selectionBg:"Selection Background",
 selectionText:"Selection Text",
 fontHeading:"Heading Font",
 fontBody:"Body Font"
};

const gradientTokens=[
 "gradientMain",
 "gradientSoft"
];

const themeColorTokens=[
 "bg",
 "bgAlt",
 "surface",
 "surface2",
 "text",
 "textSoft",
 "textInverse",
 "heading",
 "primary",
 "primaryHover",
 "secondary",
 "secondaryHover",
 "accent",
 "accentHover",
 "accent2",
 "success",
 "warning",
 "danger",
 "info",
 "border",
 "borderStrong",
 "gradientMain",
 "gradientSoft",
 "overlay",
 "tableStripe",
 "selectionBg",
 "selectionText"
];

const themeFontTokens=[
 "fontHeading",
 "fontBody"
];

const themeTokens=[
 ...themeColorTokens,
 ...themeFontTokens
];

const cssVarMap={
 bg:"--bg",
 bgAlt:"--bg-alt",
 surface:"--surface",
 surface2:"--surface-2",
 text:"--text",
 textSoft:"--text-soft",
 textInverse:"--text-inverse",
 heading:"--heading",
 primary:"--primary",
 primaryHover:"--primary-hover",
 secondary:"--secondary",
 secondaryHover:"--secondary-hover",
 accent:"--accent",
 accentHover:"--accent-hover",
 accent2:"--accent-2",
 success:"--success",
 warning:"--warning",
 danger:"--danger",
 info:"--info",
 border:"--border",
 borderStrong:"--border-strong",
 gradientMain:"--gradient-main",
 gradientSoft:"--gradient-soft",
 overlay:"--overlay",
 tableStripe:"--table-stripe",
 selectionBg:"--selection-bg",
 selectionText:"--selection-text"
};

const buildDefaultThemeColors=()=>themeTokens.reduce((acc,token)=>{
 if(themeFontTokens.includes(token)){
  acc[token]={fontName:"",fallbackFont:""};
 }else if(gradientTokens.includes(token)){
  acc[token]="";
 }else{
  acc[token]={value:"",colorName:""};
 }
 return acc;
},{});

const defaultFormData={
 legalName:"",
 code:"",
 typeRef:"",
 taxRate:0,
 website:"",
 taglineId:"",
 logo:"",
 themeColors:buildDefaultThemeColors(),
 phone:"",
 fax:"",
 email:"",
 footerId:"",
 receiptsEnabled:true,
 receiptTemplateId:"",
 receiptHeaderId:"",
 receiptSubHeaderId:"",
 receiptFooterId:"",
 addressLine1:"",
 addressLine2:"",
 city:"",
 stateRef:"",
 countyRef:"",
 countryRef:"",
 postalCode:"",
 showLogoOnReceipt:true,
 showTaxRateOnReceipt:true,
 showWebsiteOnReceipt:true,
 showEmailOnReceipt:true,
 showPhoneOnReceipt:true,
 showFaxOnReceipt:false,
 showAddressOnReceipt:true,
 isActive:true,
 notes:""
};

const expandHex=value=>{
 const color=String(value||"").trim();
 if(/^#([0-9a-fA-F]{6})$/.test(color))return color.toLowerCase();
 if(/^#([0-9a-fA-F]{3})$/.test(color)){
  const hex=color.slice(1).toLowerCase();
  return `#${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}`;
 }
 return "";
};

const rgbStringToHex=value=>{
 const match=String(value||"").trim().match(/^rgba?\(([^)]+)\)$/i);
 if(!match)return "";
 const parts=match[1].split(",").map(part=>part.trim());
 if(parts.length<3)return "";
 const r=Math.max(0,Math.min(255,parseInt(parts[0],10)));
 const g=Math.max(0,Math.min(255,parseInt(parts[1],10)));
 const b=Math.max(0,Math.min(255,parseInt(parts[2],10)));
 if(Number.isNaN(r)||Number.isNaN(g)||Number.isNaN(b))return "";
 return `#${[r,g,b].map(item=>item.toString(16).padStart(2,"0")).join("")}`;
};

const resolveCssColor=value=>{
 const directHex=expandHex(value);
 if(directHex)return directHex;
 const rgbHex=rgbStringToHex(value);
 if(rgbHex)return rgbHex;
 if(typeof document==="undefined")return "";
 const raw=String(value||"").trim();
 if(!raw)return "";
 const gradientColorMatch=raw.match(/#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b|rgba?\([^)]+\)/);
 const extracted=gradientColorMatch?gradientColorMatch[0]:"";
 const extractedHex=expandHex(extracted)||rgbStringToHex(extracted);
 if(extractedHex)return extractedHex;
 const tester=document.createElement("span");
 tester.style.color=raw;
 document.body.appendChild(tester);
 const computed=getComputedStyle(tester).color;
 document.body.removeChild(tester);
 return rgbStringToHex(computed);
};

const getRootThemeColors=()=>{
 if(typeof document==="undefined"){
  return themeColorTokens.reduce((acc,token)=>{
   acc[token]="";
   return acc;
  },{});
 }
 const styles=getComputedStyle(document.documentElement);
 return themeColorTokens.reduce((acc,token)=>{
  const rawValue=styles.getPropertyValue(cssVarMap[token]||"").trim();
  acc[token]=gradientTokens.includes(token)?rawValue:resolveCssColor(rawValue);
  return acc;
 },{});
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
 return item?.name||item?.title||item?.tagline||item?.footer||item?.content||item?.code||item?.legalName||item?.value||"";
};

const normalizeOptions=items=>{
 return Array.isArray(items)?items.filter(item=>getOptionValue(item)&&getOptionLabel(item)):[];
};

const normalizeThemeColors=(incomingThemeColors={})=>{
 return themeTokens.reduce((acc,token)=>{
  const incomingToken=incomingThemeColors?.[token];
  if(themeFontTokens.includes(token)){
   acc[token]={
    fontName:typeof incomingToken==="object"&&incomingToken!==null?String(incomingToken.fontName||""):"",
    fallbackFont:typeof incomingToken==="object"&&incomingToken!==null?String(incomingToken.fallbackFont||""):""
   };
  }else if(gradientTokens.includes(token)){
   acc[token]=typeof incomingToken==="string"?incomingToken:String(incomingToken?.value||"");
  }else{
   const incomingValue=typeof incomingToken==="string"?incomingToken:incomingToken?.value;
   const incomingColorName=typeof incomingToken==="object"&&incomingToken!==null?String(incomingToken.colorName||""):"";
   acc[token]={
    value:resolveCssColor(incomingValue)||"",
    colorName:incomingColorName
   };
  }
  return acc;
 },{});
};

const generateBusinessCode=value=>{
 return String(value||"")
  .trim()
  .split(/\s+/)
  .filter(Boolean)
  .map(word=>word.slice(0,3))
  .join("")
  .toLowerCase();
};

const InlineField=({label,children,labelMd=3,inputMd=9,className=""})=>(
 <Form.Group as={Row} className={`align-items-center mb-3 ${className}`}>
  <Form.Label column md={labelMd} className="fw-semibold mb-0">{label}</Form.Label>
  <Col md={inputMd}>
   {children}
  </Col>
 </Form.Group>
);

export default function BusinessesForm({
 initialData={},
 onSubmit,
 loading=false,
 businessTypes=[],
 taglines=[],
 footers=[],
 receiptTemplates=[],
 receiptHeaders=[],
 receiptSubHeaders=[],
 receiptFooters=[],
 states=[],
 counties=[],
 countries=[],
 renderReceiptTemplateForm,
 renderReceiptHeaderForm,
 renderReceiptSubHeaderForm,
 renderReceiptFooterForm,
 reloadReceiptTemplates,
 reloadReceiptHeaders,
 reloadReceiptSubHeaders,
 reloadReceiptFooters
}){
 const [formData,setFormData]=useState(defaultFormData);
 const [activeTab,setActiveTab]=useState("general");
 const [rootThemeColors,setRootThemeColors]=useState({});
 const [logoUploading,setLogoUploading]=useState(false);
 const [logoError,setLogoError]=useState("");
 const [showBusinessTypeModal,setShowBusinessTypeModal]=useState(false);
 const [showReceiptTemplateModal,setShowReceiptTemplateModal]=useState(false);
 const [showReceiptHeaderModal,setShowReceiptHeaderModal]=useState(false);
 const [showReceiptSubHeaderModal,setShowReceiptSubHeaderModal]=useState(false);
 const [showReceiptFooterModal,setShowReceiptFooterModal]=useState(false);
 const [businessTypeRows,setBusinessTypeRows]=useState([]);

 const taglineOptions=normalizeOptions(taglines);
 const footerOptions=normalizeOptions(footers);
 const receiptTemplateOptions=normalizeOptions(receiptTemplates);
 const receiptHeaderOptions=normalizeOptions(receiptHeaders);
 const receiptSubHeaderOptions=normalizeOptions(receiptSubHeaders);
 const receiptFooterOptions=normalizeOptions(receiptFooters);
 const stateOptions=normalizeOptions(states);
 const countyOptions=normalizeOptions(counties);
 const countryOptions=normalizeOptions(countries);
 const businessTypeOptions=normalizeOptions(businessTypeRows);

 useEffect(()=>{
  setRootThemeColors(getRootThemeColors());
 },[]);

 useEffect(()=>{
  setBusinessTypeRows(Array.isArray(businessTypes)?businessTypes:[]);
 },[businessTypes]);

 useEffect(()=>{
  const currentRootThemeColors=getRootThemeColors();
  const nextData={
   ...defaultFormData,
   ...initialData,
   typeRef:getObjectId(initialData?.typeRef),
   taglineId:getObjectId(initialData?.taglineId),
   footerId:getObjectId(initialData?.footerId),
   receiptsEnabled:initialData?.receiptsEnabled!==false,
   receiptTemplateId:getObjectId(initialData?.receiptTemplateId),
   receiptHeaderId:getObjectId(initialData?.receiptHeaderId),
   receiptSubHeaderId:getObjectId(initialData?.receiptSubHeaderId),
   receiptFooterId:getObjectId(initialData?.receiptFooterId),
   stateRef:getObjectId(initialData?.stateRef),
   countyRef:getObjectId(initialData?.countyRef),
   countryRef:getObjectId(initialData?.countryRef),
   themeColors:normalizeThemeColors(initialData?.themeColors)
  };

  setRootThemeColors(currentRootThemeColors);
  setFormData(nextData);
 },[initialData]);

 const loadBusinessTypes=async()=>{
  try{
   const res=await fetch("/api/business-types",{headers:{"Content-Type":"application/json"}});
   if(!res.ok)return [];
   const data=await res.json().catch(()=>[]);
   const rows=Array.isArray(data)?data:Array.isArray(data?.data)?data.data:Array.isArray(data?.businessTypes)?data.businessTypes:[];
   setBusinessTypeRows(rows);
   return rows;
  }catch{
   return [];
  }
 };

 const handleChange=e=>{
  const {name,type,value,checked}=e.target;
  setFormData(prev=>({
   ...prev,
   [name]:type==="checkbox"?checked:type==="number"?value===""?"":Number(value):value,
   ...(name==="legalName"?{code:generateBusinessCode(value)}:{})
  }));
 };

 const handlePhoneChange=(name,value)=>{
  setFormData(prev=>({
   ...prev,
   [name]:value
  }));
 };

 const getLogoPreviewUrl=logo=>{
  const filename=String(logo||"").trim();
  if(!filename)return "";
  if(/^https?:\/\//i.test(filename)||filename.startsWith("/"))return filename;
  return `/logos/${encodeURIComponent(filename)}`;
 };

 const handleLogoUpload=async event=>{
  const file=event.target.files?.[0];
  event.target.value="";
  if(!file)return;

  setLogoError("");
  setLogoUploading(true);

  try{
   const body=new FormData();
   body.append("file",file);

   const res=await fetch("/api/upload/logos",{
    method:"POST",
    body
   });

   const data=await res.json().catch(()=>null);

   if(!res.ok||!data?.success||!data?.filename){
    throw new Error(data?.message||"Logo upload failed.");
   }

   setFormData(prev=>({
    ...prev,
    logo:String(data.filename||"")
   }));
  }catch(err){
   setLogoError(err.message||"Unable to upload logo.");
  }finally{
   setLogoUploading(false);
  }
 };

 const handleLogoClear=()=>{
  setLogoError("");
  setFormData(prev=>({
   ...prev,
   logo:""
  }));
 };

 const handleThemeTokenChange=(token,key,value)=>{
  setFormData(prev=>({
   ...prev,
   themeColors:{
    ...(prev.themeColors||{}),
    [token]:gradientTokens.includes(token)
     ?value
     :{
        ...(prev.themeColors?.[token]||(themeFontTokens.includes(token)?{fontName:"",fallbackFont:""}:{value:"",colorName:""})),
        [key]:value
       }
   }
  }));
 };

 const handleBusinessTypeSaved=async(savedItem)=>{
  const rows=await loadBusinessTypes();
  const savedId=getObjectId(savedItem);
  const matchedId=savedId||getObjectId(rows.find(item=>{
   if(!savedItem||typeof savedItem!=="object")return false;
   return String(item?.name||"").trim().toLowerCase()===String(savedItem?.name||"").trim().toLowerCase();
  }));
  if(matchedId){
   setFormData(prev=>({...prev,typeRef:matchedId}));
  }
  setShowBusinessTypeModal(false);
 };

 const handleReceiptTemplateSaved=async(savedItem)=>{
  await reloadReceiptTemplates?.();
  if(savedItem)setFormData(prev=>({...prev,receiptTemplateId:getObjectId(savedItem)}));
  setShowReceiptTemplateModal(false);
 };

 const handleReceiptHeaderSaved=async(savedItem)=>{
  await reloadReceiptHeaders?.();
  if(savedItem)setFormData(prev=>({...prev,receiptHeaderId:getObjectId(savedItem)}));
  setShowReceiptHeaderModal(false);
 };

 const handleReceiptSubHeaderSaved=async(savedItem)=>{
  await reloadReceiptSubHeaders?.();
  if(savedItem)setFormData(prev=>({...prev,receiptSubHeaderId:getObjectId(savedItem)}));
  setShowReceiptSubHeaderModal(false);
 };

 const handleReceiptFooterSaved=async(savedItem)=>{
  await reloadReceiptFooters?.();
  if(savedItem)setFormData(prev=>({...prev,receiptFooterId:getObjectId(savedItem)}));
  setShowReceiptFooterModal(false);
 };

 const handleSubmit=e=>{
  e.preventDefault();
  const payload={
   ...formData,
   taxRate:formData.taxRate===""?0:Number(Number(formData.taxRate).toFixed(3)),
   typeRef:getObjectId(formData.typeRef)||null,
   taglineId:getObjectId(formData.taglineId)||null,
   footerId:getObjectId(formData.footerId)||null,
   receiptsEnabled:!!formData.receiptsEnabled,
   receiptTemplateId:getObjectId(formData.receiptTemplateId)||null,
   receiptHeaderId:getObjectId(formData.receiptHeaderId)||null,
   receiptSubHeaderId:getObjectId(formData.receiptSubHeaderId)||null,
   receiptFooterId:getObjectId(formData.receiptFooterId)||null,
   stateRef:getObjectId(formData.stateRef)||null,
   countyRef:getObjectId(formData.countyRef)||null,
   countryRef:getObjectId(formData.countryRef)||null,
   themeColors:themeTokens.reduce((acc,token)=>{
    if(themeFontTokens.includes(token)){
     acc[token]={
      fontName:String(formData.themeColors?.[token]?.fontName||""),
      fallbackFont:String(formData.themeColors?.[token]?.fallbackFont||"")
     };
    }else if(gradientTokens.includes(token)){
     acc[token]=String(formData.themeColors?.[token]||"").trim();
    }else{
      acc[token]={
      value:resolveCssColor(formData.themeColors?.[token]?.value)||"",
      colorName:String(formData.themeColors?.[token]?.colorName||"")
     };
    }
    return acc;
   },{})
  };
  onSubmit&&onSubmit(payload);
 };

 return(
  <>
   <Form onSubmit={handleSubmit}>
    <Tabs activeKey={activeTab} onSelect={(key)=>setActiveTab(key||"general")} className="mb-3">
     <Tab eventKey="general" title="General">
      <Card className="border-0 shadow-sm">
       <Card.Body>
        <Row>
         <Col md={8}>
          <InlineField label="Legal Name">
           <Form.Control
            type="text"
            name="legalName"
            value={formData.legalName}
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

         <Col md={12}>
          <InlineField label="Business Type" labelMd={2} inputMd={10}>
           <InputGroup>
            <Form.Select
             name="typeRef"
             value={formData.typeRef}
             onChange={handleChange}
             required
            >
             <option value="">Select Business Type</option>
             {businessTypeOptions.map(item=>(
              <option key={getOptionValue(item)} value={getOptionValue(item)}>
               {getOptionLabel(item)}
              </option>
             ))}
            </Form.Select>
            <Button type="button" variant="outline-primary" onClick={()=>setShowBusinessTypeModal(true)}>Add</Button>
           </InputGroup>
          </InlineField>
         </Col>

         <Col md={6}>
          <InlineField label="Website" labelMd={4} inputMd={8}>
           <Form.Control
            type="text"
            name="website"
            value={formData.website}
            onChange={handleChange}
           />
          </InlineField>
         </Col>
         <Col md={3}>
          <InlineField label="Logo" labelMd={4} inputMd={8}>
           <div className="d-flex flex-column gap-2">
            {formData.logo?(
             <div className="d-flex align-items-center gap-2">
              <img
               src={getLogoPreviewUrl(formData.logo)}
               alt="Business logo preview"
               style={{width:"64px",height:"64px",objectFit:"contain",border:"1px solid var(--border)",borderRadius:"var(--radius-sm)",background:"var(--surface)"}}
              />
              <span className="text-muted small">{formData.logo}</span>
             </div>
            ):null}
            <Form.Control
             type="file"
             accept="image/*"
             onChange={handleLogoUpload}
             disabled={logoUploading||loading}
            />
            <div className="d-flex gap-2">
             {formData.logo?(
              <Button type="button" variant="outline-secondary" size="sm" onClick={handleLogoClear} disabled={logoUploading||loading}>
               Clear
              </Button>
             ):null}
             {logoUploading?(
              <span className="text-muted small align-self-center">Uploading...</span>
             ):null}
            </div>
            {logoError?(
             <div className="text-danger small">{logoError}</div>
            ):null}
           </div>
          </InlineField>
         </Col>
         <Col md={3}>
          <InlineField label="Tax Rate" labelMd={5} inputMd={5}>
           <Form.Control
            type="number"
            name="taxRate"
            value={formData.taxRate??""}
            onChange={handleChange}
            min="0"
            max="100"
            step="0.001"
           />
          </InlineField>
         </Col>

         <Col md={6}>
          <InlineField label="Phone" labelMd={4} inputMd={8}>
           <PhoneInput
            country={"us"}
            value={formData.phone}
            onChange={(value)=>handlePhoneChange("phone",value)}
            inputClass="form-control w-100"
            buttonClass=""
            containerClass="w-100"
            dropdownClass=""
            enableSearch
            disableCountryCode={false}
           />
          </InlineField>
         </Col>
         <Col md={6}>
          <InlineField label="Fax" labelMd={4} inputMd={8}>
           <PhoneInput
            country={"us"}
            value={formData.fax}
            onChange={(value)=>handlePhoneChange("fax",value)}
            inputClass="form-control w-100"
            buttonClass=""
            containerClass="w-100"
            dropdownClass=""
            enableSearch
            disableCountryCode={false}
           />
          </InlineField>
         </Col>

         <Col md={12}>
          <InlineField label="Email" labelMd={2} inputMd={10}>
           <Form.Control
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
           />
          </InlineField>
         </Col>

         <Col md={12}>
          <InlineField label="Address 1" labelMd={2} inputMd={10}>
           <Form.Control
            type="text"
            name="addressLine1"
            value={formData.addressLine1}
            onChange={handleChange}
           />
          </InlineField>
         </Col>

         <Col md={12}>
          <InlineField label="Address 2" labelMd={2} inputMd={10}>
           <Form.Control
            type="text"
            name="addressLine2"
            value={formData.addressLine2}
            onChange={handleChange}
           />
          </InlineField>
         </Col>

         <Col md={4}>
          <InlineField label="City" labelMd={4} inputMd={8}>
           <Form.Control
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
           />
          </InlineField>
         </Col>
         <Col md={4}>
          <InlineField label="State" labelMd={4} inputMd={8}>
           <Form.Select
            name="stateRef"
            value={formData.stateRef}
            onChange={handleChange}
           >
            <option value="">Select State</option>
            {stateOptions.map(item=>(
             <option key={getOptionValue(item)} value={getOptionValue(item)}>
              {getOptionLabel(item)}
             </option>
            ))}
           </Form.Select>
          </InlineField>
         </Col>
         <Col md={4}>
          <InlineField label="Zip" labelMd={4} inputMd={8}>
           <Form.Control
            type="text"
            name="postalCode"
            value={formData.postalCode}
            onChange={handleChange}
           />
          </InlineField>
         </Col>

         <Col md={6}>
          <InlineField label="Country" labelMd={4} inputMd={8}>
           <Form.Select
            name="countryRef"
            value={formData.countryRef}
            onChange={handleChange}
           >
            <option value="">Select Country</option>
            {countryOptions.map(item=>(
             <option key={getOptionValue(item)} value={getOptionValue(item)}>
              {getOptionLabel(item)}
             </option>
            ))}
           </Form.Select>
          </InlineField>
         </Col>
         <Col md={6}>
          <InlineField label="County" labelMd={4} inputMd={8}>
           <Form.Select
            name="countyRef"
            value={formData.countyRef}
            onChange={handleChange}
           >
            <option value="">Select County</option>
            {countyOptions.map(item=>(
             <option key={getOptionValue(item)} value={getOptionValue(item)}>
              {getOptionLabel(item)}
             </option>
            ))}
           </Form.Select>
          </InlineField>
         </Col>

         <Col md={6}>
          <InlineField label="Tagline" labelMd={4} inputMd={8}>
           <Form.Select
            name="taglineId"
            value={formData.taglineId}
            onChange={handleChange}
           >
            <option value="">Select Tagline</option>
            {taglineOptions.map(item=>(
             <option key={getOptionValue(item)} value={getOptionValue(item)}>
              {getOptionLabel(item)}
             </option>
            ))}
           </Form.Select>
          </InlineField>
         </Col>
         <Col md={6}>
          <InlineField label="Footer" labelMd={4} inputMd={8}>
           <Form.Select
            name="footerId"
            value={formData.footerId}
            onChange={handleChange}
           >
            <option value="">Select Footer</option>
            {footerOptions.map(item=>(
             <option key={getOptionValue(item)} value={getOptionValue(item)}>
              {getOptionLabel(item)}
             </option>
            ))}
           </Form.Select>
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

     <Tab eventKey="theme" title="Theme Colors">
      <Card className="border-0 shadow-sm">
       <Card.Body>
        <Row>
         {themeColorTokens.map(token=>{
          if(gradientTokens.includes(token)){
           return(
            <Col md={6} key={token}>
             <Form.Group as={Row} className="align-items-center mb-3">
              <Form.Label column md={5} className="fw-semibold mb-0">{themeTokenLabels[token]||token}</Form.Label>
              <Col md={7}>
               <Form.Control
                type="text"
                placeholder="linear-gradient(135deg,#000000 0%,#ffffff 100%)"
                value={formData.themeColors?.[token]||""}
                onChange={(e)=>handleThemeTokenChange(token,"value",e.target.value)}
               />
              </Col>
             </Form.Group>
            </Col>
           );
          }

          const resolvedValue=resolveCssColor(formData.themeColors?.[token]?.value)||"#000000";
          return(
           <Col md={6} key={token}>
            <Form.Group as={Row} className="align-items-center mb-3">
             <Form.Label column md={5} className="fw-semibold mb-0">{themeTokenLabels[token]||token}</Form.Label>
             <Col md={7}>
              <div className="d-flex align-items-center gap-2 mb-2">
               <Form.Control
                type="color"
                value={resolvedValue}
                onChange={(e)=>handleThemeTokenChange(token,"value",e.target.value)}
                style={{width:"56px",minWidth:"56px",padding:"0.2rem",height:"38px"}}
                title={themeTokenLabels[token]||token}
               />
               <Form.Control
                type="text"
                value={resolvedValue}
                onChange={(e)=>handleThemeTokenChange(token,"value",e.target.value)}
               />
              </div>
              <Form.Control
               type="text"
               placeholder="Color Name"
               value={formData.themeColors?.[token]?.colorName||""}
               onChange={(e)=>handleThemeTokenChange(token,"colorName",e.target.value)}
              />
             </Col>
            </Form.Group>
           </Col>
          );
         })}

         {themeFontTokens.map(token=>(
          <Col md={6} key={token}>
           <Form.Group as={Row} className="align-items-center mb-3">
            <Form.Label column md={5} className="fw-semibold mb-0">{themeTokenLabels[token]||token}</Form.Label>
            <Col md={7}>
             <Form.Control
              type="text"
              placeholder="Font Name"
              className="mb-2"
              value={formData.themeColors?.[token]?.fontName||""}
              onChange={(e)=>handleThemeTokenChange(token,"fontName",e.target.value)}
             />
             <Form.Control
              type="text"
              placeholder="Fallback Font"
              value={formData.themeColors?.[token]?.fallbackFont||""}
              onChange={(e)=>handleThemeTokenChange(token,"fallbackFont",e.target.value)}
             />
            </Col>
           </Form.Group>
          </Col>
         ))}
        </Row>
       </Card.Body>
      </Card>
     </Tab>

     <Tab eventKey="receipt" title="Receipt">
      <Card className="border-0 shadow-sm">
       <Card.Body>
        <Row>
         <Col md={12}>
          <InlineField label="Enable Receipts" labelMd={2} inputMd={10}>
           <Form.Check
            type="switch"
            id="receiptsEnabled"
            name="receiptsEnabled"
            label=""
            checked={formData.receiptsEnabled}
            onChange={handleChange}
           />
          </InlineField>
         </Col>

         {formData.receiptsEnabled&&(
          <>
           <Col md={12}>
            <InlineField label="Receipt Template" labelMd={2} inputMd={10}>
             <InputGroup>
              <Form.Select
               name="receiptTemplateId"
               value={formData.receiptTemplateId}
               onChange={handleChange}
              >
               <option value="">Select Receipt Template</option>
               {receiptTemplateOptions.map(item=>(
                <option key={getOptionValue(item)} value={getOptionValue(item)}>
                 {getOptionLabel(item)}
                </option>
               ))}
              </Form.Select>
              <Button type="button" variant="outline-primary" onClick={()=>setShowReceiptTemplateModal(true)}>Add</Button>
             </InputGroup>
            </InlineField>
           </Col>

           <Col md={12}>
            <InlineField label="Receipt Header" labelMd={2} inputMd={10}>
             <InputGroup>
              <Form.Select
               name="receiptHeaderId"
               value={formData.receiptHeaderId}
               onChange={handleChange}
              >
               <option value="">Select Receipt Header</option>
               {receiptHeaderOptions.map(item=>(
                <option key={getOptionValue(item)} value={getOptionValue(item)}>
                 {getOptionLabel(item)}
                </option>
               ))}
              </Form.Select>
              <Button type="button" variant="outline-primary" onClick={()=>setShowReceiptHeaderModal(true)}>Add</Button>
             </InputGroup>
            </InlineField>
           </Col>

           <Col md={12}>
            <InlineField label="Receipt Sub Header" labelMd={2} inputMd={10}>
             <InputGroup>
              <Form.Select
               name="receiptSubHeaderId"
               value={formData.receiptSubHeaderId}
               onChange={handleChange}
              >
               <option value="">Select Receipt Sub Header</option>
               {receiptSubHeaderOptions.map(item=>(
                <option key={getOptionValue(item)} value={getOptionValue(item)}>
                 {getOptionLabel(item)}
                </option>
               ))}
              </Form.Select>
              <Button type="button" variant="outline-primary" onClick={()=>setShowReceiptSubHeaderModal(true)}>Add</Button>
             </InputGroup>
            </InlineField>
           </Col>

           <Col md={12}>
            <InlineField label="Receipt Footer" labelMd={2} inputMd={10}>
             <InputGroup>
              <Form.Select
               name="receiptFooterId"
               value={formData.receiptFooterId}
               onChange={handleChange}
              >
               <option value="">Select Receipt Footer</option>
               {receiptFooterOptions.map(item=>(
                <option key={getOptionValue(item)} value={getOptionValue(item)}>
                 {getOptionLabel(item)}
                </option>
               ))}
              </Form.Select>
              <Button type="button" variant="outline-primary" onClick={()=>setShowReceiptFooterModal(true)}>Add</Button>
             </InputGroup>
            </InlineField>
           </Col>

           <Col md={6}>
            <InlineField label="Show Logo" labelMd={5} inputMd={7}>
             <Form.Check
              type="switch"
              id="showLogoOnReceipt"
              name="showLogoOnReceipt"
              label=""
              checked={formData.showLogoOnReceipt}
              onChange={handleChange}
             />
            </InlineField>
           </Col>
           <Col md={6}>
            <InlineField label="Show Tax Rate" labelMd={5} inputMd={7}>
             <Form.Check
              type="switch"
              id="showTaxRateOnReceipt"
              name="showTaxRateOnReceipt"
              label=""
              checked={formData.showTaxRateOnReceipt}
              onChange={handleChange}
             />
            </InlineField>
           </Col>

           <Col md={6}>
            <InlineField label="Show Website" labelMd={5} inputMd={7}>
             <Form.Check
              type="switch"
              id="showWebsiteOnReceipt"
              name="showWebsiteOnReceipt"
              label=""
              checked={formData.showWebsiteOnReceipt}
              onChange={handleChange}
             />
            </InlineField>
           </Col>
           <Col md={6}>
            <InlineField label="Show Email" labelMd={5} inputMd={7}>
             <Form.Check
              type="switch"
              id="showEmailOnReceipt"
              name="showEmailOnReceipt"
              label=""
              checked={formData.showEmailOnReceipt}
              onChange={handleChange}
             />
            </InlineField>
           </Col>

           <Col md={6}>
            <InlineField label="Show Phone" labelMd={5} inputMd={7}>
             <Form.Check
              type="switch"
              id="showPhoneOnReceipt"
              name="showPhoneOnReceipt"
              label=""
              checked={formData.showPhoneOnReceipt}
              onChange={handleChange}
             />
            </InlineField>
           </Col>
           <Col md={6}>
            <InlineField label="Show Fax" labelMd={5} inputMd={7}>
             <Form.Check
              type="switch"
              id="showFaxOnReceipt"
              name="showFaxOnReceipt"
              label=""
              checked={formData.showFaxOnReceipt}
              onChange={handleChange}
             />
            </InlineField>
           </Col>

           <Col md={6}>
            <InlineField label="Show Address" labelMd={5} inputMd={7}>
             <Form.Check
              type="switch"
              id="showAddressOnReceipt"
              name="showAddressOnReceipt"
              label=""
              checked={formData.showAddressOnReceipt}
              onChange={handleChange}
             />
            </InlineField>
           </Col>
          </>
         )}
        </Row>
       </Card.Body>
      </Card>
     </Tab>
    </Tabs>

    <div className="d-flex justify-content-end">
     <Button type="submit" disabled={loading}>
      {loading?"Saving...":"Save Business"}
     </Button>
    </div>
   </Form>

   <Modal show={showBusinessTypeModal} onHide={()=>setShowBusinessTypeModal(false)} centered backdrop="static" size="lg">
    <BusinessTypeForm
     show={showBusinessTypeModal}
     onHide={()=>setShowBusinessTypeModal(false)}
     onSaved={handleBusinessTypeSaved}
     initialData={null}
    />
   </Modal>

   <Modal show={showReceiptTemplateModal} onHide={()=>setShowReceiptTemplateModal(false)} centered backdrop="static" size="lg">
    {renderReceiptTemplateForm?.({
     show:showReceiptTemplateModal,
     onHide:()=>setShowReceiptTemplateModal(false),
     onSaved:handleReceiptTemplateSaved,
     initialData:null
    })}
   </Modal>

   <Modal show={showReceiptHeaderModal} onHide={()=>setShowReceiptHeaderModal(false)} centered backdrop="static" size="lg">
    {renderReceiptHeaderForm?.({
     show:showReceiptHeaderModal,
     onHide:()=>setShowReceiptHeaderModal(false),
     onSaved:handleReceiptHeaderSaved,
     initialData:null
    })}
   </Modal>

   <Modal show={showReceiptSubHeaderModal} onHide={()=>setShowReceiptSubHeaderModal(false)} centered backdrop="static" size="lg">
    {renderReceiptSubHeaderForm?.({
     show:showReceiptSubHeaderModal,
     onHide:()=>setShowReceiptSubHeaderModal(false),
     onSaved:handleReceiptSubHeaderSaved,
     initialData:null
    })}
   </Modal>

   <Modal show={showReceiptFooterModal} onHide={()=>setShowReceiptFooterModal(false)} centered backdrop="static" size="lg">
    {renderReceiptFooterForm?.({
     show:showReceiptFooterModal,
     onHide:()=>setShowReceiptFooterModal(false),
     onSaved:handleReceiptFooterSaved,
     initialData:null
    })}
   </Modal>
  </>
 );
}
