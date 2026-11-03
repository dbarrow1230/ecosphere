import {notify} from "../../utils/feedback.js";
import "../../styles/tasting-ratings.css";
import {useReactToPrint} from "react-to-print";
import TastingPrintCards from "../../components/TastingPrintCards.jsx";
import {useRef,useState} from "react";
import "../../styles/tasting-form.css";
import {Wine,Plus,Trash2,Save,Heart,ThumbsUp,X,Printer} from "lucide-react";

const BeverageTastingForm=({userId})=>{
    const printRef=useRef(null);
    const printCards=useReactToPrint({contentRef:printRef,documentTitle:"Blank beverage tasting cards",pageStyle:"@page { size: letter landscape; margin: 0.25in; }"});
    // Helper: creates a blank beverage entry
    const createEmptyBeverage=(order)=>({
        order,
        beverageType:"wine",
        vintageOrYear:"",
        name:"",
        producer:"",
        region:"",
        style:"",
        producerNotes:"",
        personalNotes:"",
        culinaryApplications:"",
        rating:""
    });

    const [formData,setFormData]=useState({
        userId:userId||"",
        businessName:"",
        title:"",
        tastingDate:"",
        venue:"",
        location:"",
        beverages:[createEmptyBeverage(1)],
        overallNotes:""
    });
    const setMessage=message=>notify(message,"success");
    const setError=message=>notify(message,"danger");
    const [saving,setSaving]=useState(false);

    const handleChange=(e)=>{
        const {name,value}=e.target;
        setFormData((prev)=>({...prev,[name]:value}));
    };

    const handlePrint=()=>{
        for(const [key,title] of [["businessName","tasting business"],["title","title"],["tastingDate","tasting date"],["venue","venue"],["location","location"]]){
            if(!String(formData[key]||"").trim()){
                setError(`Enter the ${title} before printing cards.`);
                return;
            }
        }
        printCards();
    };

    const handleBeverageChange=(index,e)=>{
        const {name,value}=e.target;
        setFormData((prev)=>{
            const beverages=[...prev.beverages];
            beverages[index]={...beverages[index],[name]:value};
            return {...prev,beverages};
        });
    };

    const handleRating=(index,rating)=>{
        setFormData((prev)=>{
            const beverages=[...prev.beverages];
            beverages[index]={...beverages[index],rating:beverages[index].rating===rating?"":rating};
            return {...prev,beverages};
        });
    };

    const addBeverage=()=>{
        setFormData((prev)=>({
            ...prev,
            beverages:[...prev.beverages,createEmptyBeverage(prev.beverages.length+1)]
        }));
    };

    const removeBeverage=(index)=>{
        setFormData((prev)=>({
            ...prev,
            beverages:prev.beverages.filter((_,beverageIndex)=>beverageIndex!==index).map((beverage,beverageIndex)=>({...beverage,order:beverageIndex+1}))
        }));
    };

    const handleSubmit=async(e)=>{
        e.preventDefault();
        setMessage("");
        setError("");
        setSaving(true);
        try{
            const response=await fetch("/api/beverage-tastings",{
                method:"POST",
                headers:{"Content-Type":"application/json"},
                body:JSON.stringify(formData)
            });
            const data=await response.json();
            if(!response.ok){
                throw new Error(data.message||"Unable to save beverage tasting");
            }
            setMessage("Beverage tasting saved.");
            setFormData({
                userId:userId||"",
                businessName:"",
                title:"",
                tastingDate:"",
                venue:"",
                location:"",
                beverages:[createEmptyBeverage(1)],
                overallNotes:""
            });
        }catch(error){
            setError(error.message);
        }finally{
            setSaving(false);
        }
    };

    const input=(name,title,value,onChange,type="text",required=false)=><div className="tasting-field" key={name}><label htmlFor={name}>{title}:</label><input id={name} name={name.replace(/^beverage-\d+-/,"")} className="form-control" type={type} value={value} onChange={onChange} required={required}/></div>;
    return <section className="app-page py-4 tasting-page">
     <header className="tasting-heading"><Wine size={28} aria-hidden="true"/><h1>Beverage tasting</h1><button type="button" className="btn btn-outline-primary tasting-icon-button" onClick={handlePrint}><Printer size={16} aria-hidden="true"/>Print blank cards</button></header>
     <form className="tasting-form" onSubmit={handleSubmit}>
      <fieldset className="tasting-editor" disabled={saving}>
       <section className="tasting-section" aria-labelledby="tasting-details"><h2 id="tasting-details">Tasting details</h2><div className="tasting-fields">
        {input("businessName","Tasting business",formData.businessName,handleChange,"text",true)}
        {input("title","Title",formData.title,handleChange,"text",true)}
        {input("tastingDate","Tasting date",formData.tastingDate,handleChange,"date",true)}
        {input("venue","Venue",formData.venue,handleChange)}
        {input("location","Location",formData.location,handleChange)}
       </div></section>
       {formData.beverages.map((beverage,index)=><section className="tasting-section" key={index} aria-labelledby={`tasting-beverage-${index}`}>
        <header className="tasting-section-heading"><h2 id={`tasting-beverage-${index}`}><Wine size={19} aria-hidden="true"/>Beverage {index+1}</h2>{formData.beverages.length>1&&<button className="btn btn-outline-danger" type="button" aria-label={`Remove beverage ${index+1}`} onClick={()=>removeBeverage(index)}><Trash2 size={16}/></button>}</header>
        <div className="tasting-fields">
         <div className="tasting-field"><label htmlFor={`beverage-${index}-beverageType`}>Type:</label><select id={`beverage-${index}-beverageType`} name="beverageType" className="form-select" value={beverage.beverageType} onChange={e=>handleBeverageChange(index,e)}>{["wine","beer","cider","spirit","other"].map(type=><option key={type} value={type}>{type[0].toUpperCase()+type.slice(1)}</option>)}</select></div>
         {[["name","Name"],["vintageOrYear","Vintage / year"],["producer","Producer"],["region","Region"],["style","Style"]].map(([key,title])=>input(`beverage-${index}-${key}`,title,beverage[key],e=>handleBeverageChange(index,e),"text",key==="name"))}
        </div>
        <div className="tasting-notes-grid">{[["producerNotes","Producer tasting notes"],["personalNotes","My notes"],["culinaryApplications","Culinary applications"]].map(([key,title])=><div className="tasting-notes" key={key}><label htmlFor={`beverage-${index}-${key}`}>{title}:</label><textarea id={`beverage-${index}-${key}`} name={key} className="form-control" rows={4} value={beverage[key]} onChange={e=>handleBeverageChange(index,e)}/></div>)}</div>
        <div className="tasting-rating"><span className="detail-label">Rating:</span><div className="tasting-rating-options" role="group" aria-label={`Beverage ${index+1} rating`}>{[["love","Love it"],["like","Like it"],["leave","Leave it"]].map(([value,title])=><button type="button" key={value} className={`btn tasting-rating-choice tasting-rating--${value}`} aria-pressed={beverage.rating===value} onClick={()=>handleRating(index,value)}>{value==="love"?<Heart size={16} aria-hidden="true"/>:value==="like"?<ThumbsUp size={16} aria-hidden="true"/>:<X size={16} aria-hidden="true"/>}{title}</button>)}</div></div>
       </section>)}
       <div><button type="button" className="btn btn-outline-primary tasting-icon-button" onClick={addBeverage}><Plus size={16} aria-hidden="true"/>Add beverage</button></div>
       <section className="tasting-section tasting-notes"><label htmlFor="overallNotes">Overall tasting notes:</label><textarea id="overallNotes" name="overallNotes" className="form-control" rows={5} value={formData.overallNotes} onChange={handleChange}/></section>
       <div className="tasting-actions"><button type="submit" className="btn btn-primary tasting-icon-button"><Save size={16} aria-hidden="true"/>{saving?"Saving…":"Save tasting"}</button></div>
      </fieldset>
     </form>
     <TastingPrintCards contentRef={printRef} details={formData}/>
    </section>;
};

export default BeverageTastingForm;
