// src/pages/Donate.jsx
import {useMemo,useState} from "react";
import {Heart,HandHeart,Utensils,CircleDollarSign,Home,RefreshCcw,TrendingUp,BadgeDollarSign,Mail,MessageSquare,User} from "lucide-react";
import "../styles/donate.css";

const donationOptions=[
 {id:"restore",amount:25,label:"$25",title:"Restore Essentials",description:"Helps provide hygiene kits, socks, blankets, and daily necessities.",frequency:"one-time",icon:HandHeart},
 {id:"meals",amount:50,label:"$50",title:"Meals & Care",description:"Supports hot meals, wellness checks, and direct care supplies.",frequency:"one-time",icon:Utensils},
 {id:"training",amount:100,label:"$100",title:"Workforce Training",description:"Helps fund job readiness materials, coaching, and skill development.",frequency:"one-time",icon:BadgeDollarSign},
 {id:"housing",amount:250,label:"$250",title:"Housing Stabilization",description:"Supports housing restoration, move-in essentials, and reentry support.",frequency:"one-time",icon:Home},
 {id:"monthly-care",amount:25,label:"$25/mo",title:"Monthly Community Care",description:"Provides steady monthly support for emergency and outreach needs.",frequency:"recurring",icon:RefreshCcw},
 {id:"monthly-growth",amount:50,label:"$50/mo",title:"Monthly Growth Fund",description:"Sustains workforce development, restoration projects, and long-term support.",frequency:"recurring",icon:TrendingUp}
];

const Donate=()=>{
 const [selectedOption,setSelectedOption]=useState(donationOptions[0]);
 const [amount,setAmount]=useState(String(donationOptions[0].amount));
 const [frequency,setFrequency]=useState(donationOptions[0].frequency);
 const [donorName,setDonorName]=useState("");
 const [email,setEmail]=useState("");
 const [message,setMessage]=useState("");

 const suggestedAmounts=useMemo(()=>[25,50,100,250,500],[]);

 const handleSelectOption=(option)=>{
  setSelectedOption(option);
  setAmount(String(option.amount));
  setFrequency(option.frequency);
 };

 const handleSuggestedAmount=(value)=>{
  setSelectedOption(null);
  setAmount(String(value));
 };

 const handleFrequencyChange=(nextFrequency)=>{
  setSelectedOption(null);
  setFrequency(nextFrequency);
 };

 const handleCustomAmountFocus=()=>{
  setSelectedOption(null);
 };

 const handleSubmit=(e)=>{
  e.preventDefault();

  const payload={
   amount:Number(amount)||0,
   frequency,
   donorName,
   email,
   message
  };

  console.log("Donation payload:",payload);

  alert(`${frequency==="recurring"?"Recurring":"One-time"} donation of $${payload.amount} prepared.`);
 };

 return(
  <section className="donate-page">
   <div className="donate-page-inner">
    <div className="donate-page-hero">
     <p className="donate-page-eyebrow">Support The Mission</p>
     <h1 className="donate-page-title">Give From The Ground Up</h1>
     <p className="donate-page-text">
      Your donation helps rebuild lives through housing restoration, workforce training, community development, and reentry support.
     </p>
    </div>

    <div className="donate-page-grid">
     <div className="donate-options">
      <h2 className="donate-section-title">Choose a giving option</h2>

      <div className="donate-options-grid">
       {donationOptions.map((option)=>{
        const Icon=option.icon;

        return(
         <button
          key={option.id}
          type="button"
          className={`donate-option-card${selectedOption?.id===option.id?" active":""}`}
          onClick={()=>handleSelectOption(option)}
         >
          <div className="donate-option-top">
           <span className="donate-option-amount">{option.label}</span>
           <span className={`donate-option-frequency ${option.frequency}`}>
            {option.frequency==="recurring"?"Recurring":"One-Time"}
           </span>
          </div>

          <div className="donate-option-heading">
           <Icon size={20} strokeWidth={2.2} className="donate-option-icon" aria-hidden="true"/>
           <h3 className="donate-option-title">{option.title}</h3>
          </div>

          <p className="donate-option-description">{option.description}</p>
         </button>
        );
       })}

       <button
        type="button"
        className={`donate-option-card donate-option-card-custom${selectedOption===null?" active":""}`}
        onClick={handleCustomAmountFocus}
       >
        <div className="donate-option-top">
         <span className="donate-option-amount">Custom</span>
         <span className={`donate-option-frequency ${frequency}`}>
          {frequency==="recurring"?"Recurring":"One-Time"}
         </span>
        </div>

        <div className="donate-option-heading">
         <CircleDollarSign size={20} strokeWidth={2.2} className="donate-option-icon" aria-hidden="true"/>
         <h3 className="donate-option-title">Choose Your Own Amount</h3>
        </div>

        <p className="donate-option-description">Give any amount that fits your heart and capacity.</p>
       </button>
      </div>

      <div className="donate-impact">
       <h2 className="donate-section-title">What your gift supports</h2>

       <ul className="donate-impact-list">
        <li>$25 helps cover basic essentials and outreach support.</li>
        <li>$50 helps provide meals, supplies, and direct care resources.</li>
        <li>$100 helps fund training materials and workforce preparation.</li>
        <li>$250 helps support stabilization, housing needs, and reentry care.</li>
        <li>Monthly giving helps sustain consistent community support year-round.</li>
       </ul>
      </div>
     </div>

     <div className="donate-form-wrap">
      <form className="donate-form" onSubmit={handleSubmit}>
       <h2 className="donate-section-title">Complete your donation</h2>

       <div className="donate-frequency-toggle">
        <button
         type="button"
         className={`donate-frequency-button${frequency==="one-time"?" active":""}`}
         onClick={()=>handleFrequencyChange("one-time")}
        >
         One-Time
        </button>

        <button
         type="button"
         className={`donate-frequency-button${frequency==="recurring"?" active":""}`}
         onClick={()=>handleFrequencyChange("recurring")}
        >
         Recurring
        </button>
       </div>

       <div className="donate-suggested">
        {suggestedAmounts.map((value)=>(
         <button
          key={value}
          type="button"
          className={`donate-suggested-amount${Number(amount)===value?" active":""}`}
          onClick={()=>handleSuggestedAmount(value)}
         >
          ${value}
         </button>
        ))}
       </div>

       <div className="donate-form-group">
        <label htmlFor="donation-amount" className="donate-label"><Heart size={16} strokeWidth={2.2} className="donate-label-icon" aria-hidden="true"/>Donation Amount</label>
        <input
         id="donation-amount"
         className="donate-input"
         type="number"
         min="1"
         step="1"
         value={amount}
         onFocus={handleCustomAmountFocus}
         onChange={(e)=>{
          setSelectedOption(null);
          setAmount(e.target.value);
         }}
         placeholder="Enter any amount"
         required
        />
       </div>

       <div className="donate-form-group">
        <label htmlFor="donor-name" className="donate-label"><User size={16} strokeWidth={2.2} className="donate-label-icon" aria-hidden="true"/>Full Name</label>
        <input
         id="donor-name"
         className="donate-input"
         type="text"
         value={donorName}
         onChange={(e)=>setDonorName(e.target.value)}
         placeholder="Your name"
         required
        />
       </div>

       <div className="donate-form-group">
        <label htmlFor="donor-email" className="donate-label"><Mail size={16} strokeWidth={2.2} className="donate-label-icon" aria-hidden="true"/>Email Address</label>
        <input
         id="donor-email"
         className="donate-input"
         type="email"
         value={email}
         onChange={(e)=>setEmail(e.target.value)}
         placeholder="you@example.com"
         required
        />
       </div>

       <div className="donate-form-group">
        <label htmlFor="donor-message" className="donate-label"><MessageSquare size={16} strokeWidth={2.2} className="donate-label-icon" aria-hidden="true"/>Message <span className="donate-optional">(optional)</span></label>
        <textarea
         id="donor-message"
         className="donate-textarea"
         rows="4"
         value={message}
         onChange={(e)=>setMessage(e.target.value)}
         placeholder="Share why you're giving"
        />
       </div>

       <div className="donate-summary">
        <p className="donate-summary-text">
         You are making a <strong>{frequency==="recurring"?"recurring":"one-time"}</strong> donation of <strong>${Number(amount)||0}</strong>.
        </p>
       </div>

       <button type="submit" className="donate-submit">
        Continue to Donate
       </button>
      </form>
     </div>
    </div>
   </div>
  </section>
 );
};

export default Donate;
