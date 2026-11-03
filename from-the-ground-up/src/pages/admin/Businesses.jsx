import {useEffect,useMemo,useRef,useState} from "react";
import {Modal,Button} from "react-bootstrap";
import SortedList from "../../components/SortedList.jsx";
import BusinessesForm from "../forms/admin/BusinessesForm.jsx";
import ReceiptTemplateForm from "../forms/admin/receipt/ReceiptTemplateForm.jsx";
import ReceiptHeaderForm from "../forms/admin/receipt/ReceiptHeaderForm.jsx";
import ReceiptSubHeaderForm from "../forms/admin/receipt/ReceiptSubHeaderForm.jsx";
import ReceiptFooterForm from "../forms/admin/receipt/ReceiptFooterForm.jsx";
import {applyBusinessTheme} from "../../utils/applyBusinessTheme.js";
import "../../styles/businesses.css";

const themeTokenLabels={
 bg:"Background",
 bgAlt:"Background (Alt)",
 surface:"Surface",
 surface2:"Surface (Secondary)",
 text:"Text",
 textSoft:"Muted Text",
 textInverse:"Inverse Text",
 heading:"Heading",
 primary:"Primary",
 primaryHover:"Primary (Hover)",
 secondary:"Secondary",
 secondaryHover:"Secondary (Hover)",
 accent:"Accent",
 accentHover:"Accent (Hover)",
 accent2:"Accent Secondary",
 success:"Success",
 warning:"Warning",
 danger:"Danger",
 info:"Info",
 border:"Border",
 borderStrong:"Border (Strong)",
 gradientMain:"Gradient (Main)",
 gradientSoft:"Gradient (Soft)",
 overlay:"Overlay",
 tableStripe:"Table Stripe",
 selectionBg:"Selection Background",
 selectionText:"Selection Text",
 fontHeading:"Heading Font",
 fontBody:"Body Font"
};

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

const getFontStack=(fontName="",fallbackFont="")=>{
 const cleanFontName=String(fontName||"").trim();
 const cleanFallbackFont=String(fallbackFont||"").trim();

 if(cleanFontName&&cleanFallbackFont)return `${cleanFontName}, ${cleanFallbackFont}`;
 if(cleanFontName)return cleanFontName;
 if(cleanFallbackFont)return cleanFallbackFont;

 return "inherit";
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

const gradientDirectionLabels={
 "180deg":"Top to Bottom",
 "0deg":"Bottom to Top",
 "90deg":"Left to Right",
 "270deg":"Right to Left",
 "135deg":"Top Left to Bottom Right",
 "225deg":"Top Right to Bottom Left",
 "45deg":"Bottom Left to Top Right",
 "315deg":"Bottom Right to Top Left"
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
 const gradientDirection=String(incoming.gradientDirection||defaultBackgroundTreatment.gradientDirection);
 const presetDirection=gradientDirectionLabels[gradientDirection]?gradientDirection:defaultBackgroundTreatment.gradientDirection;

 return {
  mode,
  image:String(incoming.image||""),
  imageOpacity:clampNumber(incoming.imageOpacity,0,1,defaultBackgroundTreatment.imageOpacity),
  imageSize:String(incoming.imageSize||defaultBackgroundTreatment.imageSize),
  imagePosition:String(incoming.imagePosition||defaultBackgroundTreatment.imagePosition),
  imageRepeat:String(incoming.imageRepeat||defaultBackgroundTreatment.imageRepeat),
  overlayOpacity:clampNumber(incoming.overlayOpacity,0,1,defaultBackgroundTreatment.overlayOpacity),
  gradientToken,
  gradientType,
  gradientDirectionMode,
  gradientDirection:gradientDirectionMode==="preset"?presetDirection:gradientDirection,
  gradientStart:String(incoming.gradientStart||defaultBackgroundTreatment.gradientStart),
  gradientEnd:String(incoming.gradientEnd||defaultBackgroundTreatment.gradientEnd),
  gradientStartStop:clampNumber(incoming.gradientStartStop,0,100,defaultBackgroundTreatment.gradientStartStop),
  gradientEndStop:clampNumber(incoming.gradientEndStop,0,100,defaultBackgroundTreatment.gradientEndStop)
 };
};

const buildGradientValue=treatment=>{
 const normalizedTreatment=normalizeBackgroundTreatment(treatment);

 if(normalizedTreatment.gradientType==="radial"){
  return `radial-gradient(circle,${normalizedTreatment.gradientStart} ${normalizedTreatment.gradientStartStop}%,${normalizedTreatment.gradientEnd} ${normalizedTreatment.gradientEndStop}%)`;
 }

 return `linear-gradient(${normalizedTreatment.gradientDirection},${normalizedTreatment.gradientStart} ${normalizedTreatment.gradientStartStop}%,${normalizedTreatment.gradientEnd} ${normalizedTreatment.gradientEndStop}%)`;
};

const getBackgroundTreatmentPreviewStyle=treatment=>{
 const normalizedTreatment=normalizeBackgroundTreatment(treatment);

 if(normalizedTreatment.mode==="image"&&normalizedTreatment.image){
  return {
   backgroundColor:"var(--bg)",
   backgroundImage:`url("${normalizedTreatment.image}")`,
   backgroundSize:normalizedTreatment.imageSize,
   backgroundPosition:normalizedTreatment.imagePosition,
   backgroundRepeat:normalizedTreatment.imageRepeat
  };
 }

 if(normalizedTreatment.mode==="gradient"){
  return {background:buildGradientValue(normalizedTreatment)};
 }

 return {background:"var(--bg)"};
};

const buildDefaultThemeColors=()=>({
 ...themeColorTokens.reduce((acc,token)=>{
  acc[token]={value:"",colorName:""};
  return acc;
 },{}),
 ...themeFontTokens.reduce((acc,token)=>{
  acc[token]={fontName:"",fallbackFont:""};
  return acc;
 },{}),
 backgroundTreatment:{...defaultBackgroundTreatment}
});

const defaultFormData={
 legalName:"",
 code:"",
 slug:"",
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

const getRows=data=>{
 if(Array.isArray(data))return data;
 if(Array.isArray(data?.data))return data.data;
 if(Array.isArray(data?.businesses))return data.businesses;
 if(Array.isArray(data?.businessTypes))return data.businessTypes;
 if(Array.isArray(data?.taglines))return data.taglines;
 if(Array.isArray(data?.footers))return data.footers;
 if(Array.isArray(data?.receiptTemplates))return data.receiptTemplates;
 if(Array.isArray(data?.receiptHeaders))return data.receiptHeaders;
 if(Array.isArray(data?.receiptSubHeaders))return data.receiptSubHeaders;
 if(Array.isArray(data?.receiptFooters))return data.receiptFooters;
 if(Array.isArray(data?.states))return data.states;
 if(Array.isArray(data?.counties))return data.counties;
 if(Array.isArray(data?.countries))return data.countries;
 if(Array.isArray(data?.taxRates))return data.taxRates;
 return [];
};

const getObjectId=value=>{
 if(!value)return "";
 if(typeof value==="string")return value;
 if(typeof value==="object")return String(value?._id||value?.id||value?.value||"");
 return "";
};

const normalizeThemeColors=(themeColors={})=>{
 const normalized={};

 themeColorTokens.forEach(token=>{
  const item=themeColors?.[token];
  normalized[token]={
   value:typeof item==="object"&&item!==null?String(item.value||""):String(item||""),
   colorName:typeof item==="object"&&item!==null?String(item.colorName||""):""
  };
 });

 themeFontTokens.forEach(token=>{
  const item=themeColors?.[token];
  normalized[token]={
   fontName:typeof item==="object"&&item!==null?String(item.fontName||""):"",
   fallbackFont:typeof item==="object"&&item!==null?String(item.fallbackFont||""):""
  };
 });

 return {
  ...normalized,
  backgroundTreatment:normalizeBackgroundTreatment(themeColors?.backgroundTreatment)
 };
};

export default function Businesses(){
 const [businesses,setBusinesses]=useState([]);
 const [selectedId,setSelectedId]=useState("");
 const [loading,setLoading]=useState(true);
 const [saving,setSaving]=useState(false);
 const [error,setError]=useState("");
 const [rootThemeColors,setRootThemeColors]=useState({});
 const [showModal,setShowModal]=useState(false);
 const [modalMode,setModalMode]=useState("add");
 const [formInitialData,setFormInitialData]=useState(defaultFormData);
 const [businessTypes,setBusinessTypes]=useState([]);
 const [taxRates,setTaxRates]=useState([]);
 const [taglines,setTaglines]=useState([]);
 const [footers,setFooters]=useState([]);
 const [receiptTemplates,setReceiptTemplates]=useState([]);
 const [receiptHeaders,setReceiptHeaders]=useState([]);
 const [receiptSubHeaders,setReceiptSubHeaders]=useState([]);
 const [receiptFooters,setReceiptFooters]=useState([]);
 const [states,setStates]=useState([]);
 const [counties,setCounties]=useState([]);
 const [countries,setCountries]=useState([]);
 const [currentAppBusinessId,setCurrentAppBusinessId]=useState("");
 const businessItemRefs=useRef({});

 useEffect(()=>{
  const rootStyles=getComputedStyle(document.documentElement);
  const colors={};
  themeColorTokens.forEach(token=>{
   colors[token]=rootStyles.getPropertyValue(cssVarMap[token]||"").trim();
  });
  setRootThemeColors(colors);
 },[]);

 const unwrapBusiness=data=>{
  if(!data||typeof data!=="object")return null;
  if(data?.business&&typeof data.business==="object")return data.business;
  if(data?.data&&typeof data.data==="object"&&!Array.isArray(data.data))return data.data;
  return data;
 };

 const getRuntimeAppKey=()=>{
  const envKey=String(import.meta.env?.VITE_APP_KEY||"").trim().toLowerCase();
  if(envKey)return envKey;

  const configKey=String(window?.APP_CONFIG?.APP_KEY||"").trim().toLowerCase();
  if(configKey)return configKey;

  const meta=document.querySelector('meta[name="app-key"]');
  return String(meta?.getAttribute("content")||"").trim().toLowerCase();
 };

 const loadCurrentAppBusiness=async()=>{
  try{
   const appKey=getRuntimeAppKey();
   if(!appKey){
    setCurrentAppBusinessId("");
    return "";
   }

   const res=await fetch(`/api/app/current-business/${encodeURIComponent(appKey)}`,{
    headers:{"Content-Type":"application/json"}
   });

   if(!res.ok){
    setCurrentAppBusinessId("");
    return "";
   }

   const data=await res.json().catch(()=>null);
   const business=unwrapBusiness(data);
   const businessId=String(business?._id||business?.id||"");

   setCurrentAppBusinessId(businessId);
   return businessId;
  }catch{
   setCurrentAppBusinessId("");
   return "";
  }
 };

 const loadLookups=async()=>{
  try{
   const [
    businessTypeRes,
    taxRateRes,
    taglineRes,
    footerRes,
    receiptTemplateRes,
    receiptHeaderRes,
    receiptSubHeaderRes,
    receiptFooterRes,
    stateRes,
    countyRes,
    countryRes
   ]=await Promise.all([
    fetch("/api/business-types",{headers:{"Content-Type":"application/json"}}),
    fetch("/api/tax-rates",{headers:{"Content-Type":"application/json"}}),
    fetch("/api/taglines",{headers:{"Content-Type":"application/json"}}),
    fetch("/api/footers",{headers:{"Content-Type":"application/json"}}),
    fetch("/api/receipt-templates",{headers:{"Content-Type":"application/json"}}),
    fetch("/api/receipt-headers",{headers:{"Content-Type":"application/json"}}),
    fetch("/api/receipt-sub-headers",{headers:{"Content-Type":"application/json"}}),
    fetch("/api/receipt-footers",{headers:{"Content-Type":"application/json"}}),
    fetch("/api/states",{headers:{"Content-Type":"application/json"}}),
    fetch("/api/counties",{headers:{"Content-Type":"application/json"}}),
    fetch("/api/countries",{headers:{"Content-Type":"application/json"}})
   ]);

   const [
    businessTypeData,
    taxRateData,
    taglineData,
    footerData,
    receiptTemplateData,
    receiptHeaderData,
    receiptSubHeaderData,
    receiptFooterData,
    stateData,
    countyData,
    countryData
   ]=await Promise.all([
    businessTypeRes.ok?businessTypeRes.json():[],
    taxRateRes.ok?taxRateRes.json():[],
    taglineRes.ok?taglineRes.json():[],
    footerRes.ok?footerRes.json():[],
    receiptTemplateRes.ok?receiptTemplateRes.json():[],
    receiptHeaderRes.ok?receiptHeaderRes.json():[],
    receiptSubHeaderRes.ok?receiptSubHeaderRes.json():[],
    receiptFooterRes.ok?receiptFooterRes.json():[],
    stateRes.ok?stateRes.json():[],
    countyRes.ok?countyRes.json():[],
    countryRes.ok?countryRes.json():[]
   ]);

   setBusinessTypes(getRows(businessTypeData));
   setTaxRates(getRows(taxRateData));
   setTaglines(getRows(taglineData));
   setFooters(getRows(footerData));
   setReceiptTemplates(getRows(receiptTemplateData));
   setReceiptHeaders(getRows(receiptHeaderData));
   setReceiptSubHeaders(getRows(receiptSubHeaderData));
   setReceiptFooters(getRows(receiptFooterData));
   setStates(getRows(stateData));
   setCounties(getRows(countyData));
   setCountries(getRows(countryData));
  }catch{
   setBusinessTypes([]);
   setTaxRates([]);
   setTaglines([]);
   setFooters([]);
   setReceiptTemplates([]);
   setReceiptHeaders([]);
   setReceiptSubHeaders([]);
   setReceiptFooters([]);
   setStates([]);
   setCounties([]);
   setCountries([]);
  }
 };

 const reloadReceiptTemplates=async()=>{
  try{
   const res=await fetch("/api/receipt-templates",{headers:{"Content-Type":"application/json"}});
   const data=res.ok?await res.json():[];
   setReceiptTemplates(getRows(data));
  }catch{
   setReceiptTemplates([]);
  }
 };

 const reloadReceiptHeaders=async()=>{
  try{
   const res=await fetch("/api/receipt-headers",{headers:{"Content-Type":"application/json"}});
   const data=res.ok?await res.json():[];
   setReceiptHeaders(getRows(data));
  }catch{
   setReceiptHeaders([]);
  }
 };

 const reloadReceiptSubHeaders=async()=>{
  try{
   const res=await fetch("/api/receipt-sub-headers",{headers:{"Content-Type":"application/json"}});
   const data=res.ok?await res.json():[];
   setReceiptSubHeaders(getRows(data));
  }catch{
   setReceiptSubHeaders([]);
  }
 };

 const reloadReceiptFooters=async()=>{
  try{
   const res=await fetch("/api/receipt-footers",{headers:{"Content-Type":"application/json"}});
   const data=res.ok?await res.json():[];
   setReceiptFooters(getRows(data));
  }catch{
   setReceiptFooters([]);
  }
 };

 const loadBusinesses=async(preferredBusinessId="")=>{
  try{
   setLoading(true);
   setError("");
   const res=await fetch("/api/businesses",{headers:{"Content-Type":"application/json"}});
   if(!res.ok)throw new Error("Failed to load businesses.");
   const data=await res.json();
   const rows=getRows(data);
   const normalizedRows=rows.map(business=>({
   ...business,
    themeColors:normalizeThemeColors(business?.themeColors)
   }));
   setBusinesses(normalizedRows);

   if(normalizedRows.length>0){
    const preferredId=String(preferredBusinessId||currentAppBusinessId||selectedId||"");
    const currentExists=preferredId?normalizedRows.some(b=>String(b?._id||b?.id||"")===preferredId):false;
    if(currentExists){
     setSelectedId(preferredId);
    }else{
     setSelectedId(String(normalizedRows[0]?._id||normalizedRows[0]?.id||""));
    }
   }else{
    setSelectedId("");
   }
  }catch(err){
   setError(err.message||"Unable to load businesses.");
   setBusinesses([]);
  }finally{
   setLoading(false);
  }
 };

 useEffect(()=>{
  const init=async()=>{
   const currentBusinessId=await loadCurrentAppBusiness();
   await Promise.all([
    loadLookups(),
    loadBusinesses(currentBusinessId)
   ]);
  };
  init();
 },[]);

 useEffect(()=>{
  if(Object.keys(rootThemeColors).length>0){
   loadBusinesses(currentAppBusinessId);
  }
 },[rootThemeColors,currentAppBusinessId]);

 useEffect(()=>{
  const targetId=String(selectedId||currentAppBusinessId||"");
  if(!targetId)return;
  const node=businessItemRefs.current[targetId];
  if(node){
   node.scrollIntoView({block:"nearest",inline:"nearest",behavior:"smooth"});
  }
 },[selectedId,currentAppBusinessId,businesses]);

 const selectedBusiness=useMemo(()=>{
  return businesses.find(b=>String(b?._id||b?.id||"")===String(selectedId))||null;
 },[businesses,selectedId]);

 const mappedThemeColors=useMemo(()=>{
 return themeColorTokens.map(token=>({
  token,
  label:themeTokenLabels[token]||token,
   value:selectedBusiness?.themeColors?.[token]?.value||"",
   name:selectedBusiness?.themeColors?.[token]?.colorName||""
  })).filter(item=>item.value);
 },[selectedBusiness]);

 const mappedThemeFonts=useMemo(()=>{
  return themeFontTokens.map(token=>({
   token,
   label:themeTokenLabels[token]||token,
   fontName:selectedBusiness?.themeColors?.[token]?.fontName||"",
   fallbackFont:selectedBusiness?.themeColors?.[token]?.fallbackFont||""
  })).filter(item=>item.fontName||item.fallbackFont);
 },[selectedBusiness]);

 const selectedBackgroundTreatment=useMemo(()=>{
  return normalizeBackgroundTreatment(selectedBusiness?.themeColors?.backgroundTreatment);
 },[selectedBusiness]);

 const openAddModal=()=>{
  setModalMode("add");
  setFormInitialData({
   ...defaultFormData,
   themeColors:{
    ...buildDefaultThemeColors()
   }
  });
  setShowModal(true);
 };

 const openEditModal=()=>{
  if(!selectedBusiness)return;
  setModalMode("edit");
  setFormInitialData({
   ...defaultFormData,
   ...selectedBusiness,
   typeRef:getObjectId(selectedBusiness?.typeRef),
   taxRateRef:getObjectId(selectedBusiness?.taxRateRef),
   taglineId:getObjectId(selectedBusiness?.taglineId),
   footerId:getObjectId(selectedBusiness?.footerId),
   receiptTemplateId:getObjectId(selectedBusiness?.receiptTemplateId),
   receiptHeaderId:getObjectId(selectedBusiness?.receiptHeaderId),
   receiptSubHeaderId:getObjectId(selectedBusiness?.receiptSubHeaderId),
   receiptFooterId:getObjectId(selectedBusiness?.receiptFooterId),
   stateRef:getObjectId(selectedBusiness?.stateRef),
   countyRef:getObjectId(selectedBusiness?.countyRef),
   countryRef:getObjectId(selectedBusiness?.countryRef),
   themeColors:normalizeThemeColors(selectedBusiness?.themeColors)
  });
  setShowModal(true);
 };

 const closeModal=()=>{
  if(saving)return;
  setShowModal(false);
 };

 const handleSave=async(payload)=>{
  try{
   setSaving(true);
   setError("");

   const isEdit=modalMode==="edit"&&selectedBusiness?._id;
   const url=isEdit?`/api/businesses/${selectedBusiness._id}`:"/api/businesses";
   const method=isEdit?"PUT":"POST";

   const res=await fetch(url,{
    method,
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({
     ...payload,
     typeRef:payload?.typeRef||"",
     taxRateRef:payload?.taxRateRef||null,
     themeColors:payload?.themeColors&&typeof payload.themeColors==="object"?payload.themeColors:{}
    })
   });

   if(!res.ok){
    const errData=await res.json().catch(()=>null);
    throw new Error(errData?.message||`Failed to ${isEdit?"update":"save"} business.`);
   }

   const saveData=await res.json().catch(()=>null);
   const saveBusiness=unwrapBusiness(saveData);
   const savedId=String(saveBusiness?._id||saveData?._id||saveData?.data?._id||saveData?.business?._id||selectedBusiness?._id||"");

   if(!savedId)throw new Error("Business id not found after save.");

   const themeRes=await fetch(`/api/businesses/${savedId}`,{
    headers:{"Content-Type":"application/json"}
   });

   if(!themeRes.ok)throw new Error("Failed to load saved business theme.");

   const themeData=await themeRes.json().catch(()=>null);
   const themeBusiness=unwrapBusiness(themeData);

   if(!themeBusiness?._id)throw new Error("Saved business theme data is invalid.");

   applyBusinessTheme(themeBusiness);

   await loadBusinesses(savedId);

   setSelectedId(savedId);
   setShowModal(false);

   window.location.reload();
  }catch(err){
   setError(err.message||"Unable to save business.");
  }finally{
   setSaving(false);
  }
 };

 const formatPhone=value=>{
  if(!value)return "-";
  const digits=String(value).replace(/\D/g,"");
  if(digits.length===10)return `(${digits.slice(0,3)}) ${digits.slice(3,6)} - ${digits.slice(6)}`;
  if(digits.length===11&&digits.startsWith("1"))return `+1 (${digits.slice(1,4)}) ${digits.slice(4,7)} - ${digits.slice(7)}`;
  return String(value);
 };

 const formatValue=value=>{
  if(value===null||value===undefined||value==="")return "-";
  if(typeof value==="object")return value?.name||value?.legalName||value?.content||value?._id||"-";
  return String(value);
 };

 const hasValue=value=>{
  if(value===null||value===undefined||value==="")return false;
  if(typeof value==="object"){
   return Boolean(value?._id||value?.id||value?.name||value?.legalName||value?.content||value?.title);
  }
  return true;
 };

 const hasReceiptData=business=>{
  if(!business)return false;
  return [
   business.receiptTemplateId,
   business.receiptHeaderId,
   business.receiptSubHeaderId,
   business.receiptFooterId
  ].some(hasValue);
 };

 const hasHeaderData=business=>{
  if(!business)return false;
  return [
   business.receiptTemplateId,
   business.receiptHeaderId,
   business.receiptSubHeaderId,
   business.taglineId
  ].some(hasValue);
 };

 const hasFooterData=business=>{
  if(!business)return false;
  return [
   business.receiptFooterId,
   business.footerId
  ].some(hasValue);
 };

 const hasReceiptOptionData=business=>{
  if(!business)return false;
  return business.receiptsEnabled!==false&&hasReceiptData(business);
 };

 const formatTaxRate=business=>{
  const rate=business?.taxRateRef?.rate;

  if(rate===null||rate===undefined||rate==="")return "-";

  return `${Number(rate).toFixed(3)}%`;
 };

 const formatCityStateZip=business=>{
  if(!business)return "-";
  return[
   business.city,
   business.stateRef?.name||"",
   business.postalCode
  ].filter(Boolean).join(", ")||"-";
 };

 const formatCountyCountry=business=>{
  if(!business)return "-";
  return[
   business.countryRef?.name||"",
   business.countyRef?.name||""
  ].filter(Boolean).join(", ")||"-";
 };

 return(
  <div className="businesses-page">
   <div className="businesses-wrap">
    <div className="businesses-topbar">
     <div>
      <h1 className="businesses-title">Businesses</h1>
      <div className="businesses-subtitle">Select a business to view details, tax rates, theme colors, headers, and footers.</div>
     </div>
     <div className="d-flex align-items-center gap-2">
      <Button type="button" onClick={openAddModal}>Add Business</Button>
      <Button type="button" variant="outline-primary" onClick={openEditModal} disabled={!selectedBusiness}>Edit Business</Button>
      <div className="businesses-total">Total: <strong>{businesses.length}</strong></div>
     </div>
    </div>

    {error?<div className="businesses-alert businesses-alert-error">{error}</div>:null}

    <div className="businesses-grid">
     <section className="businesses-card">
      <div className="businesses-card-header">Businesses</div>
      <div className="businesses-list">
       {loading?(
        <div className="businesses-empty">Loading businesses...</div>
       ):(
        <SortedList
         items={businesses}
         getKey={(business)=>String(business?._id||business?.id||"")}
         getLabel={(business)=>business?.legalName||business?.code||""}
         wrapItems={false}
         renderItem={(business)=>{
         const id=String(business?._id||business?.id||"");
         const active=String(selectedId)===id;
         return(
          <button
           ref={node=>{
            if(node){
             businessItemRefs.current[id]=node;
            }else{
             delete businessItemRefs.current[id];
            }
           }}
           type="button"
           onClick={()=>setSelectedId(id)}
           className={`businesses-list-item${active?" active":""}`}
          >
           <div
            className="businesses-list-name"
            title={formatValue(business.legalName)}
           >
            {formatValue(business.legalName)}
           </div>
           <div className="businesses-list-meta">
            <span
             className="businesses-list-slug"
             title={formatValue(business.slug||business.code)}
            >
             {formatValue(business.slug||business.code)}
            </span>
            <div className="businesses-list-status-wrap">
             <span className={`businesses-status${business.isActive?" is-active":" is-inactive"}`}>{business.isActive?"Active":"Inactive"}</span>
            </div>
           </div>
          </button>
         );
        }}
        >
         <div className="businesses-empty">No businesses found.</div>
        </SortedList>
       )}
      </div>
     </section>

     <section className="businesses-card">
      <div className="businesses-card-header">Details</div>
      {!selectedBusiness?(
       <div className="businesses-empty">Select a business to view details.</div>
      ):(
       <div className="businesses-details">
        <div className="businesses-inline-list">
         <div className="businesses-inline-row"><span className="businesses-inline-label">Legal Name:</span><span className="businesses-inline-value">{formatValue(selectedBusiness.legalName)}</span></div>
         <div className="businesses-inline-row"><span className="businesses-inline-label">Code:</span><span className="businesses-inline-value">{formatValue(selectedBusiness.code)}</span></div>
         <div className="businesses-inline-row"><span className="businesses-inline-label">Business Type:</span><span className="businesses-inline-value">{formatValue(selectedBusiness.typeRef)}</span></div>
         <div className="businesses-inline-row"><span className="businesses-inline-label">Website:</span><span className="businesses-inline-value">{formatValue(selectedBusiness.website)}</span></div>
         <div className="businesses-inline-row"><span className="businesses-inline-label">Email:</span><span className="businesses-inline-value">{formatValue(selectedBusiness.email)}</span></div>
         <div className="businesses-inline-row">
          <span className="businesses-inline-label">Phone:</span>
          <span className="businesses-inline-value">{formatPhone(selectedBusiness.phone)}</span>
          <span className="businesses-inline-label">Fax:</span>
          <span className="businesses-inline-value">{formatPhone(selectedBusiness.fax)}</span>
         </div>
         <div className="businesses-inline-row"><span className="businesses-inline-label">Address 1:</span><span className="businesses-inline-value">{formatValue(selectedBusiness.addressLine1)}</span></div>
         <div className="businesses-inline-row"><span className="businesses-inline-label">Address 2:</span><span className="businesses-inline-value">{formatValue(selectedBusiness.addressLine2)}</span></div>
         <div className="businesses-inline-row"><span className="businesses-inline-label">City, State, Zip:</span><span className="businesses-inline-value">{formatCityStateZip(selectedBusiness)}</span></div>
         <div className="businesses-inline-row"><span className="businesses-inline-label">Country, County:</span><span className="businesses-inline-value">{formatCountyCountry(selectedBusiness)}</span></div>
         <div className="businesses-inline-row"><span className="businesses-inline-label">Notes:</span><span className="businesses-inline-value businesses-preline">{formatValue(selectedBusiness.notes)}</span></div>
        </div>
       </div>
      )}
     </section>

     <section className="businesses-card">
      <div className="businesses-card-header">Tax / Theme</div>
      {!selectedBusiness?(
       <div className="businesses-empty">Select a business to view tax and theme.</div>
      ):(
       <div className="businesses-sidepanel">
        <div className="businesses-panel-block">
         <h3>Tax Rate</h3>
         <div className="businesses-tax-rate">{formatTaxRate(selectedBusiness)}</div>
        </div>

        <div className="businesses-panel-block businesses-colors-panel">
         <h3>Theme Colors</h3>
         {mappedThemeColors.length>0?(
          <div className="businesses-colors-scroll">
           <div className="businesses-colors">
            {mappedThemeColors.map(item=>(
             <div key={item.token} className="businesses-color-card">
              <div className="businesses-color-main">
               <label>{item.label}</label>
               <div className="businesses-color-meta-row">
                <span className="businesses-color-token">{item.token}</span>
                <span className="businesses-color-value">{item.value}</span>
                <span className="businesses-color-name">{item.name||"-"}</span>
               </div>
              </div>
              <div className="businesses-color-preview-wrap">
               <div
                className="businesses-color-preview"
                style={{background:item.value}}
                title={item.value}
               />
              </div>
             </div>
            ))}
           </div>
          </div>
         ):(
          <div className="businesses-muted">No theme colors set.</div>
         )}
        </div>

        <div className="businesses-panel-block">
         <h3>Background Treatment</h3>
         <div className="businesses-background-actual-preview">
          <div
           className="businesses-background-preview"
           style={getBackgroundTreatmentPreviewStyle(selectedBackgroundTreatment)}
          >
           {selectedBackgroundTreatment.mode==="image"&&selectedBackgroundTreatment.overlayOpacity>0?(
            <div
             className="businesses-background-preview-overlay"
             style={{opacity:selectedBackgroundTreatment.overlayOpacity}}
            />
           ):null}
          </div>
          {selectedBackgroundTreatment.mode==="gradient"?(
           <div
            className="businesses-gradient-preview"
            style={{background:buildGradientValue(selectedBackgroundTreatment)}}
           >
            <span>Gradient Preview</span>
           </div>
          ):null}
          {selectedBackgroundTreatment.mode==="color"?(
           <div className="businesses-background-color-preview">
            <span>Background Color Preview</span>
           </div>
          ):null}
         </div>
         <div className="businesses-background-details">
          <div><strong>Mode:</strong> {selectedBackgroundTreatment.mode}</div>
          {selectedBackgroundTreatment.mode==="gradient"?(
           <>
            <div><strong>Target:</strong> {themeTokenLabels[selectedBackgroundTreatment.gradientToken]||selectedBackgroundTreatment.gradientToken}</div>
            <div><strong>Type:</strong> {selectedBackgroundTreatment.gradientType}</div>
            <div><strong>Direction:</strong> {selectedBackgroundTreatment.gradientDirectionMode==="preset"?(gradientDirectionLabels[selectedBackgroundTreatment.gradientDirection]||selectedBackgroundTreatment.gradientDirection):selectedBackgroundTreatment.gradientDirection}</div>
           </>
          ):null}
          {selectedBackgroundTreatment.mode==="image"?(
           <>
            <div><strong>Image:</strong> {selectedBackgroundTreatment.image?"Selected":"Not selected"}</div>
            <div><strong>Opacity:</strong> {selectedBackgroundTreatment.imageOpacity}</div>
            <div><strong>Size:</strong> {selectedBackgroundTreatment.imageSize}</div>
            <div><strong>Position:</strong> {selectedBackgroundTreatment.imagePosition}</div>
            <div><strong>Repeat:</strong> {selectedBackgroundTreatment.imageRepeat}</div>
           </>
          ):null}
         </div>
        </div>

        <div className="businesses-panel-block">
         <h3>Theme Fonts</h3>
         {mappedThemeFonts.length>0?(
          <div className="businesses-font-preview-list">
           {mappedThemeFonts.map(item=>{
            const fontStack=getFontStack(item.fontName,item.fallbackFont);

            return(
             <div key={item.token} className="businesses-font-preview-card">
              <div className="businesses-font-preview-meta">
               <span className="businesses-font-preview-label">{item.label}</span>
               <span className="businesses-font-preview-stack">{item.fontName||"-"}{item.fallbackFont?` / ${item.fallbackFont}`:""}</span>
              </div>
              <div
               className={`businesses-font-preview-sample ${item.token==="fontHeading"?"is-heading":"is-body"}`}
               style={{fontFamily:fontStack}}
              >
               {item.token==="fontHeading"?"Barrow Coffee Delights":"Freshly brewed coffee, warm pastries, and cozy café moments."}
              </div>
              <div
               className="businesses-font-preview-alphabet"
               style={{fontFamily:fontStack}}
              >
               Aa Bb Cc Dd Ee Ff Gg 1234567890
              </div>
             </div>
            );
           })}
          </div>
         ):(
          <div className="businesses-muted">No theme fonts set.</div>
         )}
        </div>
       </div>
      )}
     </section>
    </div>

    {selectedBusiness&&(hasHeaderData(selectedBusiness)||hasFooterData(selectedBusiness)||hasReceiptOptionData(selectedBusiness))?(
    <div className="businesses-grid businesses-grid-secondary">
     {hasHeaderData(selectedBusiness)?(
     <section className="businesses-card">
      <div className="businesses-card-header">Headers</div>
      <div className="businesses-sidepanel">
        <div className="businesses-panel-block">
         <div className="businesses-inline-list">
          {hasValue(selectedBusiness.receiptTemplateId)?(
           <div className="businesses-inline-row"><span className="businesses-inline-label">Receipt Template:</span><span className="businesses-inline-value">{formatValue(selectedBusiness.receiptTemplateId)}</span></div>
          ):null}
          {hasValue(selectedBusiness.receiptHeaderId)?(
           <div className="businesses-inline-row"><span className="businesses-inline-label">Receipt Header:</span><span className="businesses-inline-value">{formatValue(selectedBusiness.receiptHeaderId)}</span></div>
          ):null}
          {hasValue(selectedBusiness.receiptSubHeaderId)?(
           <div className="businesses-inline-row"><span className="businesses-inline-label">Receipt Sub Header:</span><span className="businesses-inline-value">{formatValue(selectedBusiness.receiptSubHeaderId)}</span></div>
          ):null}
          {hasValue(selectedBusiness.taglineId)?(
           <div className="businesses-inline-row"><span className="businesses-inline-label">Tagline:</span><span className="businesses-inline-value">{formatValue(selectedBusiness.taglineId)}</span></div>
          ):null}
         </div>
        </div>
       </div>
     </section>
     ):null}

     {hasFooterData(selectedBusiness)?(
     <section className="businesses-card">
      <div className="businesses-card-header">Footers</div>
       <div className="businesses-sidepanel">
        <div className="businesses-panel-block">
         <div className="businesses-inline-list">
          {hasValue(selectedBusiness.receiptFooterId)?(
           <div className="businesses-inline-row"><span className="businesses-inline-label">Receipt Footer:</span><span className="businesses-inline-value">{formatValue(selectedBusiness.receiptFooterId)}</span></div>
          ):null}
          {hasValue(selectedBusiness.footerId)?(
           <div className="businesses-inline-row"><span className="businesses-inline-label">Footer:</span><span className="businesses-inline-value">{formatValue(selectedBusiness.footerId)}</span></div>
          ):null}
         </div>
        </div>
       </div>
     </section>
     ):null}

     {hasReceiptOptionData(selectedBusiness)?(
     <section className="businesses-card">
      <div className="businesses-card-header">Receipt Options</div>
       <div className="businesses-sidepanel">
        <div className="businesses-panel-block">
         <div className="businesses-inline-list">
          <div className="businesses-inline-row"><span className="businesses-inline-label">Show Logo:</span><span className="businesses-inline-value">{selectedBusiness.showLogoOnReceipt?"Yes":"No"}</span></div>
          <div className="businesses-inline-row"><span className="businesses-inline-label">Show Tax Rate:</span><span className="businesses-inline-value">{selectedBusiness.showTaxRateOnReceipt?"Yes":"No"}</span></div>
          <div className="businesses-inline-row"><span className="businesses-inline-label">Show Website:</span><span className="businesses-inline-value">{selectedBusiness.showWebsiteOnReceipt?"Yes":"No"}</span></div>
          <div className="businesses-inline-row"><span className="businesses-inline-label">Show Email:</span><span className="businesses-inline-value">{selectedBusiness.showEmailOnReceipt?"Yes":"No"}</span></div>
          <div className="businesses-inline-row"><span className="businesses-inline-label">Show Phone:</span><span className="businesses-inline-value">{selectedBusiness.showPhoneOnReceipt?"Yes":"No"}</span></div>
          <div className="businesses-inline-row"><span className="businesses-inline-label">Show Fax:</span><span className="businesses-inline-value">{selectedBusiness.showFaxOnReceipt?"Yes":"No"}</span></div>
          <div className="businesses-inline-row"><span className="businesses-inline-label">Show Address:</span><span className="businesses-inline-value">{selectedBusiness.showAddressOnReceipt?"Yes":"No"}</span></div>
         </div>
        </div>
       </div>
     </section>
     ):null}
    </div>
    ):null}

    <Modal show={showModal} onHide={closeModal} size="xl" centered backdrop="static">
     <Modal.Header closeButton>
      <Modal.Title>{modalMode==="edit"?"Edit Business":"Add Business"}</Modal.Title>
     </Modal.Header>
     <Modal.Body>
      <BusinessesForm
       initialData={formInitialData}
       onSubmit={handleSave}
       loading={saving}
       businessTypes={businessTypes}
       taxRates={taxRates}
       taglines={taglines}
       footers={footers}
       receiptTemplates={receiptTemplates}
       receiptHeaders={receiptHeaders}
       receiptSubHeaders={receiptSubHeaders}
       receiptFooters={receiptFooters}
       states={states}
       counties={counties}
       countries={countries}
       renderReceiptTemplateForm={(props)=><ReceiptTemplateForm {...props} />}
       renderReceiptHeaderForm={(props)=><ReceiptHeaderForm {...props} />}
       renderReceiptSubHeaderForm={(props)=><ReceiptSubHeaderForm {...props} />}
       renderReceiptFooterForm={(props)=><ReceiptFooterForm {...props} />}
       reloadReceiptTemplates={reloadReceiptTemplates}
       reloadReceiptHeaders={reloadReceiptHeaders}
       reloadReceiptSubHeaders={reloadReceiptSubHeaders}
       reloadReceiptFooters={reloadReceiptFooters}
      />
     </Modal.Body>
    </Modal>
   </div>
  </div>
 );
}
