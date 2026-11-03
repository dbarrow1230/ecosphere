import {formatDate} from "../utils/dateFormat.js";
import "../styles/tasting-print.css";

const line=(title,value="")=><div className="tasting-paper-field" key={title}><strong>{title}:</strong><span>{value}</span></div>;
const notes=(title,count)=><section className="tasting-paper-notes" key={title}><strong>{title}:</strong>{Array.from({length:count},(_,index)=><div key={index}/>)}</section>;

export default function TastingPrintCards({contentRef,details={}}){
 return <div ref={contentRef} className="tasting-print-document">
  {["front","back"].map(side=><div className="tasting-print-sheet" key={side}>
   {[1,2].map(number=><article className="tasting-paper-card" key={number}>
    <h1>{details.businessName}</h1>
    {line("Tasting title",details.title)}
    <div className="tasting-paper-row">{line("Date",formatDate(details.tastingDate))}{line("Beverage #")}</div>
    {side==="front"?<>
     {line("Venue",details.venue)}{line("Location",details.location)}
     <div className="tasting-paper-types"><strong>Type:</strong>{["Wine","Beer","Cider","Spirit","Other"].map(type=><span key={type}>□ {type}</span>)}</div>
     {line("Beverage name")}
     <div className="tasting-paper-row">{line("Vintage / year")}{line("Style")}</div>
     {line("Producer")}{line("Region")}
     {notes("My notes",8)}
     <div className="tasting-paper-types"><strong>Rating:</strong><span>□ Love it</span><span>□ Like it</span><span>□ Leave it</span></div>
    </>:<>
     {line("Beverage name")}
     {notes("Producer tasting notes",5)}
     {notes("Culinary applications",8)}
     {notes("Overall tasting notes",5)}
    </>}
   </article>)}
  </div>)}
 </div>;
}
