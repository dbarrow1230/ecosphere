import {useMemo,useState} from "react";
import {Form,Row,Col,Button,Spinner,Tabs,Tab,Alert} from "react-bootstrap";
import {getDocument,GlobalWorkerOptions} from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";

GlobalWorkerOptions.workerSrc=pdfWorker;

function InlineTextField({label,name,value,onChange,required=false,type="text",step,disabled=false,placeholder=""}){
 return(
  <Form.Group as={Row} className="align-items-center mb-3">
   <Form.Label column sm={4} className="text-sm-end">{label}:</Form.Label>
   <Col sm={8}>
    <Form.Control type={type} step={step} name={name} value={value} onChange={onChange} required={required} disabled={disabled} placeholder={placeholder}/>
   </Col>
  </Form.Group>
 );
}

function InlineDateField({label,name,value,onChange,required=false}){
 return(
  <Form.Group as={Row} className="align-items-center mb-3">
   <Form.Label column sm={4} className="text-sm-end">{label}:</Form.Label>
   <Col sm={8}>
    <Form.Control type="date" name={name} value={value} onChange={onChange} required={required}/>
   </Col>
  </Form.Group>
 );
}

function InlineTextareaField({label,name,value,onChange,rows=3,placeholder=""}){
 return(
  <Form.Group as={Row} className="align-items-start mb-3">
   <Form.Label column sm={4} className="text-sm-end">{label}:</Form.Label>
   <Col sm={8}>
    <Form.Control as="textarea" rows={rows} name={name} value={value} onChange={onChange} placeholder={placeholder}/>
   </Col>
  </Form.Group>
 );
}

function InlineSelectField({label,name,value,onChange,required=false,children}){
 return(
  <Form.Group as={Row} className="align-items-center mb-3">
   <Form.Label column sm={4} className="text-sm-end">{label}:</Form.Label>
   <Col sm={8}>
    <Form.Select name={name} value={value} onChange={onChange} required={required}>
     {children}
    </Form.Select>
   </Col>
  </Form.Group>
 );
}

function InlineFileField({label,name,onChange,currentFileName="",currentFileUrl="",onParse,parsing=false}){
 const src=currentFileUrl||currentFileName||"";
 const isImage=/\.(jpg|jpeg|png|webp|gif|bmp|svg)$/i.test(src);
 const isPdf=/\.pdf$/i.test(src);
 return(
  <Form.Group as={Row} className="align-items-start mb-3">
   <Form.Label column sm={4} className="text-sm-end">{label}:</Form.Label>
   <Col sm={8}>
    <Form.Control type="file" name={name} onChange={onChange} accept=".pdf,.jpg,.jpeg,.png,.webp"/>
    {currentFileName?<div className="small text-muted mt-2">Current file: {currentFileName}</div>:null}
    {src?(
     <div className="mt-2 p-2 border rounded bg-light">
      {isImage?<img src={src} alt={currentFileName||"attachment preview"} style={{maxWidth:"180px",maxHeight:"180px",display:"block"}}/>:null}
      {isPdf?<object data={src} type="application/pdf" width="180" height="180" aria-label="PDF preview"><div className="small">PDF preview unavailable</div></object>:null}
      {!isImage&&!isPdf?<div className="small">{currentFileName||"Attachment available"}</div>:null}
     </div>
    ):null}
    <Button type="button" variant="outline-primary" className="mt-2" onClick={onParse} disabled={parsing}>
     {parsing?<><Spinner size="sm" animation="border" className="me-2"/>Parsing...</>:"Parse Bill"}
    </Button>
   </Col>
  </Form.Group>
 );
}

function TwoColFieldRow({left,right}){
 return(
  <Row>
   <Col md={6}>{left}</Col>
   <Col md={6}>{right}</Col>
  </Row>
 );
}

const monthMap={
 jan:"01",feb:"02",mar:"03",apr:"04",may:"05",jun:"06",
 jul:"07",aug:"08",sep:"09",oct:"10",nov:"11",dec:"12"
};

const normalizeMoney=value=>{
 if(value==null||value==="")return "";
 const cleaned=String(value).replace(/[$,\s]/g,"");
 const n=Number(cleaned);
 return Number.isNaN(n)?"":n;
};

const toIsoDate=value=>{
 if(!value)return "";
 const cleaned=String(value).replace(/,/g,"").trim();
 const match=cleaned.match(/^([A-Za-z]{3,9})\s+(\d{1,2})\s+(\d{4})$/);
 if(!match)return "";
 const month=monthMap[match[1].slice(0,3).toLowerCase()];
 if(!month)return "";
 return `${match[3]}-${month}-${String(match[2]).padStart(2,"0")}`;
};

const firstMatch=(text,regex,index=1)=>{
 const match=text.match(regex);
 return match?.[index]?.trim()||"";
};

const parseConEdisonBill=text=>{
 const compact=text.replace(/\u00a0/g," ").replace(/[ \t]+/g," ").replace(/\r/g,"");
 const parsed={};

 parsed.accountNumber=firstMatch(compact,/Account(?: number)?:\s*([0-9-]+)/i);

 const billingPeriod=compact.match(/Billing period:\s*([A-Za-z]{3,9}\s+\d{1,2},?\s+\d{4})\s+to\s+([A-Za-z]{3,9}\s+\d{1,2},?\s+\d{4})/i)
  ||compact.match(/billing period from\s+([A-Za-z]{3,9}\s+\d{1,2},?\s+\d{4})\s+to\s+([A-Za-z]{3,9}\s+\d{1,2},?\s+\d{4})/i);

 if(billingPeriod){
  parsed.billingStartDate=toIsoDate(billingPeriod[1]);
  parsed.billingEndDate=toIsoDate(billingPeriod[2]);
 }

 parsed.nextBillingDate=toIsoDate(firstMatch(compact,/Next Billing Date:\s*(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),?\s*([A-Za-z]{3,9}\s+\d{1,2},?\s+\d{4})/i));
 parsed.averageDailyUse=normalizeMoney(firstMatch(compact,/average daily electric usage\s+([0-9.]+)\s*kWh/i));
 parsed.budgetBilledToDate=normalizeMoney(firstMatch(compact,/Budget Billed\s*To Date\s*Actual Billed\s*To Date\s*Difference\s*Amount\s*\d+\s+\$?([0-9,]+\.\d{2})/i));
 parsed.actualBilledToDate=normalizeMoney(firstMatch(compact,/Budget Billed\s*To Date\s*Actual Billed\s*To Date\s*Difference\s*Amount\s*\d+\s+\$?[0-9,]+\.\d{2}\s+\$?([0-9,]+\.\d{2})/i));
 parsed.amountDue=normalizeMoney(firstMatch(compact,/Total amount due\s+\$?([0-9,]+\.\d{2})/i));

 parsed["lastBillingPeriod.lastBillingSummary"]=toIsoDate(firstMatch(compact,/billing summary as of\s+([A-Za-z]{3,9}\s+\d{1,2},?\s+\d{4})/i));
 parsed["lastBillingPeriod.totalCharges"]=normalizeMoney(firstMatch(compact,/Total charges from your last bill\s+\$?([0-9,]+\.\d{2})/i));
 parsed["lastBillingPeriod.payments"]=Math.abs(normalizeMoney(firstMatch(compact,/Payments through[^\n]*?(-?\$?[0-9,]+\.\d{2})/i))||0);

 parsed["newCharges.budgetBilledAmount"]=normalizeMoney(firstMatch(compact,/Budget billing amount\s+\$?([0-9,]+\.\d{2})/i));
 parsed["newCharges.adjustments"]=normalizeMoney(firstMatch(compact,/Adjustments\s+(-?\$?[0-9,]+\.\d{2})/i));
 parsed["newCharges.eapDiscount"]=Math.abs(normalizeMoney(firstMatch(compact,/EAP electric non-heating discount\s+(-?\$?[0-9,]+\.\d{2})/i))||0);
 parsed["newCharges.dueDate"]=toIsoDate(firstMatch(compact,/pay the total amount due by\s+([A-Za-z]{3,9}\s+\d{1,2},?\s+\d{4})/i));

 const meter=compact.match(/Meter #\s+New Read\s+Read Type\s+Date\s+Prior Read\s+Read Type\s+Date\s+Read Diff\s+Total Usage\s*kWh\s+\d+\s+(\d+)\s+(Actual|Estimate|Estimated)\s+([A-Za-z]{3}\s+\d{1,2})\s+(\d+)\s+(Actual|Estimate|Estimated)\s+([A-Za-z]{3}\s+\d{1,2})\s+(\d+)\s+(\d+)/i);
 if(meter){
  const year=parsed.billingEndDate?.slice(0,4)||String(new Date().getFullYear());
  parsed["newRead.read"]=normalizeMoney(meter[1]);
  parsed["newRead.readType"]=meter[2].toLowerCase().startsWith("actual")?"actual":"estimate";
  parsed["newRead.readDate"]=toIsoDate(`${meter[3]} ${year}`);
  parsed["priorRead.read"]=normalizeMoney(meter[4]);
  parsed["priorRead.readType"]=meter[5].toLowerCase().startsWith("actual")?"actual":"estimate";
  parsed["priorRead.readDate"]=toIsoDate(`${meter[6]} ${year}`);
  parsed["priorRead.readDiff"]=normalizeMoney(meter[7]);
 }

 parsed["supplyCharges.supply"]=normalizeMoney(firstMatch(compact,/Supply\s+[0-9.]+\s*kWh\s*@\s*[0-9.]+¢\/kWh\s+\$?([0-9,]+\.\d{2})/i));
 parsed["supplyCharges.ratePerKwh"]=normalizeMoney(firstMatch(compact,/Supply\s+[0-9.]+\s*kWh\s*@\s*([0-9.]+)¢\/kWh/i));
 parsed["supplyCharges.merchantFunction"]=normalizeMoney(firstMatch(compact,/Merchant Function Charge\s+\$?([0-9,]+\.\d{2})/i));

 const supplySection=firstMatch(compact,/Your Supply Charges([\s\S]*?)Total electricity supply charges/i);
 parsed["supplyCharges.grtOtherTaxes"]=normalizeMoney(firstMatch(supplySection,/GRT & other tax surcharges\s+\$?([0-9,]+\.\d{2})/i));
 parsed["supplyCharges.salestax"]=normalizeMoney(firstMatch(supplySection,/Sales tax\s*@?[0-9.]*%?\s+\$?([0-9,]+\.\d{2})/i));

 const deliverySection=firstMatch(compact,/Your Delivery Charges([\s\S]*?)Total electricity delivery charges/i);
 parsed["deliveryCharges.basicService"]=normalizeMoney(firstMatch(deliverySection,/Basic service charge\s+\$?([0-9,]+\.\d{2})/i));
 parsed["deliveryCharges.delivery"]=normalizeMoney(firstMatch(deliverySection,/Delivery\s+[0-9.]+\s*kWh\s*@\s*[0-9.]+¢\/kWh\s+\$?([0-9,]+\.\d{2})/i));
 parsed["deliveryCharges.deliveryRate"]=normalizeMoney(firstMatch(deliverySection,/Delivery\s+[0-9.]+\s*kWh\s*@\s*([0-9.]+)¢\/kWh/i));
 parsed["deliveryCharges.systemBenefitCharge"]=normalizeMoney(firstMatch(deliverySection,/System Benefit Charge\s*@\s*([0-9.]+)¢\/kWh/i));
 parsed["deliveryCharges.grtOtherTaxes"]=normalizeMoney(firstMatch(deliverySection,/GRT & other tax surcharges\s+\$?([0-9,]+\.\d{2})/i));
 parsed["deliveryCharges.salestax"]=normalizeMoney(firstMatch(deliverySection,/Sales tax\s*@?[0-9.]*%?\s+\$?([0-9,]+\.\d{2})/i));

 return Object.fromEntries(Object.entries(parsed).filter(([,value])=>value!==""&&value!==undefined&&value!==null));
};

const extractPdfText=async file=>{
 const buffer=await file.arrayBuffer();
 const pdf=await getDocument({data:buffer}).promise;
 const pages=[];
 for(let pageNumber=1;pageNumber<=pdf.numPages;pageNumber++){
  const page=await pdf.getPage(pageNumber);
  const content=await page.getTextContent();
  pages.push(content.items.map(item=>item.str).join(" "));
 }
 return pages.join("\n");
};

export default function ElectricityBillForm({accounts,selectedAccountId,onAccountChange,form,onChange,onSubmit,onCancel,loading,submitText="Save Bill",showAccountSelect=true}){
 const [activeTab,setActiveTab]=useState("billing");
 const [billFile,setBillFile]=useState(null);
 const [parsing,setParsing]=useState(false);
 const [parseError,setParseError]=useState("");

 const num=v=>v==null||v===""?0:Number(v);

 const billedDifference=useMemo(()=>{
  const hasBudget=form.budgetBilledToDate!==undefined&&form.budgetBilledToDate!==null&&form.budgetBilledToDate!=="";
  const hasActual=form.actualBilledToDate!==undefined&&form.actualBilledToDate!==null&&form.actualBilledToDate!=="";
  return hasBudget||hasActual?(num(form.actualBilledToDate)-num(form.budgetBilledToDate)).toFixed(2):"";
 },[form.budgetBilledToDate,form.actualBilledToDate]);

 const totalUsageKwh=useMemo(()=>{
  const hasNew=form.newRead?.read!==undefined&&form.newRead?.read!==null&&form.newRead?.read!=="";
  const hasPrior=form.priorRead?.read!==undefined&&form.priorRead?.read!==null&&form.priorRead?.read!=="";
  const hasDiff=form.priorRead?.readDiff!==undefined&&form.priorRead?.readDiff!==null&&form.priorRead?.readDiff!=="";
  if(hasDiff)return num(form.priorRead?.readDiff).toFixed(2);
  return hasNew||hasPrior?(num(form.newRead?.read)-num(form.priorRead?.read)).toFixed(2):"";
 },[form.newRead?.read,form.priorRead?.read,form.priorRead?.readDiff]);

 const previousBalance=useMemo(()=>{
  const hasCharges=form.lastBillingPeriod?.totalCharges!==undefined&&form.lastBillingPeriod?.totalCharges!==null&&form.lastBillingPeriod?.totalCharges!=="";
  const hasPayments=form.lastBillingPeriod?.payments!==undefined&&form.lastBillingPeriod?.payments!==null&&form.lastBillingPeriod?.payments!=="";
  return hasCharges||hasPayments?(num(form.lastBillingPeriod?.totalCharges)-num(form.lastBillingPeriod?.payments)).toFixed(2):"";
 },[form.lastBillingPeriod?.totalCharges,form.lastBillingPeriod?.payments]);

 const totalBillingPeriod=useMemo(()=>{
  const hasBudget=form.newCharges?.budgetBilledAmount!==undefined&&form.newCharges?.budgetBilledAmount!==null&&form.newCharges?.budgetBilledAmount!=="";
  const hasAdjustments=form.newCharges?.adjustments!==undefined&&form.newCharges?.adjustments!==null&&form.newCharges?.adjustments!=="";
  const hasLate=form.newCharges?.lateCharges!==undefined&&form.newCharges?.lateCharges!==null&&form.newCharges?.lateCharges!=="";
  const hasDiscount=form.newCharges?.eapDiscount!==undefined&&form.newCharges?.eapDiscount!==null&&form.newCharges?.eapDiscount!=="";
  return hasBudget||hasAdjustments||hasLate||hasDiscount?(num(form.newCharges?.budgetBilledAmount)+num(form.newCharges?.adjustments)+num(form.newCharges?.lateCharges)-num(form.newCharges?.eapDiscount)).toFixed(2):"";
 },[form.newCharges?.budgetBilledAmount,form.newCharges?.adjustments,form.newCharges?.lateCharges,form.newCharges?.eapDiscount]);

 const totalDue=useMemo(()=>{
  if(previousBalance===""&&totalBillingPeriod==="")return "";
  return (num(previousBalance)+num(totalBillingPeriod)).toFixed(2);
 },[previousBalance,totalBillingPeriod]);

 const notesValue=Array.isArray(form.notes)?form.notes.join("\n"):form.notes||"";
 const handleNotesChange=e=>onChange({target:{name:"notes",value:e.target.value.split("\n").map(v=>v.trim()).filter(Boolean)}});

 const parseSelectedBill=async file=>{
  if(!file){
   setParseError("Select a PDF bill first.");
   return;
  }
  if(file.type!=="application/pdf"&&!file.name.toLowerCase().endsWith(".pdf")){
   setParseError("Bill parsing currently requires a PDF.");
   return;
  }

  setParsing(true);
  setParseError("");

  try{
   const text=await extractPdfText(file);
   const parsed=parseConEdisonBill(text);

   if(!Object.keys(parsed).length){
    throw new Error("No supported bill fields were found.");
   }

   Object.entries(parsed).forEach(([name,value])=>{
    onChange({target:{name,value}});
   });

   if(parsed.accountNumber&&accounts?.length){
    const account=accounts.find(row=>String(row.accountNumber||"").replace(/\s/g,"")===String(parsed.accountNumber).replace(/\s/g,""));
    if(account){
     onAccountChange({target:{value:account._id||account.id}});
    }
   }

   setActiveTab("billing");
  }catch(err){
   setParseError(err.message||"Unable to parse bill.");
  }finally{
   setParsing(false);
  }
 };

 const handleAttachmentChange=async e=>{
  const file=e.target.files?.[0]||null;
  setBillFile(file);
  setParseError("");
  onChange(e);
  if(file){
   await parseSelectedBill(file);
  }
 };

 const handleParseBill=async()=>{
  await parseSelectedBill(billFile);
 };

 return(
  <Form onSubmit={onSubmit}>
   {showAccountSelect?(
    <Form.Group as={Row} className="align-items-center mb-3">
     <Form.Label column sm={3} className="text-sm-end">Account:</Form.Label>
     <Col sm={9}>
      <Form.Select value={selectedAccountId} onChange={onAccountChange} required>
       <option value="">Select account</option>
       {accounts.map(v=><option key={v._id||v.id} value={v._id||v.id}>{v.nickname||v.provider} - {v.accountNumber}</option>)}
      </Form.Select>
     </Col>
    </Form.Group>
   ):null}

   <Tabs activeKey={activeTab} onSelect={k=>setActiveTab(k||"billing")} className="mb-3">
    <Tab eventKey="billing" title="Billing">
     <TwoColFieldRow
      left={<InlineDateField label="Billing Start" name="billingStartDate" value={form.billingStartDate||""} onChange={onChange} required/>}
      right={<InlineDateField label="Billing End" name="billingEndDate" value={form.billingEndDate||""} onChange={onChange} required/>}
     />
     <TwoColFieldRow
      left={<InlineDateField label="Next Billing Date" name="nextBillingDate" value={form.nextBillingDate||""} onChange={onChange} required/>}
      right={<InlineTextField label="Average Daily Use" name="averageDailyUse" value={form.averageDailyUse||""} onChange={onChange} type="number" step="0.01"/>}
     />
     <TwoColFieldRow
      left={<InlineTextField label="Budget Billed To Date" name="budgetBilledToDate" value={form.budgetBilledToDate||""} onChange={onChange} type="number" step="0.01"/>}
      right={<InlineTextField label="Actual Billed To Date" name="actualBilledToDate" value={form.actualBilledToDate||""} onChange={onChange} type="number" step="0.01"/>}
     />
     <TwoColFieldRow
      left={<InlineTextField label="Difference Amount" name="billedDifference" value={billedDifference} onChange={()=>{}} type="number" step="0.01" disabled/>}
      right={<InlineTextField label="Amount Due" name="amountDue" value={form.amountDue||""} onChange={onChange} type="number" step="0.01"/>}
     />
     <TwoColFieldRow
      left={<InlineTextField label="Amount Paid" name="amountPaid" value={form.amountPaid||""} onChange={onChange} type="number" step="0.01"/>}
      right={<div/>}
     />
    </Tab>

    <Tab eventKey="reads" title="New / Prior Read">
     <Row>
      <Col md={6}>
       <h5 className="mb-3">New Read</h5>
       <InlineTextField label="New Read" name="newRead.read" value={form.newRead?.read||""} onChange={onChange} type="number" step="1"/>
       <InlineSelectField label="Read Type" name="newRead.readType" value={form.newRead?.readType||""} onChange={onChange}>
        <option value="">Select read type</option>
        <option value="actual">Actual</option>
        <option value="estimate">Estimate</option>
       </InlineSelectField>
       <InlineDateField label="Read Date" name="newRead.readDate" value={form.newRead?.readDate||""} onChange={onChange}/>
      </Col>
      <Col md={6}>
       <h5 className="mb-3">Prior Read</h5>
       <InlineTextField label="Previous Read" name="priorRead.read" value={form.priorRead?.read||""} onChange={onChange} type="number" step="1"/>
       <InlineSelectField label="Read Type" name="priorRead.readType" value={form.priorRead?.readType||""} onChange={onChange}>
        <option value="">Select read type</option>
        <option value="actual">Actual</option>
        <option value="estimate">Estimate</option>
       </InlineSelectField>
       <InlineDateField label="Read Date" name="priorRead.readDate" value={form.priorRead?.readDate||""} onChange={onChange}/>
       <InlineTextField label="Read Diff" name="priorRead.readDiff" value={form.priorRead?.readDiff||""} onChange={onChange} type="number" step="1"/>
      </Col>
     </Row>
     <Row>
      <Col md={6}>
       <InlineTextField label="Total Usage kWh" name="totalUsageKwh" value={totalUsageKwh} onChange={()=>{}} type="number" step="0.01" disabled/>
      </Col>
      <Col md={6}/>
     </Row>
    </Tab>

    <Tab eventKey="billBreakdown" title="Bill Breakdown">
     <Row>
      <Col md={6}>
       <h5 className="mb-3">Last Billing Period</h5>
       <InlineDateField label="Last Billing Summary" name="lastBillingPeriod.lastBillingSummary" value={form.lastBillingPeriod?.lastBillingSummary||""} onChange={onChange}/>
       <InlineTextField label="Total Charges" name="lastBillingPeriod.totalCharges" value={form.lastBillingPeriod?.totalCharges||""} onChange={onChange} type="number" step="0.01"/>
       <InlineTextField label="Payments" name="lastBillingPeriod.payments" value={form.lastBillingPeriod?.payments||""} onChange={onChange} type="number" step="0.01"/>
       <InlineTextField label="Previous Balance" name="previousBalance" value={previousBalance} onChange={()=>{}} type="number" step="0.01" disabled/>
      </Col>
      <Col md={6}>
       <h5 className="mb-3">New Charges</h5>
       <InlineTextField label="Budget Billed Amount" name="newCharges.budgetBilledAmount" value={form.newCharges?.budgetBilledAmount||""} onChange={onChange} type="number" step="0.01"/>
       <InlineTextField label="Adjustments" name="newCharges.adjustments" value={form.newCharges?.adjustments||""} onChange={onChange} type="number" step="0.01"/>
       <InlineTextField label="Late Charges" name="newCharges.lateCharges" value={form.newCharges?.lateCharges||""} onChange={onChange} type="number" step="0.01"/>
       <InlineTextField label="EAP Discount" name="newCharges.eapDiscount" value={form.newCharges?.eapDiscount||""} onChange={onChange} type="number" step="0.01"/>
       <InlineDateField label="Due Date" name="newCharges.dueDate" value={form.newCharges?.dueDate||""} onChange={onChange}/>
       <InlineTextField label="Total Billing Period" name="totalBillingPeriod" value={totalBillingPeriod} onChange={()=>{}} type="number" step="0.01" disabled/>
       <InlineTextField label="Total Due" name="totalDue" value={totalDue} onChange={()=>{}} type="number" step="0.01" disabled/>
      </Col>
     </Row>
    </Tab>

    <Tab eventKey="charges" title="Supply / Delivery Charges">
     <Row>
      <Col md={6}>
       <h5 className="mb-3">Supply Charges</h5>
       <InlineTextField label="Supply" name="supplyCharges.supply" value={form.supplyCharges?.supply||""} onChange={onChange} type="number" step="0.001"/>
       <InlineTextField label="Rate Per Kwh" name="supplyCharges.ratePerKwh" value={form.supplyCharges?.ratePerKwh||""} onChange={onChange} required type="number" step="0.001"/>
       <InlineTextField label="Merchant Function" name="supplyCharges.merchantFunction" value={form.supplyCharges?.merchantFunction||""} onChange={onChange} type="number" step="0.01"/>
       <InlineTextField label="GRT / Other Taxes" name="supplyCharges.grtOtherTaxes" value={form.supplyCharges?.grtOtherTaxes||""} onChange={onChange} type="number" step="0.01"/>
       <InlineTextField label="Sales Tax" name="supplyCharges.salestax" value={form.supplyCharges?.salestax||""} onChange={onChange} type="number" step="0.01"/>
      </Col>
      <Col md={6}>
       <h5 className="mb-3">Delivery Charges</h5>
       <InlineTextField label="Basic Service" name="deliveryCharges.basicService" value={form.deliveryCharges?.basicService||""} onChange={onChange} type="number" step="0.01"/>
       <InlineTextField label="Delivery" name="deliveryCharges.delivery" value={form.deliveryCharges?.delivery||""} onChange={onChange} type="number" step="0.001"/>
       <InlineTextField label="Delivery Rate" name="deliveryCharges.deliveryRate" value={form.deliveryCharges?.deliveryRate||""} onChange={onChange} type="number" step="0.001"/>
       <InlineTextField label="System Benefit Charge" name="deliveryCharges.systemBenefitCharge" value={form.deliveryCharges?.systemBenefitCharge||""} onChange={onChange} type="number" step="0.001"/>
       <InlineTextField label="GRT / Other Taxes" name="deliveryCharges.grtOtherTaxes" value={form.deliveryCharges?.grtOtherTaxes||""} onChange={onChange} type="number" step="0.01"/>
       <InlineTextField label="Sales Tax" name="deliveryCharges.salestax" value={form.deliveryCharges?.salestax||""} onChange={onChange} type="number" step="0.01"/>
      </Col>
     </Row>
    </Tab>

    <Tab eventKey="attachment" title="Bill Attachment">
     {parseError?<Alert variant="danger">{parseError}</Alert>:null}
     <div className="small text-muted mb-2">Select a PDF bill. The bill will be parsed automatically and the form fields will be populated.</div>
     <InlineFileField
      label="Bill Attachment"
      name="billAttachmentFile"
      onChange={handleAttachmentChange}
      currentFileName={form.billAttachment||""}
      currentFileUrl={form.billAttachmentUrl||form.billAttachment||""}
      onParse={handleParseBill}
      parsing={parsing}
     />
    </Tab>

    <Tab eventKey="notes" title="Notes">
     <InlineTextareaField label="Notes" name="notes" value={notesValue} onChange={handleNotesChange} rows={8} placeholder="One note per line"/>
    </Tab>
   </Tabs>

   <div className="d-flex justify-content-end gap-2">
    {onCancel?<Button variant="outline-secondary" type="button" onClick={onCancel} disabled={loading}>Cancel</Button>:null}
    <Button type="submit" disabled={loading||!selectedAccountId}>
     {loading?<><Spinner size="sm" animation="border" className="me-2"/>Saving...</>:submitText}
    </Button>
   </div>
  </Form>
 );
}
