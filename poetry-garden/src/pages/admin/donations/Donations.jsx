// src/pages/admin/donations/Donations.jsx
import {useEffect,useMemo,useState} from "react";
import "./Donations.css";

const Donations=()=>{
 const [donations,setDonations]=useState([]);
 const [donors,setDonors]=useState([]);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");
 const [view,setView]=useState("donations");
 const [search,setSearch]=useState("");

 useEffect(()=>{
  const fetchData=async()=>{
   try{
    setLoading(true);
    setError("");

    const [donationsRes,donorsRes]=await Promise.all([
     fetch("/api/donations"),
     fetch("/api/donor-contacts")
    ]);

    if(!donationsRes.ok||!donorsRes.ok){
     throw new Error("Failed to load donation data.");
    }

    const [donationsData,donorsData]=await Promise.all([
     donationsRes.json(),
     donorsRes.json()
    ]);

    setDonations(Array.isArray(donationsData)?donationsData:[]);
    setDonors(Array.isArray(donorsData)?donorsData:[]);
   }catch(err){
    setError(err.message||"Failed to load donation data.");
   }finally{
    setLoading(false);
   }
  };

  fetchData();
 },[]);

 const donationTotals=useMemo(()=>{
  const totalAmount=donations.reduce((sum,item)=>sum+(Number(item.amount)||0),0);
  const completedAmount=donations.reduce((sum,item)=>item.status==="completed"?sum+(Number(item.amount)||0):sum,0);
  const recurringCount=donations.filter((item)=>item.frequency==="recurring").length;

  return{
   totalCount:donations.length,
   donorCount:donors.length,
   totalAmount,
   completedAmount,
   recurringCount
  };
 },[donations,donors]);

 const filteredDonations=useMemo(()=>{
  const term=search.trim().toLowerCase();

  if(!term){
   return donations;
  }

  return donations.filter((item)=>{
   const donorName=item.donor?.name?.toLowerCase()||"";
   const donorEmail=item.donor?.email?.toLowerCase()||"";
   const status=item.status?.toLowerCase()||"";
   const frequency=item.frequency?.toLowerCase()||"";
   const amount=String(item.amount||"");

   return donorName.includes(term)||donorEmail.includes(term)||status.includes(term)||frequency.includes(term)||amount.includes(term);
  });
 },[donations,search]);

 const filteredDonors=useMemo(()=>{
  const term=search.trim().toLowerCase();

  if(!term){
   return donors;
  }

  return donors.filter((item)=>{
   const name=item.name?.toLowerCase()||"";
   const email=item.email?.toLowerCase()||"";
   const phone=item.phone?.toLowerCase()||"";
   const company=item.company?.toLowerCase()||"";
   const city=item.city?.toLowerCase()||"";
   const postalCode=item.postalCode?.toLowerCase()||"";
   const stateName=item.state?.name?.toLowerCase()||item.state?.code?.toLowerCase()||"";
   const countryName=item.country?.name?.toLowerCase()||item.country?.code?.toLowerCase()||"";

   return name.includes(term)||email.includes(term)||phone.includes(term)||company.includes(term)||city.includes(term)||postalCode.includes(term)||stateName.includes(term)||countryName.includes(term);
  });
 },[donors,search]);

 const formatAmount=(value)=>{
  return new Intl.NumberFormat("en-US",{style:"currency",currency:"USD"}).format(Number(value)||0);
 };

 const formatDate=(value)=>{
  if(!value){
   return "—";
  }

  const date=new Date(value);

  if(Number.isNaN(date.getTime())){
   return "—";
  }

  return date.toLocaleDateString("en-US",{year:"numeric",month:"short",day:"numeric"});
 };

 const getStatusClass=(status)=>{
  if(status==="completed"){
   return "completed";
  }

  if(status==="failed"){
   return "failed";
  }

  return "pending";
 };

 const renderAddress=(item)=>{
  const parts=[
   item.address1,
   item.address2,
   item.city,
   item.state?.name||item.state?.code,
   item.postalCode,
   item.country?.name||item.country?.code
  ].filter(Boolean);

  return parts.length?parts.join(", "):"—";
 };

 return(
  <section className="admin-donations-page">
   <div className="admin-donations-inner">
    <div className="admin-donations-header">
     <div>
      <p className="admin-donations-eyebrow">Admin</p>
      <h1 className="admin-donations-title">Donations & Donors</h1>
      <p className="admin-donations-text">View donations, donor contacts, totals, and giving activity.</p>
     </div>
    </div>

    <div className="admin-donations-stats">
     <div className="admin-donations-stat-card">
      <span className="admin-donations-stat-label">Total Donations</span>
      <strong className="admin-donations-stat-value">{donationTotals.totalCount}</strong>
     </div>

     <div className="admin-donations-stat-card">
      <span className="admin-donations-stat-label">Total Donors</span>
      <strong className="admin-donations-stat-value">{donationTotals.donorCount}</strong>
     </div>

     <div className="admin-donations-stat-card">
      <span className="admin-donations-stat-label">Raised</span>
      <strong className="admin-donations-stat-value">{formatAmount(donationTotals.totalAmount)}</strong>
     </div>

     <div className="admin-donations-stat-card">
      <span className="admin-donations-stat-label">Completed</span>
      <strong className="admin-donations-stat-value">{formatAmount(donationTotals.completedAmount)}</strong>
     </div>

     <div className="admin-donations-stat-card">
      <span className="admin-donations-stat-label">Recurring Gifts</span>
      <strong className="admin-donations-stat-value">{donationTotals.recurringCount}</strong>
     </div>
    </div>

    <div className="admin-donations-toolbar">
     <div className="admin-donations-tabs" role="tablist" aria-label="Donation views">
      <button type="button" className={`admin-donations-tab${view==="donations"?" active":""}`} onClick={()=>setView("donations")} aria-pressed={view==="donations"}>Donations</button>
      <button type="button" className={`admin-donations-tab${view==="donors"?" active":""}`} onClick={()=>setView("donors")} aria-pressed={view==="donors"}>Donors</button>
     </div>

     <div className="admin-donations-search-wrap">
      <input
       type="text"
       className="admin-donations-search"
       value={search}
       onChange={(e)=>setSearch(e.target.value)}
       placeholder={view==="donations"?"Search donations":"Search donors"}
       aria-label={view==="donations"?"Search donations":"Search donors"}
      />
     </div>
    </div>

    {loading&&<div className="admin-donations-state">Loading donation data...</div>}
    {!loading&&error&&<div className="admin-donations-state error">{error}</div>}

    {!loading&&!error&&view==="donations"&&(
     <div className="admin-donations-table-wrap">
      <table className="admin-donations-table">
       <thead>
        <tr>
         <th>Donor</th>
         <th>Email</th>
         <th>Amount</th>
         <th>Frequency</th>
         <th>Status</th>
         <th>Date</th>
         <th>Message</th>
        </tr>
       </thead>

       <tbody>
        {filteredDonations.length===0&&(
         <tr>
          <td colSpan="7" className="admin-donations-empty">No donations found.</td>
         </tr>
        )}

        {filteredDonations.map((item)=>(
         <tr key={item._id}>
          <td>{item.donor?.name||"—"}</td>
          <td>{item.donor?.email||"—"}</td>
          <td>{formatAmount(item.amount)}</td>
          <td>{item.frequency==="recurring"?"Recurring":"One-Time"}</td>
          <td>
           <span className={`admin-donations-status ${getStatusClass(item.status)}`}>
            {item.status||"pending"}
           </span>
          </td>
          <td>{formatDate(item.createdAt)}</td>
          <td>{item.message||"—"}</td>
         </tr>
        ))}
       </tbody>
      </table>
     </div>
    )}

    {!loading&&!error&&view==="donors"&&(
     <div className="admin-donations-table-wrap">
      <table className="admin-donations-table">
       <thead>
        <tr>
         <th>Name</th>
         <th>Email</th>
         <th>Phone</th>
         <th>Company</th>
         <th>Address</th>
         <th>Mailing Opt In</th>
         <th>Created</th>
        </tr>
       </thead>

       <tbody>
        {filteredDonors.length===0&&(
         <tr>
          <td colSpan="7" className="admin-donations-empty">No donors found.</td>
         </tr>
        )}

        {filteredDonors.map((item)=>(
         <tr key={item._id}>
          <td>{item.name||"—"}</td>
          <td>{item.email||"—"}</td>
          <td>{item.phone||"—"}</td>
          <td>{item.company||"—"}</td>
          <td>{renderAddress(item)}</td>
          <td>{item.mailingOptIn?"Yes":"No"}</td>
          <td>{formatDate(item.createdAt)}</td>
         </tr>
        ))}
       </tbody>
      </table>
     </div>
    )}
   </div>
  </section>
 );
};

export default Donations;
