import {useEffect,useState} from "react";
import {Form,Row,Col,Button,Card,Tabs,Tab,InputGroup,Modal} from "react-bootstrap";
import PhoneInputImport from "react-phone-input-2";
import SortedSelect from "../components/SortedSelect.jsx";
import BusinessTypeForm from "./BusinessTypeForm.jsx";
import "react-phone-input-2/lib/bootstrap.css";
import "../styles/businessesForm.css";

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

const defaultBackgroundTreatment={
 mode:"color",
 image:"",
 imageOpacity:0.08,
 imageSize:"cover",
 imagePosition:"center",
 imageRepeat:"no-repeat",
 overlayOpacity:0,
 gradientToken:"gradientSoft",
 gradientType:"linear",
 gradientDirectionMode:"preset",
 gradientDirection:"180deg",
 gradientStart:"#cfdcc8",
 gradientEnd:"#b7c9ad",
 gradientStartStop:0,
 gradientEndStop:100
};

const gradientDirectionOptions=[
 {value:"180deg",label:"Top to Bottom"},
 {value:"0deg",label:"Bottom to Top"},
 {value:"90deg",label:"Left to Right"},
 {value:"270deg",label:"Right to Left"},
 {value:"135deg",label:"Top Left to Bottom Right"},
 {value:"225deg",label:"Top Right to Bottom Left"},
 {value:"45deg",label:"Bottom Left to Top Right"},
 {value:"315deg",label:"Bottom Right to Top Left"}
];

const buildDefaultThemeColors=()=>{
 const colors=themeTokens.reduce((acc,token)=>{
  if(themeFontTokens.includes(token)){
   acc[token]={fontName:"",fallbackFont:""};
  }else if(gradientTokens.includes(token)){
   acc[token]="";
  }else{
   acc[token]={value:"",colorName:""};
  }
  return acc;
 },{});

 return {
  ...colors,
  backgroundTreatment:{...defaultBackgroundTreatment}
 };
};

const defaultFormData={
 legalName:"",
 code:"",
 typeRef:"",
 taxRateRef:"",
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

const clampNumber=(value,min,max,defaultValue)=>{
 const numericValue=Number(value);
 if(!Number.isFinite(numericValue))return defaultValue;
 return Math.max(min,Math.min(max,numericValue));
};

const normalizeBackgroundTreatment=value=>{
 const incoming=value&&typeof value==="object"&&!Array.isArray(value)?value:{};
 const mode=["color","gradient","image"].includes(incoming.mode)?incoming.mode:"color";
 const gradientToken=["gradientMain","gradientSoft"].includes(incoming.gradientToken)?incoming.gradientToken:"gradientSoft";
 const gradientType=["linear","radial"].includes(incoming.gradientType)?incoming.gradientType:"linear";
 const gradientDirectionMode=["preset","custom"].includes(incoming.gradientDirectionMode)?incoming.gradientDirectionMode:"preset";
 const gradientDirection=String(incoming.gradientDirection||"180deg");
 const presetDirection=gradientDirectionOptions.some(option=>option.value===gradientDirection)?gradientDirection:"180deg";

 return {
  mode,
  image:String(incoming.image||""),
  imageOpacity:clampNumber(incoming.imageOpacity,0,1,0.08),
  imageSize:String(incoming.imageSize||"cover"),
  imagePosition:String(incoming.imagePosition||"center"),
  imageRepeat:String(incoming.imageRepeat||"no-repeat"),
  overlayOpacity:clampNumber(incoming.overlayOpacity,0,1,0),
  gradientToken,
  gradientType,
  gradientDirectionMode,
  gradientDirection:gradientDirectionMode==="preset"?presetDirection:gradientDirection,
 gradientStart:resolveCssColor(incoming.gradientStart)||"#cfdcc8",
  gradientEnd:resolveCssColor(incoming.gradientEnd)||"#b7c9ad",
  gradientStartStop:clampNumber(incoming.gradientStartStop,0,100,0),
  gradientEndStop:clampNumber(incoming.gradientEndStop,0,100,100)
 };
};

const normalizeThemeColors=(incomingThemeColors={},rootThemeColors={})=>{
 const normalized=themeTokens.reduce((acc,token)=>{
  const incomingToken=incomingThemeColors?.[token];

  if(themeFontTokens.includes(token)){
   acc[token]={
    fontName:typeof incomingToken==="object"&&incomingToken!==null?String(incomingToken.fontName||""):"",
    fallbackFont:typeof incomingToken==="object"&&incomingToken!==null?String(incomingToken.fallbackFont||""):""
   };
  }else if(gradientTokens.includes(token)){
   acc[token]=typeof incomingToken==="string"?incomingToken:String(incomingToken?.value||rootThemeColors[token]||"");
  }else{
   const incomingValue=typeof incomingToken==="string"?incomingToken:incomingToken?.value;
   const incomingColorName=typeof incomingToken==="object"&&incomingToken!==null?String(incomingToken.colorName||""):"";
   acc[token]={
    value:resolveCssColor(incomingValue)||rootThemeColors[token]||"#000000",
    colorName:incomingColorName
   };
  }

  return acc;
 },{});

 return {
  ...normalized,
  backgroundTreatment:normalizeBackgroundTreatment(incomingThemeColors?.backgroundTreatment)
 };
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
 taxRates=[],
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
 const [showBusinessTypeModal,setShowBusinessTypeModal]=useState(false);
 const [showReceiptTemplateModal,setShowReceiptTemplateModal]=useState(false);
 const [showReceiptHeaderModal,setShowReceiptHeaderModal]=useState(false);
 const [showReceiptSubHeaderModal,setShowReceiptSubHeaderModal]=useState(false);
 const [showReceiptFooterModal,setShowReceiptFooterModal]=useState(false);
 const [businessTypeRows,setBusinessTypeRows]=useState([]);
 const [backgroundImageInputKey,setBackgroundImageInputKey]=useState(0);

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
 const taxRateOptions=normalizeOptions(taxRates);

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
   taxRateRef:getObjectId(initialData?.taxRateRef),
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
   themeColors:normalizeThemeColors(initialData?.themeColors,currentRootThemeColors)
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

 const handleBackgroundTreatmentChange=(key,value)=>{
  setFormData(prev=>({
   ...prev,
   themeColors:{
    ...(prev.themeColors||{}),
    backgroundTreatment:{
     ...defaultBackgroundTreatment,
     ...(prev.themeColors?.backgroundTreatment||{}),
     [key]:key==="imageOpacity"||key==="overlayOpacity"
      ?clampNumber(value,0,1,0)
      :value
    }
   }
  }));
 };

 const buildGradientValue=treatment=>{
  const normalizedTreatment=normalizeBackgroundTreatment(treatment);

  if(normalizedTreatment.gradientType==="radial"){
   return `radial-gradient(circle,${normalizedTreatment.gradientStart} ${normalizedTreatment.gradientStartStop}%,${normalizedTreatment.gradientEnd} ${normalizedTreatment.gradientEndStop}%)`;
  }

  return `linear-gradient(${normalizedTreatment.gradientDirection},${normalizedTreatment.gradientStart} ${normalizedTreatment.gradientStartStop}%,${normalizedTreatment.gradientEnd} ${normalizedTreatment.gradientEndStop}%)`;
 };

 const handleGradientTreatmentChange=(key,value)=>{
  setFormData(prev=>{
   const nextTreatment=normalizeBackgroundTreatment({
    ...(prev.themeColors?.backgroundTreatment||{}),
    mode:"gradient",
    [key]:key==="gradientStartStop"||key==="gradientEndStop"
     ?clampNumber(value,0,100,key==="gradientStartStop"?0:100)
     :value
   });
   const nextGradient=buildGradientValue(nextTreatment);

   return {
    ...prev,
    themeColors:{
     ...(prev.themeColors||{}),
     backgroundTreatment:nextTreatment,
     [nextTreatment.gradientToken]:nextGradient
    }
   };
  });
 };

 const handleBackgroundImageChange=e=>{
  const file=e.target.files?.[0];
  if(!file)return;

  const reader=new FileReader();

  reader.onload=()=>{
   handleBackgroundTreatmentChange("mode","image");
   handleBackgroundTreatmentChange("image",String(reader.result||""));
  };

  reader.readAsDataURL(file);
 };

 const removeBackgroundImage=()=>{
  handleBackgroundTreatmentChange("image","");
  setBackgroundImageInputKey(current=>current+1);
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

 const buildThemePayload=currentRootThemeColors=>{
  const payload=themeTokens.reduce((acc,token)=>{
   if(themeFontTokens.includes(token)){
    acc[token]={
     fontName:String(formData.themeColors?.[token]?.fontName||""),
     fallbackFont:String(formData.themeColors?.[token]?.fallbackFont||"")
    };
   }else if(gradientTokens.includes(token)){
    acc[token]=String(formData.themeColors?.[token]||currentRootThemeColors[token]||"").trim();
   }else{
    acc[token]={
     value:resolveCssColor(formData.themeColors?.[token]?.value)||currentRootThemeColors[token]||"#000000",
     colorName:String(formData.themeColors?.[token]?.colorName||"")
    };
   }
   return acc;
  },{});

  return {
   ...payload,
   backgroundTreatment:normalizeBackgroundTreatment(formData.themeColors?.backgroundTreatment)
  };
 };

 const handleSubmit=e=>{
  e.preventDefault();
  const currentRootThemeColors=getRootThemeColors();
  const payload={
   ...formData,
   typeRef:getObjectId(formData.typeRef)||null,
   taxRateRef:getObjectId(formData.taxRateRef)||null,
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
   themeColors:buildThemePayload(currentRootThemeColors)
  };
  onSubmit&&onSubmit(payload);
 };

 const backgroundTreatment=normalizeBackgroundTreatment(formData.themeColors?.backgroundTreatment);

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
            <SortedSelect
             name="typeRef"
             value={formData.typeRef}
             onChange={handleChange}
             options={businessTypeOptions}
             getValue={getOptionValue}
             getLabel={getOptionLabel}
             placeholder="Select Business Type"
             required
            />
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
           <Form.Control
            type="text"
            name="logo"
            value={formData.logo}
            onChange={handleChange}
           />
          </InlineField>
         </Col>
         <Col md={3}>
          <InlineField label="Tax Rate" labelMd={5} inputMd={7}>
           <SortedSelect
            name="taxRateRef"
            value={formData.taxRateRef}
            onChange={handleChange}
            options={taxRateOptions}
            getValue={getOptionValue}
            getLabel={(item)=>`${item?.name||item?.code||getOptionLabel(item)}${item?.rate!==undefined?` (${item.rate}%)`:""}`}
            placeholder="Select Tax Rate"
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
           <SortedSelect
            name="stateRef"
            value={formData.stateRef}
            onChange={handleChange}
            options={stateOptions}
            getValue={getOptionValue}
            getLabel={getOptionLabel}
            placeholder="Select State"
           />
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
           <SortedSelect
            name="countryRef"
            value={formData.countryRef}
            onChange={handleChange}
            options={countryOptions}
            getValue={getOptionValue}
            getLabel={getOptionLabel}
            placeholder="Select Country"
           />
          </InlineField>
         </Col>
         <Col md={6}>
          <InlineField label="County" labelMd={4} inputMd={8}>
           <SortedSelect
            name="countyRef"
            value={formData.countyRef}
            onChange={handleChange}
            options={countyOptions}
            getValue={getOptionValue}
            getLabel={getOptionLabel}
            placeholder="Select County"
           />
          </InlineField>
         </Col>

         <Col md={6}>
          <InlineField label="Tagline" labelMd={4} inputMd={8}>
           <SortedSelect
            name="taglineId"
            value={formData.taglineId}
            onChange={handleChange}
            options={taglineOptions}
            getValue={getOptionValue}
            getLabel={getOptionLabel}
            placeholder="Select Tagline"
           />
          </InlineField>
         </Col>
         <Col md={6}>
          <InlineField label="Footer" labelMd={4} inputMd={8}>
           <SortedSelect
            name="footerId"
            value={formData.footerId}
            onChange={handleChange}
            options={footerOptions}
            getValue={getOptionValue}
            getLabel={getOptionLabel}
            placeholder="Select Footer"
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

     <Tab eventKey="theme" title="Theme Colors">
      <Card className="border-0 shadow-sm mb-3">
       <Card.Header className="bg-white fw-bold">Background Treatment</Card.Header>
       <Card.Body>
        <Row>
         <Col md={4}>
          <InlineField label="Mode" labelMd={4} inputMd={8}>
           <Form.Select
            value={backgroundTreatment.mode}
            onChange={(e)=>handleBackgroundTreatmentChange("mode",e.target.value)}
           >
            <option value="color">Color</option>
            <option value="gradient">Gradient</option>
            <option value="image">Image</option>
           </Form.Select>
          </InlineField>
         </Col>

         <Col md={8}>
          <InlineField label="Gradient Target" labelMd={3} inputMd={9}>
           <Form.Select
            value={backgroundTreatment.gradientToken}
            onChange={(e)=>handleGradientTreatmentChange("gradientToken",e.target.value)}
           >
            <option value="gradientSoft">Gradient Soft</option>
            <option value="gradientMain">Gradient Main</option>
           </Form.Select>
          </InlineField>
         </Col>

         <Col md={4}>
          <InlineField label="Gradient Type" labelMd={5} inputMd={7}>
           <Form.Select
            value={backgroundTreatment.gradientType}
            onChange={(e)=>handleGradientTreatmentChange("gradientType",e.target.value)}
           >
            <option value="linear">Linear</option>
            <option value="radial">Radial</option>
           </Form.Select>
          </InlineField>
         </Col>

         <Col md={4}>
          <InlineField label="Direction" labelMd={5} inputMd={7}>
           <div className="business-theme-gradient-direction">
            <Form.Select
             value={backgroundTreatment.gradientDirectionMode}
             disabled={backgroundTreatment.gradientType==="radial"}
             onChange={(e)=>handleGradientTreatmentChange("gradientDirectionMode",e.target.value)}
            >
             <option value="preset">Preset</option>
             <option value="custom">Custom</option>
            </Form.Select>

            {backgroundTreatment.gradientDirectionMode==="custom" ? (
             <Form.Control
              type="text"
              value={backgroundTreatment.gradientDirection}
              placeholder="180deg or to right"
              disabled={backgroundTreatment.gradientType==="radial"}
              onChange={(e)=>handleGradientTreatmentChange("gradientDirection",e.target.value)}
             />
            ) : (
             <Form.Select
              value={backgroundTreatment.gradientDirection}
              disabled={backgroundTreatment.gradientType==="radial"}
              onChange={(e)=>handleGradientTreatmentChange("gradientDirection",e.target.value)}
             >
              {gradientDirectionOptions.map(option=>(
               <option key={option.value} value={option.value}>
                {option.label}
               </option>
              ))}
             </Form.Select>
            )}
           </div>
          </InlineField>
         </Col>

         <Col md={4}>
          <InlineField label="Preview" labelMd={4} inputMd={8}>
           <div
            className="business-theme-gradient-preview"
            style={{background:buildGradientValue(backgroundTreatment)}}
           />
          </InlineField>
         </Col>

         <Col md={6}>
          <InlineField label="Start Color" labelMd={4} inputMd={8}>
           <div className="business-theme-gradient-color-row">
            <Form.Control
             type="color"
             value={backgroundTreatment.gradientStart}
             onChange={(e)=>handleGradientTreatmentChange("gradientStart",e.target.value)}
            />
            <Form.Control
             type="text"
             value={backgroundTreatment.gradientStart}
             onChange={(e)=>handleGradientTreatmentChange("gradientStart",e.target.value)}
            />
            <Form.Control
             type="number"
             min="0"
             max="100"
             step="1"
             value={backgroundTreatment.gradientStartStop}
             onChange={(e)=>handleGradientTreatmentChange("gradientStartStop",e.target.value)}
            />
           </div>
          </InlineField>
         </Col>

         <Col md={6}>
          <InlineField label="End Color" labelMd={4} inputMd={8}>
           <div className="business-theme-gradient-color-row">
            <Form.Control
             type="color"
             value={backgroundTreatment.gradientEnd}
             onChange={(e)=>handleGradientTreatmentChange("gradientEnd",e.target.value)}
            />
            <Form.Control
             type="text"
             value={backgroundTreatment.gradientEnd}
             onChange={(e)=>handleGradientTreatmentChange("gradientEnd",e.target.value)}
            />
            <Form.Control
             type="number"
             min="0"
             max="100"
             step="1"
             value={backgroundTreatment.gradientEndStop}
             onChange={(e)=>handleGradientTreatmentChange("gradientEndStop",e.target.value)}
            />
           </div>
          </InlineField>
         </Col>

         <Col md={8}>
          <InlineField label="Image" labelMd={2} inputMd={10}>
           <div className="business-theme-bg-picker">
            <div className="business-theme-bg-picker-control">
             <Form.Control
              key={backgroundImageInputKey}
              type="file"
              accept="image/*"
              onChange={handleBackgroundImageChange}
             />
             {backgroundTreatment.image&&(
              <Button
               type="button"
               variant="outline-danger"
               onClick={removeBackgroundImage}
              >
               Remove
              </Button>
             )}
            </div>

            {backgroundTreatment.image?(
             <div className="business-theme-bg-preview">
              <img src={backgroundTreatment.image} alt="Selected background preview" />
              <div className="business-theme-bg-path">{backgroundTreatment.image}</div>
             </div>
            ):(
             <div className="business-theme-bg-empty">No background image selected.</div>
            )}
           </div>
          </InlineField>
         </Col>

         <Col md={4}>
          <InlineField label="Image Opacity" labelMd={5} inputMd={7}>
           <Form.Control
            type="number"
            min="0"
            max="1"
            step="0.01"
            value={backgroundTreatment.imageOpacity}
            onChange={(e)=>handleBackgroundTreatmentChange("imageOpacity",e.target.value)}
           />
          </InlineField>
         </Col>

         <Col md={4}>
          <InlineField label="Image Size" labelMd={5} inputMd={7}>
           <Form.Select
            value={backgroundTreatment.imageSize}
            onChange={(e)=>handleBackgroundTreatmentChange("imageSize",e.target.value)}
           >
            <option value="cover">Cover</option>
            <option value="contain">Contain</option>
            <option value="auto">Auto</option>
           </Form.Select>
          </InlineField>
         </Col>

         <Col md={4}>
          <InlineField label="Image Repeat" labelMd={5} inputMd={7}>
           <Form.Select
            value={backgroundTreatment.imageRepeat}
            onChange={(e)=>handleBackgroundTreatmentChange("imageRepeat",e.target.value)}
           >
            <option value="no-repeat">No Repeat</option>
            <option value="repeat">Repeat</option>
            <option value="repeat-x">Repeat X</option>
            <option value="repeat-y">Repeat Y</option>
           </Form.Select>
          </InlineField>
         </Col>

         <Col md={6}>
          <InlineField label="Image Position" labelMd={4} inputMd={8}>
           <Form.Control
            type="text"
            value={backgroundTreatment.imagePosition}
            placeholder="center"
            onChange={(e)=>handleBackgroundTreatmentChange("imagePosition",e.target.value)}
           />
          </InlineField>
         </Col>

         <Col md={6}>
          <InlineField label="Overlay Opacity" labelMd={4} inputMd={8}>
           <Form.Control
            type="number"
            min="0"
            max="1"
            step="0.01"
            value={backgroundTreatment.overlayOpacity}
            onChange={(e)=>handleBackgroundTreatmentChange("overlayOpacity",e.target.value)}
           />
          </InlineField>
         </Col>
        </Row>
       </Card.Body>
      </Card>

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

          const resolvedValue=resolveCssColor(formData.themeColors?.[token]?.value)||rootThemeColors[token]||"#000000";
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
              <SortedSelect
               name="receiptTemplateId"
               value={formData.receiptTemplateId}
               onChange={handleChange}
               options={receiptTemplateOptions}
               getValue={getOptionValue}
               getLabel={getOptionLabel}
               placeholder="Select Receipt Template"
              />
              <Button type="button" variant="outline-primary" onClick={()=>setShowReceiptTemplateModal(true)}>Add</Button>
             </InputGroup>
            </InlineField>
           </Col>

           <Col md={12}>
            <InlineField label="Receipt Header" labelMd={2} inputMd={10}>
             <InputGroup>
              <SortedSelect
               name="receiptHeaderId"
               value={formData.receiptHeaderId}
               onChange={handleChange}
               options={receiptHeaderOptions}
               getValue={getOptionValue}
               getLabel={getOptionLabel}
               placeholder="Select Receipt Header"
              />
              <Button type="button" variant="outline-primary" onClick={()=>setShowReceiptHeaderModal(true)}>Add</Button>
             </InputGroup>
            </InlineField>
           </Col>

           <Col md={12}>
            <InlineField label="Receipt Sub Header" labelMd={2} inputMd={10}>
             <InputGroup>
              <SortedSelect
               name="receiptSubHeaderId"
               value={formData.receiptSubHeaderId}
               onChange={handleChange}
               options={receiptSubHeaderOptions}
               getValue={getOptionValue}
               getLabel={getOptionLabel}
               placeholder="Select Receipt Sub Header"
              />
              <Button type="button" variant="outline-primary" onClick={()=>setShowReceiptSubHeaderModal(true)}>Add</Button>
             </InputGroup>
            </InlineField>
           </Col>

           <Col md={12}>
            <InlineField label="Receipt Footer" labelMd={2} inputMd={10}>
             <InputGroup>
              <SortedSelect
               name="receiptFooterId"
               value={formData.receiptFooterId}
               onChange={handleChange}
               options={receiptFooterOptions}
               getValue={getOptionValue}
               getLabel={getOptionLabel}
               placeholder="Select Receipt Footer"
              />
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
