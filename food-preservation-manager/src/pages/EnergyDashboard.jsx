import {useState,useMemo,useEffect} from "react";
import {Container,Row,Col,Card,Form,InputGroup} from "react-bootstrap";
import {ResponsiveContainer,LineChart,Line,BarChart,Bar,XAxis,YAxis,CartesianGrid,Tooltip,Legend} from "recharts";

function fmtDate(value){
 const d=new Date(value);
 if(Number.isNaN(d.getTime())) return "";
 return d.toLocaleDateString(undefined,{year:"numeric",month:"short"});
}

function toNum(value){
 if(value==null) return 0;
 if(typeof value==="number") return value;
 if(typeof value==="string") return parseFloat(value)||0;
 if(typeof value==="object"){
  if(value.$numberDecimal!=null) return parseFloat(value.$numberDecimal)||0;
  if(typeof value.toString==="function") return parseFloat(value.toString())||0;
 }
 return 0;
}

async function fetchJson(url){
 const res=await fetch(url);
 const text=await res.text();
 const data=text?JSON.parse(text):{};
 if(!res.ok) throw new Error(data.message||`Request failed: ${url}`);
 return data;
}

function getArray(data,legacyKey){
 if(Array.isArray(data)) return data;
 if(Array.isArray(data?.data)) return data.data;
 if(Array.isArray(data?.[legacyKey])) return data[legacyKey];
 return [];
}

function getElectricitySupplyRate(rate){
 return toNum(rate?.supplyCharges?.ratePerKwh);
}

function getElectricityDeliveryRate(rate){
 return toNum(rate?.deliveryCharges?.deliveryRate);
}

function getElectricitySystemBenefit(rate){
 return toNum(rate?.deliveryCharges?.systemBenefitCharge);
}

function getFuelSupplyRate(rate){
 return toNum(rate?.supplyCharges?.ratePerUnit??rate?.ratePerUnit);
}

function getFuelDeliveryRate(rate){
 return toNum(rate?.deliveryCharges?.deliveryRate??rate?.deliveryRate);
}

function getFuelSystemBenefit(rate){
 return toNum(rate?.deliveryCharges?.systemBenefitCharge??rate?.systemBenefitCharge);
}

function getLatestRates(rates,type){
 if(!rates.length) return{base:0,delivery:0,system:0};

 const sorted=[...rates].sort((a,b)=>new Date(a.billingStartDate)-new Date(b.billingStartDate));
 const current=sorted[sorted.length-1];

 return{
  base:type==="electricity"?getElectricitySupplyRate(current):getFuelSupplyRate(current),
  delivery:type==="electricity"?getElectricityDeliveryRate(current):getFuelDeliveryRate(current),
  system:type==="electricity"?getElectricitySystemBenefit(current):getFuelSystemBenefit(current)
 };
}

function buildTrendData(data){
 if(!data.length) return [];
 if(data.length>1) return data;
 const item=data[0];
 return[
  {...item,date:item.date},
  {...item,date:" "}
 ];
}

function EnergyDashboard(){

 const [electricityAccounts,setElectricityAccounts]=useState([]);
 const [fuelAccounts,setFuelAccounts]=useState([]);
 const [allElectricityRates,setAllElectricityRates]=useState([]);
 const [allFuelRates,setAllFuelRates]=useState([]);
 const [selectedElectricityAccount,setSelectedElectricityAccount]=useState("");
 const [selectedFuelAccount,setSelectedFuelAccount]=useState("");
 const [electricityYearFilter,setElectricityYearFilter]=useState("");
 const [electricityMonthFilter,setElectricityMonthFilter]=useState("");
 const [fuelYearFilter,setFuelYearFilter]=useState("");
 const [fuelMonthFilter,setFuelMonthFilter]=useState("");
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");

 useEffect(()=>{
  const loadDashboardData=async()=>{
   try{
    setLoading(true);
    setError("");

    const results=await Promise.allSettled([
     fetchJson("/api/electricity-accounts"),
     fetchJson("/api/fuel-accounts"),
     fetchJson("/api/electricity-rates"),
     fetchJson("/api/fuel-rates")
    ]);

    const electricityAccountsData=results[0].status==="fulfilled"?results[0].value:{};
    const fuelAccountsData=results[1].status==="fulfilled"?results[1].value:{};
    const electricityRatesData=results[2].status==="fulfilled"?results[2].value:{};
    const fuelRatesData=results[3].status==="fulfilled"?results[3].value:{};

    setElectricityAccounts(getArray(electricityAccountsData,"electricityAccounts"));
    setFuelAccounts(getArray(fuelAccountsData,"fuelAccounts"));
    setAllElectricityRates(getArray(electricityRatesData,"electricityRates"));
    setAllFuelRates(getArray(fuelRatesData,"fuelRates"));

    const errors=results.filter(r=>r.status==="rejected").map(r=>r.reason?.message).filter(Boolean);
    if(errors.length) setError(errors[0]);
   }catch(err){
    setError(err.message||"Failed to load energy dashboard data.");
   }finally{
    setLoading(false);
   }
  };

  loadDashboardData();
 },[]);

 const electricityRates=useMemo(()=>{
  if(!selectedElectricityAccount) return allElectricityRates;
  return allElectricityRates.filter(rate=>{
   const accountId=typeof rate.electricityAccount==="object"?rate.electricityAccount?._id:rate.electricityAccount;
   return String(accountId)===String(selectedElectricityAccount);
  });
 },[allElectricityRates,selectedElectricityAccount]);

 const fuelRates=useMemo(()=>{
  if(!selectedFuelAccount) return allFuelRates;
  return allFuelRates.filter(rate=>{
   const accountId=typeof rate.fuelAccount==="object"?rate.fuelAccount?._id:rate.fuelAccount;
   return String(accountId)===String(selectedFuelAccount);
  });
 },[allFuelRates,selectedFuelAccount]);

 const electricityYears=useMemo(()=>[...new Set(
  electricityRates.map(rate=>new Date(rate.billingStartDate).getFullYear()).filter(Boolean)
 )].sort((a,b)=>b-a),[electricityRates]);

 const fuelYears=useMemo(()=>[...new Set(
  fuelRates.map(rate=>new Date(rate.billingStartDate).getFullYear()).filter(Boolean)
 )].sort((a,b)=>b-a),[fuelRates]);

 const electricityChartData=useMemo(()=>electricityRates.map(rate=>{
  const billingDate=new Date(rate.billingStartDate);
  return{
   date:fmtDate(rate.billingStartDate),
   billingStartDate:rate.billingStartDate,
   year:billingDate.getFullYear(),
   month:billingDate.getMonth()+1,
   supplyRate:getElectricitySupplyRate(rate),
   deliveryRate:getElectricityDeliveryRate(rate),
   systemBenefitRate:getElectricitySystemBenefit(rate)
  };
 }).filter(rate=>{
  if(electricityYearFilter&&rate.year!==Number(electricityYearFilter)) return false;
  if(electricityMonthFilter&&rate.month!==Number(electricityMonthFilter)) return false;
  return true;
 }).sort((a,b)=>new Date(a.billingStartDate)-new Date(b.billingStartDate)),[electricityRates,electricityYearFilter,electricityMonthFilter]);

 const fuelChartData=useMemo(()=>fuelRates.map(rate=>{
  const billingDate=new Date(rate.billingStartDate);
  return{
   date:fmtDate(rate.billingStartDate),
   billingStartDate:rate.billingStartDate,
   year:billingDate.getFullYear(),
   month:billingDate.getMonth()+1,
   supplyRate:getFuelSupplyRate(rate),
   deliveryRate:getFuelDeliveryRate(rate),
   systemBenefitRate:getFuelSystemBenefit(rate)
  };
 }).filter(rate=>{
  if(fuelYearFilter&&rate.year!==Number(fuelYearFilter)) return false;
  if(fuelMonthFilter&&rate.month!==Number(fuelMonthFilter)) return false;
  return true;
 }).sort((a,b)=>new Date(a.billingStartDate)-new Date(b.billingStartDate)),[fuelRates,fuelYearFilter,fuelMonthFilter]);

 const electricityTrendData=useMemo(()=>buildTrendData(electricityChartData),[electricityChartData]);
 const fuelTrendData=useMemo(()=>buildTrendData(fuelChartData),[fuelChartData]);

 const electricityCurrent=useMemo(()=>getLatestRates(electricityRates,"electricity"),[electricityRates]);
 const fuelCurrent=useMemo(()=>getLatestRates(fuelRates,"fuel"),[fuelRates]);

 if(loading){
  return(
   <main className="energy-dashboard py-5">
    <Container fluid>
     <Row>
      <Col xs={12}>
       <h1 className="energy-dashboard-title mb-3">Utility Rate History</h1>
       <p className="energy-dashboard-text mb-0">Loading energy dashboard...</p>
      </Col>
     </Row>
    </Container>
   </main>
  );
 }

 return(
  <main className="energy-dashboard py-5">
   <Container fluid>

    <Row className="mb-4">
     <Col xs={12}>
      <p className="energy-dashboard-eyebrow mb-3">Energy Dashboard</p>
      <h1 className="energy-dashboard-title mb-3">Utility Rate History</h1>
      <p className="energy-dashboard-text mb-0">
       View electricity and fuel rate changes over time, compare delivery and system charges, and monitor historical cost movement for process calculations.
      </p>
      {error?<p className="energy-dashboard-text mb-0 mt-3">{error}</p>:null}
     </Col>
    </Row>

    <Row className="g-4 mb-4">
     <Col md={6} xl={2}>
      <Card className="energy-dashboard-card h-100">
       <Card.Body>
        <p className="energy-dashboard-stat-label mb-2">Electric Supply Rate</p>
        <h2 className="energy-dashboard-stat-value mb-0">{electricityCurrent.base.toFixed(3)}</h2>
       </Card.Body>
      </Card>
     </Col>

     <Col md={6} xl={2}>
      <Card className="energy-dashboard-card h-100">
       <Card.Body>
        <p className="energy-dashboard-stat-label mb-2">Electric Delivery Rate</p>
        <h2 className="energy-dashboard-stat-value mb-0">{electricityCurrent.delivery.toFixed(3)}</h2>
       </Card.Body>
      </Card>
     </Col>

     <Col md={6} xl={2}>
      <Card className="energy-dashboard-card h-100">
       <Card.Body>
        <p className="energy-dashboard-stat-label mb-2">Electric System Benefit</p>
        <h2 className="energy-dashboard-stat-value mb-0">{electricityCurrent.system.toFixed(3)}</h2>
       </Card.Body>
      </Card>
     </Col>

     <Col md={6} xl={2}>
      <Card className="energy-dashboard-card h-100">
       <Card.Body>
        <p className="energy-dashboard-stat-label mb-2">Fuel Supply Rate</p>
        <h2 className="energy-dashboard-stat-value mb-0">{fuelCurrent.base.toFixed(3)}</h2>
       </Card.Body>
      </Card>
     </Col>

     <Col md={6} xl={2}>
      <Card className="energy-dashboard-card h-100">
       <Card.Body>
        <p className="energy-dashboard-stat-label mb-2">Fuel Delivery Rate</p>
        <h2 className="energy-dashboard-stat-value mb-0">{fuelCurrent.delivery.toFixed(3)}</h2>
       </Card.Body>
      </Card>
     </Col>

     <Col md={6} xl={2}>
      <Card className="energy-dashboard-card h-100">
       <Card.Body>
        <p className="energy-dashboard-stat-label mb-2">Fuel System Benefit</p>
        <h2 className="energy-dashboard-stat-value mb-0">{fuelCurrent.system.toFixed(3)}</h2>
       </Card.Body>
      </Card>
     </Col>
    </Row>

    <Row className="g-4 mb-4">
     <Col xl={6}>
      <Card className="energy-dashboard-card h-100">
       <Card.Body>
        <Row className="g-3 align-items-center mb-4">
         <Col lg={4}>
          <div>
           <p className="energy-dashboard-section-eyebrow mb-2">Electricity</p>
           <h3 className="energy-dashboard-section-title mb-0">Rate Trend</h3>
          </div>
         </Col>

         <Col lg={8}>
          <Row className="g-3">
           <Col md={6}>
            <Form.Group controlId="electricityAccount">
             <InputGroup>
              <InputGroup.Text>Account</InputGroup.Text>
              <Form.Select value={selectedElectricityAccount} onChange={e=>setSelectedElectricityAccount(e.target.value)}>
               <option value="">All Accounts</option>
               {electricityAccounts.map(account=>(
                <option key={account._id} value={account._id}>
                 {account.nickname||account.provider||account.accountNumber||"Unnamed Account"}
                </option>
               ))}
              </Form.Select>
             </InputGroup>
            </Form.Group>
           </Col>

           <Col md={3}>
            <Form.Group controlId="electricityYearFilter">
             <InputGroup>
              <InputGroup.Text>Year</InputGroup.Text>
              <Form.Select value={electricityYearFilter} onChange={e=>setElectricityYearFilter(e.target.value)}>
               <option value="">All</option>
               {electricityYears.map(year=>(
                <option key={year} value={year}>{year}</option>
               ))}
              </Form.Select>
             </InputGroup>
            </Form.Group>
           </Col>

           <Col md={3}>
            <Form.Group controlId="electricityMonthFilter">
             <InputGroup>
              <InputGroup.Text>Month</InputGroup.Text>
              <Form.Select value={electricityMonthFilter} onChange={e=>setElectricityMonthFilter(e.target.value)}>
               <option value="">All</option>
               <option value="1">Jan</option>
               <option value="2">Feb</option>
               <option value="3">Mar</option>
               <option value="4">Apr</option>
               <option value="5">May</option>
               <option value="6">Jun</option>
               <option value="7">Jul</option>
               <option value="8">Aug</option>
               <option value="9">Sep</option>
               <option value="10">Oct</option>
               <option value="11">Nov</option>
               <option value="12">Dec</option>
              </Form.Select>
             </InputGroup>
            </Form.Group>
           </Col>
          </Row>
         </Col>
        </Row>

        <div className="energy-dashboard-chart">
         <ResponsiveContainer width="100%" height={360}>
          <LineChart data={electricityTrendData}>
           <CartesianGrid strokeDasharray="3 3"/>
           <XAxis dataKey="date"/>
           <YAxis/>
           <Tooltip formatter={value=>Number(value).toFixed(3)}/>
           <Legend/>
           <Line type="monotone" dataKey="supplyRate" name="Supply Rate" stroke="#6B2D5C" strokeWidth={3} dot={{r:4}} activeDot={{r:6}}/>
           <Line type="monotone" dataKey="deliveryRate" name="Delivery Rate" stroke="#1F4D4F" strokeWidth={3} dot={{r:4}} activeDot={{r:6}}/>
           <Line type="monotone" dataKey="systemBenefitRate" name="System Benefit" stroke="#D7A83C" strokeWidth={3} dot={{r:4}} activeDot={{r:6}}/>
          </LineChart>
         </ResponsiveContainer>
        </div>
       </Card.Body>
      </Card>
     </Col>

     <Col xl={6}>
      <Card className="energy-dashboard-card h-100">
       <Card.Body>
        <Row className="g-3 align-items-center mb-4">
         <Col lg={4}>
          <div>
           <p className="energy-dashboard-section-eyebrow mb-2">Fuel</p>
           <h3 className="energy-dashboard-section-title mb-0">Rate Trend</h3>
          </div>
         </Col>

         <Col lg={8}>
          <Row className="g-3">
           <Col md={6}>
            <Form.Group controlId="fuelAccount">
             <InputGroup>
              <InputGroup.Text>Account</InputGroup.Text>
              <Form.Select value={selectedFuelAccount} onChange={e=>setSelectedFuelAccount(e.target.value)}>
               <option value="">All Accounts</option>
               {fuelAccounts.map(account=>(
                <option key={account._id} value={account._id}>
                 {account.nickname||account.provider||account.accountNumber||"Unnamed Account"}
                </option>
               ))}
              </Form.Select>
             </InputGroup>
            </Form.Group>
           </Col>

           <Col md={3}>
            <Form.Group controlId="fuelYearFilter">
             <InputGroup>
              <InputGroup.Text>Year</InputGroup.Text>
              <Form.Select value={fuelYearFilter} onChange={e=>setFuelYearFilter(e.target.value)}>
               <option value="">All</option>
               {fuelYears.map(year=>(
                <option key={year} value={year}>{year}</option>
               ))}
              </Form.Select>
             </InputGroup>
            </Form.Group>
           </Col>

           <Col md={3}>
            <Form.Group controlId="fuelMonthFilter">
             <InputGroup>
              <InputGroup.Text>Month</InputGroup.Text>
              <Form.Select value={fuelMonthFilter} onChange={e=>setFuelMonthFilter(e.target.value)}>
               <option value="">All</option>
               <option value="1">Jan</option>
               <option value="2">Feb</option>
               <option value="3">Mar</option>
               <option value="4">Apr</option>
               <option value="5">May</option>
               <option value="6">Jun</option>
               <option value="7">Jul</option>
               <option value="8">Aug</option>
               <option value="9">Sep</option>
               <option value="10">Oct</option>
               <option value="11">Nov</option>
               <option value="12">Dec</option>
              </Form.Select>
             </InputGroup>
            </Form.Group>
           </Col>
          </Row>
         </Col>
        </Row>

        <div className="energy-dashboard-chart">
         <ResponsiveContainer width="100%" height={360}>
          <LineChart data={fuelTrendData}>
           <CartesianGrid strokeDasharray="3 3"/>
           <XAxis dataKey="date"/>
           <YAxis/>
           <Tooltip formatter={value=>Number(value).toFixed(3)}/>
           <Legend/>
           <Line type="monotone" dataKey="supplyRate" name="Supply Rate" stroke="#6B2D5C" strokeWidth={3} dot={{r:4}} activeDot={{r:6}}/>
           <Line type="monotone" dataKey="deliveryRate" name="Delivery Rate" stroke="#1F4D4F" strokeWidth={3} dot={{r:4}} activeDot={{r:6}}/>
           <Line type="monotone" dataKey="systemBenefitRate" name="System Benefit" stroke="#D7A83C" strokeWidth={3} dot={{r:4}} activeDot={{r:6}}/>
          </LineChart>
         </ResponsiveContainer>
        </div>
       </Card.Body>
      </Card>
     </Col>
    </Row>

    <Row className="g-4">
     <Col xl={6}>
      <Card className="energy-dashboard-card h-100">
       <Card.Body>
        <p className="energy-dashboard-section-eyebrow mb-2">Electricity</p>
        <h3 className="energy-dashboard-section-title mb-4">Charge Comparison</h3>

        <div className="energy-dashboard-chart">
         <ResponsiveContainer width="100%" height={340}>
          <BarChart data={electricityChartData}>
           <CartesianGrid strokeDasharray="3 3"/>
           <XAxis dataKey="date"/>
           <YAxis/>
           <Tooltip formatter={value=>Number(value).toFixed(3)}/>
           <Legend/>
           <Bar dataKey="supplyRate" name="Supply Rate" fill="#6B2D5C"/>
           <Bar dataKey="deliveryRate" name="Delivery Rate" fill="#1F4D4F"/>
           <Bar dataKey="systemBenefitRate" name="System Benefit" fill="#D7A83C"/>
          </BarChart>
         </ResponsiveContainer>
        </div>
       </Card.Body>
      </Card>
     </Col>

     <Col xl={6}>
      <Card className="energy-dashboard-card h-100">
       <Card.Body>
        <p className="energy-dashboard-section-eyebrow mb-2">Fuel</p>
        <h3 className="energy-dashboard-section-title mb-4">Charge Comparison</h3>

        <div className="energy-dashboard-chart">
         <ResponsiveContainer width="100%" height={340}>
          <BarChart data={fuelChartData}>
           <CartesianGrid strokeDasharray="3 3"/>
           <XAxis dataKey="date"/>
           <YAxis/>
           <Tooltip formatter={value=>Number(value).toFixed(3)}/>
           <Legend/>
           <Bar dataKey="supplyRate" name="Supply Rate" fill="#6B2D5C"/>
           <Bar dataKey="deliveryRate" name="Delivery Rate" fill="#1F4D4F"/>
           <Bar dataKey="systemBenefitRate" name="System Benefit" fill="#D7A83C"/>
          </BarChart>
         </ResponsiveContainer>
        </div>
       </Card.Body>
      </Card>
     </Col>
    </Row>

   </Container>
  </main>
 );
}

export default EnergyDashboard;