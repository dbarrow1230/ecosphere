import {useEffect,useMemo,useState} from "react";
import {Container,Row,Col,Card,Form,Button,Table,Modal,Alert,Spinner,Badge} from "react-bootstrap";
import ElectricityAccountForm from "./forms/ElectricityAccountForm";
import ElectricityBillForm from "./forms/ElectricityBillForm";
import "../styles/electricityAccount.css";

const accountInit={provider:"",accountNumber:"",meterNumber:"",nickname:"",isActive:true,notes:""};
const billInit={_id:"",billingStartDate:"",billingEndDate:"",nextBillingDate:"",averageDailyUse:"",budgetBilledToDate:"",actualBilledToDate:"",amountDue:"",amountPaid:"",billAttachment:"",billAttachmentFile:null,notes:"",newRead:{read:"",readType:"",readDate:""},priorRead:{read:"",readType:"",readDate:"",readDiff:""},lastBillingPeriod:{lastBillingSummary:"",totalCharges:"",payments:""},newCharges:{budgetBilledAmount:"",lateCharges:"",eapDiscount:"",dueDate:""},supplyCharges:{supply:"0.000",ratePerKwh:"0.000",merchantFunction:"",grtOtherTaxes:"",salestax:""},deliveryCharges:{basicService:"",delivery:"0.000",deliveryRate:"0.000",systemBenefitCharge:"0.000",grtOtherTaxes:"",salestax:""}};
const currentYear=new Date().getFullYear();
const currentMonth=new Date().getMonth()+1;
const monthOptions=[
 {value:"",label:"All Months"},
 {value:"1",label:"January"},
 {value:"2",label:"February"},
 {value:"3",label:"March"},
 {value:"4",label:"April"},
 {value:"5",label:"May"},
 {value:"6",label:"June"},
 {value:"7",label:"July"},
 {value:"8",label:"August"},
 {value:"9",label:"September"},
 {value:"10",label:"October"},
 {value:"11",label:"November"},
 {value:"12",label:"December"}
];
const pad2=v=>String(v).padStart(2,"0");

const getId=v=>v?._id||v?.id||"";

const parseDateParts=v=>{
 if(!v)return null;
 if(typeof v==="string"){
  const m=v.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if(m)return {year:Number(m[1]),month:Number(m[2]),day:Number(m[3])};
 }
 const d=new Date(v);
 if(Number.isNaN(d.getTime()))return null;
 return {year:d.getUTCFullYear(),month:d.getUTCMonth()+1,day:d.getUTCDate()};
};

const toDateInput=v=>{
 const p=parseDateParts(v);
 if(!p)return"";
 return `${p.year}-${pad2(p.month)}-${pad2(p.day)}`;
};

const formatDateDisplay=v=>{
 const p=parseDateParts(v);
 if(!p)return"-";
 return `${pad2(p.month)}/${pad2(p.day)}/${p.year}`;
};

const toNum=v=>{
 const n=Number(v);
 return Number.isNaN(n)?0:n;
};

const toMoney2=v=>{
 const n=Number(v);
 return Number.isNaN(n)?"0.00":n.toFixed(2);
};

const toMoney3=v=>{
 const n=Number(v);
 return Number.isNaN(n)?"0.000":n.toFixed(3);
};

const getRateValue=v=>{
 if(v==null)return 0;
 if(typeof v==="number")return v;
 if(typeof v==="string")return Number(v)||0;
 if(typeof v==="object"&&v.$numberDecimal!=null)return Number(v.$numberDecimal)||0;
 return Number(v)||0;
};

const getAccountsFromResponse=data=>{
 if(Array.isArray(data))return data;
 if(Array.isArray(data?.electricityAccounts))return data.electricityAccounts;
 if(Array.isArray(data?.accounts))return data.accounts;
 if(Array.isArray(data?.data))return data.data;
 return [];
};

const getRatesFromResponse=data=>{
 if(Array.isArray(data))return data;
 if(Array.isArray(data?.electricityRates))return data.electricityRates;
 if(Array.isArray(data?.rates))return data.rates;
 if(Array.isArray(data?.bills))return data.bills;
 if(Array.isArray(data?.data))return data.data;
 return [];
};

const getBillAccountId=bill=>{
 if(!bill)return"";
 if(typeof bill.electricityAccount==="string")return bill.electricityAccount;
 if(bill.electricityAccount?._id)return bill.electricityAccount._id;
 if(bill.electricityAccount?.id)return bill.electricityAccount.id;
 if(typeof bill.account==="string")return bill.account;
 if(bill.account?._id)return bill.account._id;
 if(bill.account?.id)return bill.account.id;
 return "";
};

const sortBillsNewest=(arr=[])=>[...arr].sort((a,b)=>
 new Date(b.billingEndDate||0)-new Date(a.billingEndDate||0)||
 new Date(b.billingStartDate||0)-new Date(a.billingStartDate||0)||
 new Date(b.createdAt||0)-new Date(a.createdAt||0)
);

const getBillYear=bill=>{
 const start=parseDateParts(bill?.billingStartDate);
 return start?start.year:null;
};

const getBillMonth=bill=>{
 const start=parseDateParts(bill?.billingStartDate);
 return start?start.month:null;
};

const getNestedValue=(obj,path,fb=0)=>{
 const v=path.split(".").reduce((a,k)=>a?.[k],obj);
 return v==null?fb:getRateValue(v);
};

const getSupplyRatePerKwh=bill=>{
 return getNestedValue(bill,"supplyCharges.ratePerKwh",getNestedValue(bill,"supplycharges.ratePerKwh",0));
};

const getSupplyChargeValue=(bill,path,fb=0)=>{
 return getNestedValue(bill,`supplyCharges.${path}`,getNestedValue(bill,`supplycharges.${path}`,fb));
};

const getPeriodDays=bill=>{
 const start=new Date(bill?.billingStartDate||0);
 const end=new Date(bill?.billingEndDate||0);
 const diff=Math.round((end-start)/(1000*60*60*24))+1;
 return Number.isNaN(diff)||diff<1?0:diff;
};

const getUsageValue=bill=>toNum(bill?.priorRead?.readDiff)||Math.round(getNestedValue(bill,"averageDailyUse",0)*getPeriodDays(bill));

const setNestedField=(obj,name,value)=>{
 const keys=name.split(".");
 const next={...obj};
 let cur=next;
 for(let i=0;i<keys.length-1;i++){
  cur[keys[i]]={...(cur[keys[i]]||{})};
  cur=cur[keys[i]];
 }
 cur[keys[keys.length-1]]=value;
 return next;
};

const SummaryGroup=({title,rows})=>(
 <div className="border rounded h-100 p-3 bg-body">
  <div className="fw-semibold mb-2">{title}</div>
  {rows.map((v,i)=>(
   <div key={`${title}-${i}`} className="d-flex justify-content-between gap-2 small mb-1">
    <span className="summary-label">{v.label}</span>
    <span>{v.value}</span>
   </div>
  ))}
 </div>
);

export default function ElectricityAccountPage(){
 const [accounts,setAccounts]=useState([]);
 const [selectedAccountId,setSelectedAccountId]=useState("");
 const [bills,setBills]=useState([]);
 const [accountForm,setAccountForm]=useState(accountInit);
 const [billForm,setBillForm]=useState(billInit);
 const [editAccountForm,setEditAccountForm]=useState(accountInit);
 const [editBillForm,setEditBillForm]=useState(billInit);
 const [showAddAccount,setShowAddAccount]=useState(false);
 const [showAddBill,setShowAddBill]=useState(false);
 const [showEditAccount,setShowEditAccount]=useState(false);
 const [showEditBill,setShowEditBill]=useState(false);
 const [showDeleteBill,setShowDeleteBill]=useState(false);
 const [billToDelete,setBillToDelete]=useState(null);
 const [loadingAccounts,setLoadingAccounts]=useState(false);
 const [loadingBills,setLoadingBills]=useState(false);
 const [savingAccount,setSavingAccount]=useState(false);
 const [savingBill,setSavingBill]=useState(false);
 const [updatingAccount,setUpdatingAccount]=useState(false);
 const [updatingBill,setUpdatingBill]=useState(false);
 const [deletingBill,setDeletingBill]=useState(false);
 const [error,setError]=useState("");
 const [success,setSuccess]=useState("");
 const [selectedYear,setSelectedYear]=useState(String(currentYear));
 const [selectedMonth,setSelectedMonth]=useState("");
 const [modalContainer,setModalContainer]=useState(null);

 const selectedAccount=useMemo(()=>accounts.find(v=>getId(v)===selectedAccountId)||null,[accounts,selectedAccountId]);
 const latestBill=useMemo(()=>sortBillsNewest(bills)[0]||null,[bills]);
 const latestBillWithRate=useMemo(()=>sortBillsNewest(bills).find(v=>getSupplyRatePerKwh(v)>0)||null,[bills]);

 const yearOptions=useMemo(()=>{
  const years=[...new Set([currentYear,...bills.map(v=>getBillYear(v)).filter(Boolean)])].sort((a,b)=>b-a);
  return years;
 },[bills]);

 const filteredBills=useMemo(()=>{
  const year=Number(selectedYear);
  const month=Number(selectedMonth);
  return bills.filter(v=>{
   const billYear=getBillYear(v);
   const billMonth=getBillMonth(v);
   if(year&&billYear!==year)return false;
   if(month&&billMonth!==month)return false;
   return true;
  });
 },[bills,selectedYear,selectedMonth]);

 const summaryData=useMemo(()=>{
  const rows=filteredBills;
  const count=rows.length||1;
  const avgDaily=rows.reduce((a,v)=>a+getNestedValue(v,"averageDailyUse",0),0)/count;
  const budget=rows.reduce((a,v)=>a+toNum(v?.budgetBilledToDate),0);
  const actual=rows.reduce((a,v)=>a+toNum(v?.actualBilledToDate),0);
  const diff=actual-budget;
  const supply=rows.reduce((a,v)=>a+getNestedValue(v,"supplyCharges.supply",0),0);
  const merchantFunction=rows.reduce((a,v)=>a+getSupplyChargeValue(v,"merchantFunction",0),0);
  const supplyGrt=rows.reduce((a,v)=>a+getSupplyChargeValue(v,"grtOtherTaxes",0),0);
  const supplyTax=rows.reduce((a,v)=>a+getSupplyChargeValue(v,"salestax",0),0);
  const basicService=rows.reduce((a,v)=>a+toNum(v?.deliveryCharges?.basicService),0);
  const delivery=rows.reduce((a,v)=>a+getNestedValue(v,"deliveryCharges.delivery",0),0);
  const systemBenefit=rows.reduce((a,v)=>a+getNestedValue(v,"deliveryCharges.systemBenefitCharge",0),0);
  const deliveryGrt=rows.reduce((a,v)=>a+toNum(v?.deliveryCharges?.grtOtherTaxes),0);
  const deliveryTax=rows.reduce((a,v)=>a+toNum(v?.deliveryCharges?.salestax),0);
  const newest=sortBillsNewest(rows)[0]||null;
  const totalUsage=rows.reduce((a,v)=>a+getUsageValue(v),0);
  return{
   avgDaily,
   budget,
   actual,
   diff,
   supply,
   merchantFunction,
   supplyGrt,
   supplyTax,
   basicService,
   delivery,
   systemBenefit,
   deliveryGrt,
   deliveryTax,
   newReadType:newest?.newRead?.readType||"-",
   newReadDate:formatDateDisplay(newest?.newRead?.readDate),
   priorReadType:newest?.priorRead?.readType||"-",
   priorReadDate:formatDateDisplay(newest?.priorRead?.readDate),
   readDiff:toNum(newest?.priorRead?.readDiff),
   totalUsage
  };
 },[filteredBills]);

 useEffect(()=>{
  setModalContainer(document.body);
 },[]);

 useEffect(()=>{
  if(!success&&!error)return;
  const timer=setTimeout(()=>{
   setSuccess("");
   setError("");
  },5000);
  return()=>clearTimeout(timer);
 },[success,error]);

 const api=async(url,options={})=>{
  const headers=options.body instanceof FormData?{}:{"Content-Type":"application/json"};
  const res=await fetch(url,{headers,...options});
  const data=await res.json().catch(()=>null);
  if(!res.ok)throw new Error(data?.message||"Request failed");
  return data;
 };

 const uploadBillFile=async file=>{
  const fd=new FormData();
  fd.append("file",file);
  const data=await api("/api/upload/bills",{method:"POST",body:fd});
  return data?.originalName||"";
 };

 const loadAccounts=async(nextId)=>{
  setLoadingAccounts(true);
  try{
   const data=await api("/api/electricity-accounts");
   const rows=getAccountsFromResponse(data);
   setAccounts(rows);
   const chosen=nextId||selectedAccountId||(rows[0]?getId(rows[0]):"");
   setSelectedAccountId(chosen);
   return {rows,chosen};
  }finally{
   setLoadingAccounts(false);
  }
 };

 const loadBills=async(accountId)=>{
  if(!accountId){
   setBills([]);
   setSelectedYear(String(currentYear));
   setSelectedMonth("");
   return;
  }
  setLoadingBills(true);
  try{
   let rows=[];
   try{
    const filteredData=await api(`/api/electricity-rates?electricityAccount=${encodeURIComponent(accountId)}`);
    rows=getRatesFromResponse(filteredData);
   }catch(err){
    rows=[];
   }
   if(!rows.length){
    const allData=await api("/api/electricity-rates");
    rows=getRatesFromResponse(allData);
   }
   const matched=rows.filter(v=>getBillAccountId(v)===accountId);
   const sorted=sortBillsNewest(matched);
   setBills(sorted);
   setSelectedYear(String(currentYear));
   setSelectedMonth("");
  }finally{
   setLoadingBills(false);
  }
 };

 useEffect(()=>{
  (async()=>{
   try{
    setError("");
    const {chosen}=await loadAccounts();
    if(chosen)await loadBills(chosen);
   }catch(err){
    setError(err.message);
   }
  })();
 },[]);

 useEffect(()=>{
  (async()=>{
   try{
    setError("");
    setSuccess("");
    await loadBills(selectedAccountId);
   }catch(err){
    setError(err.message);
   }
  })();
 },[selectedAccountId]);

 const onAccountChange=e=>{
  const {name,value,type,checked}=e.target;
  setAccountForm(prev=>({...prev,[name]:type==="checkbox"?checked:value}));
 };

 const onBillChange=e=>{
  const {name,value,files}=e.target;
  if(name==="billAttachmentFile"){
   const file=files?.[0]||null;
   setBillForm(prev=>({...prev,billAttachmentFile:file,billAttachment:file?file.name:prev.billAttachment}));
   return;
  }
  setBillForm(prev=>setNestedField(prev,name,value));
 };

 const onEditAccountChange=e=>{
  const {name,value,type,checked}=e.target;
  setEditAccountForm(prev=>({...prev,[name]:type==="checkbox"?checked:value}));
 };

 const onEditBillChange=e=>{
  const {name,value,files}=e.target;
  if(name==="billAttachmentFile"){
   const file=files?.[0]||null;
   setEditBillForm(prev=>({...prev,billAttachmentFile:file,billAttachment:file?file.name:prev.billAttachment}));
   return;
  }
  setEditBillForm(prev=>setNestedField(prev,name,value));
 };

 const clearAllFilters=()=>{
  setSelectedYear(String(currentYear));
  setSelectedMonth("");
 };

 const openAddAccount=()=>{
  setAccountForm(accountInit);
  setShowAddAccount(true);
 };

 const openAddBill=()=>{
  if(!selectedAccountId){
   setError("Select an account first");
   return;
  }
  setBillForm(billInit);
  setShowAddBill(true);
 };

 const submitAccount=async e=>{
  e.preventDefault();
  try{
   setSavingAccount(true);
   setError("");
   setSuccess("");
   const created=await api("/api/electricity-accounts",{
    method:"POST",
    body:JSON.stringify(accountForm)
   });
   const createdRecord=created?.electricityAccount||created?.account||created?.data||created;
   const createdId=getId(createdRecord);
   setAccountForm(accountInit);
   setShowAddAccount(false);
   await loadAccounts(createdId);
   if(createdId)await loadBills(createdId);
   setSuccess("Account saved.");
  }catch(err){
   setError(err.message);
  }finally{
   setSavingAccount(false);
  }
 };

 const submitBill=async e=>{
  e.preventDefault();
  if(!selectedAccountId){
   setError("Select an account first");
   return;
  }
  try{
   setSavingBill(true);
   setError("");
   setSuccess("");

   let billAttachment=billForm.billAttachment||"";
   if(billForm.billAttachmentFile){
    billAttachment=await uploadBillFile(billForm.billAttachmentFile);
   }

   await api("/api/electricity-rates",{
    method:"POST",
    body:JSON.stringify({
     electricityAccount:selectedAccountId,
     billingStartDate:billForm.billingStartDate,
     billingEndDate:billForm.billingEndDate,
     nextBillingDate:billForm.nextBillingDate,
     averageDailyUse:toNum(billForm.averageDailyUse),
     budgetBilledToDate:toNum(billForm.budgetBilledToDate),
     actualBilledToDate:toNum(billForm.actualBilledToDate),
     amountDue:toNum(billForm.amountDue),
     amountPaid:toNum(billForm.amountPaid),
     newRead:{
      read:billForm.newRead?.read===""?undefined:toNum(billForm.newRead?.read),
      readType:billForm.newRead?.readType||undefined,
      readDate:billForm.newRead?.readDate||undefined
     },
     priorRead:{
      read:billForm.priorRead?.read===""?undefined:toNum(billForm.priorRead?.read),
      readType:billForm.priorRead?.readType||undefined,
      readDate:billForm.priorRead?.readDate||undefined,
      readDiff:billForm.priorRead?.readDiff===""?undefined:toNum(billForm.priorRead?.readDiff)
     },
     lastBillingPeriod:{
      lastBillingSummary:billForm.lastBillingPeriod?.lastBillingSummary||undefined,
      totalCharges:billForm.lastBillingPeriod?.totalCharges===""?undefined:toNum(billForm.lastBillingPeriod?.totalCharges),
      payments:billForm.lastBillingPeriod?.payments===""?undefined:toNum(billForm.lastBillingPeriod?.payments)
     },
     newCharges:{
      budgetBilledAmount:billForm.newCharges?.budgetBilledAmount===""?undefined:toNum(billForm.newCharges?.budgetBilledAmount),
      lateCharges:billForm.newCharges?.lateCharges===""?undefined:toNum(billForm.newCharges?.lateCharges),
      eapDiscount:billForm.newCharges?.eapDiscount===""?undefined:toNum(billForm.newCharges?.eapDiscount),
      dueDate:billForm.newCharges?.dueDate||undefined
     },
     supplyCharges:{
      supply:billForm.supplyCharges?.supply===""?undefined:toNum(billForm.supplyCharges?.supply),
      ratePerKwh:billForm.supplyCharges?.ratePerKwh===""?undefined:toNum(billForm.supplyCharges?.ratePerKwh),
      merchantFunction:billForm.supplyCharges?.merchantFunction===""?undefined:toNum(billForm.supplyCharges?.merchantFunction),
      grtOtherTaxes:billForm.supplyCharges?.grtOtherTaxes===""?undefined:toNum(billForm.supplyCharges?.grtOtherTaxes),
      salestax:billForm.supplyCharges?.salestax===""?undefined:toNum(billForm.supplyCharges?.salestax)
     },
     deliveryCharges:{
      basicService:billForm.deliveryCharges?.basicService===""?undefined:toNum(billForm.deliveryCharges?.basicService),
      delivery:billForm.deliveryCharges?.delivery===""?undefined:toNum(billForm.deliveryCharges?.delivery),
      deliveryRate:billForm.deliveryCharges?.deliveryRate===""?undefined:toNum(billForm.deliveryCharges?.deliveryRate),
      systemBenefitCharge:billForm.deliveryCharges?.systemBenefitCharge===""?undefined:toNum(billForm.deliveryCharges?.systemBenefitCharge),
      grtOtherTaxes:billForm.deliveryCharges?.grtOtherTaxes===""?undefined:toNum(billForm.deliveryCharges?.grtOtherTaxes),
      salestax:billForm.deliveryCharges?.salestax===""?undefined:toNum(billForm.deliveryCharges?.salestax)
     },
     billAttachment,
     notes:billForm.notes
    })
   });
   setBillForm(billInit);
   setShowAddBill(false);
   await loadBills(selectedAccountId);
   setSuccess("Bill added.");
  }catch(err){
   setError(err.message);
  }finally{
   setSavingBill(false);
  }
 };

 const openEditAccount=()=>{
  if(!selectedAccount)return;
  setEditAccountForm({
   provider:selectedAccount.provider||"",
   accountNumber:selectedAccount.accountNumber||"",
   meterNumber:selectedAccount.meterNumber||"",
   nickname:selectedAccount.nickname||"",
   isActive:selectedAccount.isActive??true,
   notes:selectedAccount.notes||""
  });
  setShowEditAccount(true);
 };

 const openEditBill=bill=>{
  setEditBillForm({
   _id:getId(bill),
   billingStartDate:toDateInput(bill.billingStartDate),
   billingEndDate:toDateInput(bill.billingEndDate),
   nextBillingDate:toDateInput(bill.nextBillingDate),
   averageDailyUse:bill?.averageDailyUse!=null?toMoney2(getNestedValue(bill,"averageDailyUse")):"",
   budgetBilledToDate:bill?.budgetBilledToDate!=null?toMoney2(toNum(bill.budgetBilledToDate)):"",
   actualBilledToDate:bill?.actualBilledToDate!=null?toMoney2(toNum(bill.actualBilledToDate)):"",
   amountDue:bill?.amountDue!=null?toMoney2(toNum(bill.amountDue)):"",
   amountPaid:bill?.amountPaid!=null?toMoney2(toNum(bill.amountPaid)):"",
   newRead:{
    read:bill?.newRead?.read!=null?String(toNum(bill.newRead.read)):"",
    readType:bill?.newRead?.readType||"",
    readDate:toDateInput(bill?.newRead?.readDate)
   },
   priorRead:{
    read:bill?.priorRead?.read!=null?String(toNum(bill.priorRead.read)):"",
    readType:bill?.priorRead?.readType||"",
    readDate:toDateInput(bill?.priorRead?.readDate),
    readDiff:bill?.priorRead?.readDiff!=null?String(toNum(bill.priorRead.readDiff)):""
   },
   lastBillingPeriod:{
    lastBillingSummary:toDateInput(bill?.lastBillingPeriod?.lastBillingSummary),
    totalCharges:bill?.lastBillingPeriod?.totalCharges!=null?toMoney2(toNum(bill.lastBillingPeriod.totalCharges)):"",
    payments:bill?.lastBillingPeriod?.payments!=null?toMoney2(toNum(bill.lastBillingPeriod.payments)):""
   },
   newCharges:{
    budgetBilledAmount:bill?.newCharges?.budgetBilledAmount!=null?toMoney2(toNum(bill.newCharges.budgetBilledAmount)):"",
    lateCharges:bill?.newCharges?.lateCharges!=null?toMoney2(toNum(bill.newCharges.lateCharges)):"",
    eapDiscount:bill?.newCharges?.eapDiscount!=null?toMoney2(toNum(bill.newCharges.eapDiscount)):"",
    dueDate:toDateInput(bill?.newCharges?.dueDate)
   },
   supplyCharges:{
    supply:getSupplyChargeValue(bill,"supply",null)!=null?toMoney3(getSupplyChargeValue(bill,"supply")):"",
    ratePerKwh:getSupplyChargeValue(bill,"ratePerKwh",null)!=null?toMoney3(getSupplyChargeValue(bill,"ratePerKwh")):"",
    merchantFunction:getSupplyChargeValue(bill,"merchantFunction",null)!=null?toMoney2(getSupplyChargeValue(bill,"merchantFunction")):"",
    grtOtherTaxes:getSupplyChargeValue(bill,"grtOtherTaxes",null)!=null?toMoney2(getSupplyChargeValue(bill,"grtOtherTaxes")):"",
    salestax:getSupplyChargeValue(bill,"salestax",null)!=null?toMoney2(getSupplyChargeValue(bill,"salestax")):""
   },
   deliveryCharges:{
    basicService:bill?.deliveryCharges?.basicService!=null?toMoney2(toNum(bill.deliveryCharges.basicService)):"",
    delivery:getNestedValue(bill,"deliveryCharges.delivery",null)!=null?toMoney3(getNestedValue(bill,"deliveryCharges.delivery")):"",
    deliveryRate:getNestedValue(bill,"deliveryCharges.deliveryRate",null)!=null?toMoney3(getNestedValue(bill,"deliveryCharges.deliveryRate")):"",
    systemBenefitCharge:getNestedValue(bill,"deliveryCharges.systemBenefitCharge",null)!=null?toMoney3(getNestedValue(bill,"deliveryCharges.systemBenefitCharge")):"",
    grtOtherTaxes:bill?.deliveryCharges?.grtOtherTaxes!=null?toMoney2(toNum(bill.deliveryCharges.grtOtherTaxes)):"",
    salestax:bill?.deliveryCharges?.salestax!=null?toMoney2(toNum(bill.deliveryCharges.salestax)):""
   },
   billAttachment:bill.billAttachment||"",
   billAttachmentFile:null,
   notes:Array.isArray(bill.notes)?bill.notes:bill.notes?[bill.notes]:[]
  });
  setShowEditBill(true);
 };

 const submitEditAccount=async e=>{
  e.preventDefault();
  if(!selectedAccountId)return;
  try{
   setUpdatingAccount(true);
   setError("");
   setSuccess("");
   await api(`/api/electricity-accounts/${selectedAccountId}`,{
    method:"PUT",
    body:JSON.stringify(editAccountForm)
   });
   await loadAccounts(selectedAccountId);
   setShowEditAccount(false);
   setSuccess("Account updated.");
  }catch(err){
   setError(err.message);
  }finally{
   setUpdatingAccount(false);
  }
 };

 const submitEditBill=async e=>{
  e.preventDefault();
  if(!editBillForm._id)return;
  try{
   setUpdatingBill(true);
   setError("");
   setSuccess("");

   let billAttachment=editBillForm.billAttachment||"";
   if(editBillForm.billAttachmentFile){
    billAttachment=await uploadBillFile(editBillForm.billAttachmentFile);
   }

   await api(`/api/electricity-rates/${editBillForm._id}`,{
    method:"PUT",
    body:JSON.stringify({
     electricityAccount:selectedAccountId,
     billingStartDate:editBillForm.billingStartDate,
     billingEndDate:editBillForm.billingEndDate,
     nextBillingDate:editBillForm.nextBillingDate,
     averageDailyUse:toNum(editBillForm.averageDailyUse),
     budgetBilledToDate:toNum(editBillForm.budgetBilledToDate),
     actualBilledToDate:toNum(editBillForm.actualBilledToDate),
     amountDue:toNum(editBillForm.amountDue),
     amountPaid:toNum(editBillForm.amountPaid),
     newRead:{
      read:editBillForm.newRead?.read===""?undefined:toNum(editBillForm.newRead?.read),
      readType:editBillForm.newRead?.readType||undefined,
      readDate:editBillForm.newRead?.readDate||undefined
     },
     priorRead:{
      read:editBillForm.priorRead?.read===""?undefined:toNum(editBillForm.priorRead?.read),
      readType:editBillForm.priorRead?.readType||undefined,
      readDate:editBillForm.priorRead?.readDate||undefined,
      readDiff:editBillForm.priorRead?.readDiff===""?undefined:toNum(editBillForm.priorRead?.readDiff)
     },
     lastBillingPeriod:{
      lastBillingSummary:editBillForm.lastBillingPeriod?.lastBillingSummary||undefined,
      totalCharges:editBillForm.lastBillingPeriod?.totalCharges===""?undefined:toNum(editBillForm.lastBillingPeriod?.totalCharges),
      payments:editBillForm.lastBillingPeriod?.payments===""?undefined:toNum(editBillForm.lastBillingPeriod?.payments)
     },
     newCharges:{
      budgetBilledAmount:editBillForm.newCharges?.budgetBilledAmount===""?undefined:toNum(editBillForm.newCharges?.budgetBilledAmount),
      lateCharges:editBillForm.newCharges?.lateCharges===""?undefined:toNum(editBillForm.newCharges?.lateCharges),
      eapDiscount:editBillForm.newCharges?.eapDiscount===""?undefined:toNum(editBillForm.newCharges?.eapDiscount),
      dueDate:editBillForm.newCharges?.dueDate||undefined
     },
     supplyCharges:{
      supply:editBillForm.supplyCharges?.supply===""?undefined:toNum(editBillForm.supplyCharges?.supply),
      ratePerKwh:editBillForm.supplyCharges?.ratePerKwh===""?undefined:toNum(editBillForm.supplyCharges?.ratePerKwh),
      merchantFunction:editBillForm.supplyCharges?.merchantFunction===""?undefined:toNum(editBillForm.supplyCharges?.merchantFunction),
      grtOtherTaxes:editBillForm.supplyCharges?.grtOtherTaxes===""?undefined:toNum(editBillForm.supplyCharges?.grtOtherTaxes),
      salestax:editBillForm.supplyCharges?.salestax===""?undefined:toNum(editBillForm.supplyCharges?.salestax)
     },
     deliveryCharges:{
      basicService:editBillForm.deliveryCharges?.basicService===""?undefined:toNum(editBillForm.deliveryCharges?.basicService),
      delivery:editBillForm.deliveryCharges?.delivery===""?undefined:toNum(editBillForm.deliveryCharges?.delivery),
      deliveryRate:editBillForm.deliveryCharges?.deliveryRate===""?undefined:toNum(editBillForm.deliveryCharges?.deliveryRate),
      systemBenefitCharge:editBillForm.deliveryCharges?.systemBenefitCharge===""?undefined:toNum(editBillForm.deliveryCharges?.systemBenefitCharge),
      grtOtherTaxes:editBillForm.deliveryCharges?.grtOtherTaxes===""?undefined:toNum(editBillForm.deliveryCharges?.grtOtherTaxes),
      salestax:editBillForm.deliveryCharges?.salestax===""?undefined:toNum(editBillForm.deliveryCharges?.salestax)
     },
     billAttachment,
     notes:editBillForm.notes
    })
   });
   await loadBills(selectedAccountId);
   setShowEditBill(false);
   setSuccess("Bill updated.");
  }catch(err){
   setError(err.message);
  }finally{
   setUpdatingBill(false);
  }
 };

 const deleteBill=bill=>{
  setBillToDelete(bill);
  setShowDeleteBill(true);
 };

 const confirmDeleteBill=async()=>{
  if(!billToDelete)return;
  try{
   setDeletingBill(true);
   setError("");
   setSuccess("");
   await api(`/api/electricity-rates/${getId(billToDelete)}`,{method:"DELETE"});
   setShowDeleteBill(false);
   setBillToDelete(null);
   await loadBills(selectedAccountId);
   setSuccess("Bill deleted.");
  }catch(err){
   setError(err.message);
  }finally{
   setDeletingBill(false);
  }
 };

 return(
  <Container fluid className="py-3">
   {error?<Alert variant="danger" className="mb-3">{error}</Alert>:null}
   {success?<Alert variant="success" className="mb-3">{success}</Alert>:null}

   <Row className="g-3 align-items-start">
    <Col xs={12}>
     <Card className="shadow-sm mb-3">
      <Card.Header className="d-flex justify-content-between align-items-center flex-wrap gap-2">
       <h2><span>Account Information</span></h2>
       <div className="d-flex align-items-center gap-2 flex-wrap">
        <Form.Select size="sm" style={{minWidth:"320px"}} value={selectedAccountId} onChange={e=>setSelectedAccountId(e.target.value)}>
         <option value="">Select account</option>
         {accounts.map(v=><option key={getId(v)} value={getId(v)}>{v.nickname||v.provider} - {v.accountNumber}</option>)}
        </Form.Select>
        <Button size="sm" variant="primary" onClick={openAddAccount}>Add Account</Button>
        <Button size="sm" variant="outline-primary" onClick={openEditAccount} disabled={!selectedAccount}>Edit Account</Button>
        <Button size="sm" variant="success" onClick={openAddBill} disabled={!selectedAccountId}>Add Bill</Button>
       </div>
      </Card.Header>
      <Card.Body>
       {loadingAccounts&&!accounts.length?<div className="py-2"><Spinner size="sm" animation="border" className="me-2"/>Loading accounts...</div>:null}
       {!selectedAccount?<div className="text-muted">Create an account or select an account.</div>:(
        <Row className="g-3">
         <Col md={6}><div>Provider: {selectedAccount.provider||"-"}</div></Col>
         <Col md={6}><div>Nickname: {selectedAccount.nickname||"-"}</div></Col>
         <Col md={6}><div>Account Number: {selectedAccount.accountNumber||"-"}</div></Col>
         <Col md={6}><div>Meter Number: {selectedAccount.meterNumber||"-"}</div></Col>
         <Col md={4}><div>Current Most Recent Rate: {latestBillWithRate?toMoney3(getSupplyRatePerKwh(latestBillWithRate)):"0.000"}</div></Col>
         <Col md={4}><div>Latest Bill End: {latestBill?formatDateDisplay(latestBill.billingEndDate):"-"}</div></Col>
         <Col md={4}><div>Status: <Badge bg={selectedAccount.isActive?"success":"secondary"}>{selectedAccount.isActive?"Active":"Inactive"}</Badge></div></Col>
         <Col xs={12}><div>Notes: {selectedAccount.notes||"-"}</div></Col>
        </Row>
       )}
      </Card.Body>
     </Card>

     <Card className="shadow-sm">
      <Card.Header className="d-flex justify-content-between align-items-center flex-wrap gap-2">
       <h2><span>Bills</span></h2>
       <div className="d-flex align-items-center gap-2 flex-wrap">
        <span>Year:</span>
        <Form.Select size="sm" style={{width:"140px"}} value={selectedYear} onChange={e=>{setSelectedYear(e.target.value);setSelectedMonth("");}}>
         {yearOptions.map(v=><option key={v} value={String(v)}>{v}</option>)}
        </Form.Select>
        <span>Month:</span>
        <Form.Select size="sm" style={{width:"160px"}} value={selectedMonth} onChange={e=>setSelectedMonth(e.target.value)}>
         {monthOptions.map(v=><option key={v.value||"all"} value={v.value}>{v.label}</option>)}
        </Form.Select>
        <Button size="sm" variant="outline-danger" onClick={clearAllFilters}>Clear All</Button>
        <span className="text-muted small">{selectedAccount?`${filteredBills.length} record${filteredBills.length===1?"":"s"}`:""}</span>
       </div>
      </Card.Header>
      <Card.Body className="p-0">
       {loadingBills&&!bills.length?<div className="p-3"><Spinner size="sm" animation="border" className="me-2"/>Loading bills...</div>:(
        <>
         <div className="p-3 border-bottom">
          <Row className="g-3">
           <Col xl={2} lg={4} md={6}>
            <SummaryGroup title="Daily Average" rows={[
             {label:selectedMonth?"For Month":"For Year",value:`${toMoney2(summaryData.avgDaily)}kwh`}
            ]}/>
           </Col>
           <Col xl={2} lg={4} md={6}>
            <SummaryGroup title={selectedMonth?monthOptions.find(v=>v.value===selectedMonth)?.label||"Month":"Months"} rows={[
             {label:"Budget Bills To Date",value:`$${toMoney2(summaryData.budget)}`},
             {label:"Actual Billed",value:`$${toMoney2(summaryData.actual)}`},
             {label:"Difference",value:`$${toMoney2(summaryData.diff)}`}
            ]}/>
           </Col>
           <Col xl={2} lg={4} md={6}>
            <SummaryGroup title="Supply Charges" rows={[
             {label:"Supply",value:`${toMoney2(summaryData.supply)} kWh`},
             {label:"Merchant Function",value:`$${toMoney2(summaryData.merchantFunction)}`},
             {label:"GRT",value:`$${toMoney2(summaryData.supplyGrt)}`},
             {label:"Sales Tax",value:`${toMoney2(summaryData.supplyTax)}%`}
            ]}/>
           </Col>
           <Col xl={2} lg={4} md={6}>
            <SummaryGroup title="Delivery Charges" rows={[
             {label:"Basic Service",value:`$${toMoney2(summaryData.basicService)}`},
             {label:"Delivery",value:`${toMoney2(summaryData.delivery)} kWh`},
             {label:"System Benefit",value:`${toMoney2(summaryData.systemBenefit)} kWh`},
             {label:"GRT",value:`$${toMoney2(summaryData.deliveryGrt)}`},
             {label:"Sales Tax",value:`${toMoney2(summaryData.deliveryTax)}%`}
            ]}/>
           </Col>
           <Col xl={2} lg={4} md={6}>
            <SummaryGroup title="New Read" rows={[
             {label:"New Read Type",value:summaryData.newReadType},
             {label:"Read Date",value:summaryData.newReadDate}
            ]}/>
           </Col>
           <Col xl={2} lg={4} md={6}>
            <SummaryGroup title="Prior Read" rows={[
             {label:"Read Type:",value:summaryData.priorReadType},
             {label:"Read Date:",value:summaryData.priorReadDate},
             {label:"Read Diff:",value:toMoney2(summaryData.readDiff)},
             {label:"Total Usage kWh:",value:`${toMoney2(summaryData.totalUsage)} kWh`}
            ]}/>
           </Col>
          </Row>
         </div>

         <Table responsive hover striped className="mb-0 align-middle">
          <thead>
           <tr>
            <th>Billing Start</th>
            <th>Billing End</th>
            <th>Next Billing Date</th>
            <th>Avg Daily Use</th>
            <th>Budget Billed</th>
            <th>Actual Billed</th>
            <th>Rate</th>
            <th>Delivery Rate</th>
            <th>System Benefit</th>
            <th>Notes</th>
            <th className="text-end">Actions</th>
           </tr>
          </thead>
          <tbody>
           {!filteredBills.length?(
            <tr>
             <td colSpan="11" className="text-center py-4">No bills found.</td>
            </tr>
           ):filteredBills.map(v=>(
            <tr key={getId(v)}>
             <td>{formatDateDisplay(v.billingStartDate)}</td>
             <td>{formatDateDisplay(v.billingEndDate)}</td>
             <td>{formatDateDisplay(v.nextBillingDate)}</td>
             <td>${toMoney2(getNestedValue(v,"averageDailyUse"))}</td>
             <td>${toMoney2(toNum(v.budgetBilledToDate))}</td>
             <td>${toMoney2(toNum(v.actualBilledToDate))}</td>
             <td>{toMoney3(getSupplyRatePerKwh(v))} kWh</td>
             <td>{toMoney3(getNestedValue(v,"deliveryCharges.deliveryRate"))} kWh</td>
             <td>{toMoney3(getNestedValue(v,"deliveryCharges.systemBenefitCharge"))} kWh</td>
             <td style={{minWidth:"280px"}}>{Array.isArray(v.notes)?v.notes.join(", "):v.notes||"-"}</td>
             <td className="text-end">
              <div className="d-inline-flex gap-2">
               <Button size="sm" variant="outline-warning" onClick={()=>openEditBill(v)}>Edit</Button>
               <Button size="sm" variant="outline-danger" onClick={()=>deleteBill(v)}>Delete</Button>
              </div>
             </td>
            </tr>
           ))}
          </tbody>
         </Table>
        </>
       )}
      </Card.Body>
     </Card>
    </Col>
   </Row>

   {modalContainer?(
    <Modal show={showAddAccount} onHide={()=>!savingAccount&&setShowAddAccount(false)} centered container={modalContainer} backdrop="static" keyboard={false}>
     <Modal.Header closeButton={!savingAccount}>
      <Modal.Title>Add Account</Modal.Title>
     </Modal.Header>
     <Modal.Body>
      <ElectricityAccountForm form={accountForm} onChange={onAccountChange} onSubmit={submitAccount} onCancel={()=>setShowAddAccount(false)} loading={savingAccount} submitText="Save Account" checkboxId="accountIsActive"/>
     </Modal.Body>
    </Modal>
   ):null}

   {modalContainer?(
    <Modal show={showAddBill} onHide={()=>!savingBill&&setShowAddBill(false)} centered size="lg" container={modalContainer} backdrop="static" keyboard={false}>
     <Modal.Header closeButton={!savingBill}>
      <Modal.Title>Add Bill</Modal.Title>
     </Modal.Header>
     <Modal.Body>
      <ElectricityBillForm accounts={accounts} selectedAccountId={selectedAccountId} onAccountChange={e=>setSelectedAccountId(e.target.value)} form={billForm} onChange={onBillChange} onSubmit={submitBill} onCancel={()=>setShowAddBill(false)} loading={savingBill} submitText="Add Bill" showAccountSelect={true}/>
     </Modal.Body>
    </Modal>
   ):null}

   {modalContainer?(
    <Modal show={showEditAccount} onHide={()=>!updatingAccount&&setShowEditAccount(false)} centered container={modalContainer} backdrop="static" keyboard={false}>
     <Modal.Header closeButton={!updatingAccount}>
      <Modal.Title>Edit Account</Modal.Title>
     </Modal.Header>
     <Modal.Body>
      <ElectricityAccountForm form={editAccountForm} onChange={onEditAccountChange} onSubmit={submitEditAccount} onCancel={()=>setShowEditAccount(false)} loading={updatingAccount} submitText="Update Account" checkboxId="editIsActive"/>
     </Modal.Body>
    </Modal>
   ):null}

   {modalContainer?(
    <Modal show={showEditBill} onHide={()=>!updatingBill&&setShowEditBill(false)} centered size="lg" container={modalContainer} backdrop="static" keyboard={false}>
     <Modal.Header closeButton={!updatingBill}>
      <Modal.Title>Edit Bill</Modal.Title>
     </Modal.Header>
     <Modal.Body>
      <ElectricityBillForm accounts={accounts} selectedAccountId={selectedAccountId} onAccountChange={e=>setSelectedAccountId(e.target.value)} form={editBillForm} onChange={onEditBillChange} onSubmit={submitEditBill} onCancel={()=>setShowEditBill(false)} loading={updatingBill} submitText="Update Bill" showAccountSelect={false}/>
     </Modal.Body>
    </Modal>
   ):null}

   {modalContainer?(
    <Modal show={showDeleteBill} onHide={()=>!deletingBill&&setShowDeleteBill(false)} centered container={modalContainer} backdrop="static" keyboard={false}>
     <Modal.Header closeButton={!deletingBill}>
      <Modal.Title>Delete Bill</Modal.Title>
     </Modal.Header>
     <Modal.Body>
      <div>Are you sure you want to delete this bill?</div>
      {billToDelete?(
       <div className="mt-2 small text-muted">
        {formatDateDisplay(billToDelete.billingStartDate)} - {formatDateDisplay(billToDelete.billingEndDate)}
       </div>
      ):null}
     </Modal.Body>
     <Modal.Footer>
      <Button variant="secondary" onClick={()=>setShowDeleteBill(false)} disabled={deletingBill}>Cancel</Button>
      <Button variant="danger" onClick={confirmDeleteBill} disabled={deletingBill}>
       {deletingBill?<><Spinner size="sm" animation="border" className="me-2"/>Deleting...</>:"Delete"}
      </Button>
     </Modal.Footer>
    </Modal>
   ):null}
  </Container>
 );
}
