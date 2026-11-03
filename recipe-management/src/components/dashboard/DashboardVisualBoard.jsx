import {useState} from "react";
import {Link} from "react-router-dom";
import {Bar,BarChart,CartesianGrid,Cell,Line,LineChart,Pie,PieChart,ResponsiveContainer,Tooltip,XAxis,YAxis} from "recharts";
import ReadingCalendarCard from "./ReadingCalendarCard.jsx";
import {getBookAuthor,getBookEffectiveCost,getBookTitle,getFormatNames,getGenreBreakdown,getValueByFormat,isActiveLoan} from "./dashboardUtils.js";

const COLORS=["#2f80ed","#56ccf2","#f2c94c","#f2994a","#eb5757","#9b51e0","#27ae60","#828282"];

const monthNames=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const normalizeText=value=>String(value??"").trim();

const hasText=value=>normalizeText(value).length>0;

const normalizeKey=value=>normalizeText(value).toLowerCase();

const getFirstValue=(source,keys)=>{
 for(const key of keys){
  const value=key.split(".").reduce((current,part)=>current?.[part],source);
  if(hasText(value))return value;
 }
 return "";
};

const isTruthyValue=value=>{
 if(value===true)return true;
 const normalized=normalizeKey(value);
 return normalized==="yes"||normalized==="y"||normalized==="true"||normalized==="1"||normalized==="required";
};

const getBookIdentifiers=book=>({
 isbn10:getFirstValue(book,[
  "isbn10",
  "isbn_10",
  "ISBN10",
  "ISBN_10",
  "ISBN-10",
  "identifiers.isbn10",
  "identifiers.isbn_10",
  "identifiers.ISBN10",
  "metadata.isbn10",
  "metadata.isbn_10"
 ]),
 isbn13:getFirstValue(book,[
  "isbn13",
  "isbn_13",
  "ISBN13",
  "ISBN_13",
  "ISBN-13",
  "identifiers.isbn13",
  "identifiers.isbn_13",
  "identifiers.ISBN13",
  "metadata.isbn13",
  "metadata.isbn_13"
 ]),
 eisbn:getFirstValue(book,[
  "eisbn",
  "eIsbn",
  "eISBN",
  "EISBN",
  "ebookIsbn",
  "ebookISBN",
  "digitalIsbn",
  "digitalISBN",
  "identifiers.eisbn",
  "identifiers.eIsbn",
  "identifiers.eISBN",
  "metadata.eisbn",
  "metadata.eIsbn"
 ]),
 asin:getFirstValue(book,[
  "asin",
  "ASIN",
  "amazonAsin",
  "amazonASIN",
  "amazon_asin",
  "identifiers.asin",
  "identifiers.ASIN",
  "metadata.asin",
  "metadata.ASIN"
 ])
});

const isAmazonRequired=book=>{
 if(isTruthyValue(book?.amazonListingRequired))return true;
 if(isTruthyValue(book?.amazonRequired))return true;
 if(isTruthyValue(book?.asinRequired))return true;
 if(isTruthyValue(book?.requiresAsin))return true;
 if(isTruthyValue(book?.requiresASIN))return true;
 if(isTruthyValue(book?.requiresAmazon))return true;
 if(isTruthyValue(book?.amazon?.required))return true;
 if(isTruthyValue(book?.metadata?.amazonListingRequired))return true;

 const catalogStatus=normalizeKey(book?.catalogStatus);
 return catalogStatus==="amazon required"||catalogStatus==="asin required";
};

const isDigitalBook=book=>{
 const formats=getFormatNames(book).map(format=>normalizeKey(format));
 return formats.some(format=>
  format.includes("digital")||
  format.includes("ebook")||
  format.includes("e-book")||
  format.includes("kindle")||
  format.includes("pdf")||
  format.includes("epub")||
  format.includes("mobi")
 );
};

const isPhysicalBook=book=>{
 const formats=getFormatNames(book).map(format=>normalizeKey(format));
 if(!formats.length)return true;
 return formats.some(format=>
  format.includes("hardcover")||
  format.includes("softcover")||
  format.includes("paperback")||
  format==="book"||
  format.includes("print")
 );
};

const hasBookCover=book=>{
 if(Array.isArray(book?.images)&&book.images.some(hasText))return true;
 if(Array.isArray(book?.imageLinks)&&book.imageLinks.some(hasText))return true;
 if(hasText(book?.coverUrl))return true;
 if(hasText(book?.coverURL))return true;
 if(hasText(book?.cover))return true;
 if(hasText(book?.imageUrl))return true;
 if(hasText(book?.imageURL))return true;
 if(hasText(book?.thumbnail))return true;
 if(hasText(book?.metadata?.coverUrl))return true;
 return false;
};

const hasBookPublisher=book=>{
 if(hasText(book?.publisher))return true;
 if(hasText(book?.publisherName))return true;
 if(hasText(book?.publisherId))return true;
 if(hasText(book?.publisher?._id))return true;
 if(hasText(book?.publisher?.name))return true;
 if(Array.isArray(book?.publishers)&&book.publishers.length>0)return true;
 return false;
};

const hasBookSubjects=book=>{
 if(Array.isArray(book?.subjects)&&book.subjects.length>0)return true;
 if(Array.isArray(book?.genres)&&book.genres.length>0)return true;
 if(Array.isArray(book?.categories)&&book.categories.length>0)return true;
 if(Array.isArray(book?.tags)&&book.tags.length>0)return true;
 if(hasText(book?.subject))return true;
 if(hasText(book?.genre))return true;
 if(hasText(book?.category))return true;
 return false;
};

const isManualEntry=book=>{
 const status=normalizeKey(book?.catalogStatus);
 const source=normalizeKey(book?.source);
 const entrySource=normalizeKey(book?.entrySource);
 const createdBy=normalizeKey(book?.createdByImport);
 const importSource=normalizeKey(book?.importSource);

 return status==="manual entry"||
  source==="manual"||
  entrySource==="manual"||
  importSource==="manual"||
  createdBy==="manual";
};

const getDuplicateRecordCount=values=>{
 const seen=new Map();

 values
  .map(value=>normalizeKey(value))
  .filter(Boolean)
  .forEach(value=>seen.set(value,(seen.get(value)||0)+1));

 return Array.from(seen.values()).reduce((sum,count)=>sum+(count>1?count:0),0);
};

const getDashboardMetadataCounts=(books,authorMap)=>{
 const rows=Array.isArray(books)?books:[];

 const identifierRows=rows.map(book=>{
  const identifiers=getBookIdentifiers(book);
  const hasIsbn10=hasText(identifiers.isbn10);
  const hasIsbn13=hasText(identifiers.isbn13);
  const hasEisbn=hasText(identifiers.eisbn);
  const hasAsin=hasText(identifiers.asin);
  const hasAnyIsbn=hasIsbn10||hasIsbn13||hasEisbn;
  const amazonRequired=isAmazonRequired(book);

  return {
   book,
   identifiers,
   hasIsbn10,
   hasIsbn13,
   hasEisbn,
   hasAsin,
   hasAnyIsbn,
   hasAnyIdentifier:hasAnyIsbn||hasAsin,
   amazonRequired,
   digital:isDigitalBook(book),
   physical:isPhysicalBook(book)
  };
 });

 return {
  missingAuthors:rows.filter(book=>!hasText(getBookAuthor(book,authorMap))).length,
  missingPublishers:rows.filter(book=>!hasBookPublisher(book)).length,
  missingFormats:rows.filter(book=>getFormatNames(book).length===0).length,
  missingCovers:rows.filter(book=>!hasBookCover(book)).length,

  // ISBN/eISBN fields are format-specific cleanup queues, not universal requirements.
  missingIsbn10:identifierRows.filter(row=>row.physical&&!row.hasAnyIsbn).length,
  missingIsbn13:identifierRows.filter(row=>row.physical&&!row.hasAnyIsbn).length,
  missingEisbn:identifierRows.filter(row=>row.digital&&!row.hasEisbn).length,

  // ASIN is not required for every book.
  // It is only counted as missing when the book explicitly requires an Amazon listing / ASIN.
  missingAsin:identifierRows.filter(row=>row.amazonRequired&&!row.hasAsin).length,

  hasIdentifier:identifierRows.filter(row=>row.hasAnyIdentifier).length,
  asinOnly:identifierRows.filter(row=>row.hasAsin&&!row.hasAnyIsbn).length,
  noIsbn:identifierRows.filter(row=>!row.hasAnyIsbn).length,
  digitalNoIsbn:identifierRows.filter(row=>row.digital&&!row.hasAnyIsbn).length,
  manualEntry:rows.filter(isManualEntry).length,
  missingSubjects:rows.filter(book=>!hasBookSubjects(book)).length,

  duplicateIsbns:getDuplicateRecordCount([
   ...identifierRows.map(row=>row.identifiers.isbn10),
   ...identifierRows.map(row=>row.identifiers.isbn13),
   ...identifierRows.map(row=>row.identifiers.eisbn)
  ]),
  duplicateAsins:getDuplicateRecordCount(identifierRows.map(row=>row.identifiers.asin)),
  duplicateTitles:getDuplicateRecordCount(rows.map(book=>getBookTitle(book)))
 };
};

const getFinishedDate=book=>{
 const status=String(book?.reading?.status||"").toLowerCase().trim();
 if(status!=="finished"||!book?.reading?.finishedAt)return null;
 const value=book.reading.finishedAt;
 const date=new Date(value||0);
 return Number.isNaN(date.getTime())?null:date;
};

const getPurchaseDate=book=>{
 if(!book?.purchaseDate)return null;
 const date=new Date(book.purchaseDate);
 return Number.isNaN(date.getTime())?null:date;
};

const getBookPages=book=>Number(book?.reading?.totalPages||book?.pages||book?.pageCount||0);

function Panel({id,kicker,title,children,className="",actionLabel,actionTo,onAction}){
 return(
  <section id={id} className={`dashboard-board-panel ${className}`}>
   <div className="dashboard-board-panel-head">
    <div>
     <p>{kicker}</p>
     <h2>{title}</h2>
    </div>
    {actionLabel&&onAction?<button type="button" className="dashboard-board-panel-link" onClick={onAction}>{actionLabel}</button>:null}
    {actionLabel&&!onAction&&actionTo?<Link to={actionTo} className="dashboard-board-panel-link">{actionLabel}</Link>:null}
   </div>
   {children}
  </section>
 );
}

function NewLibraryChart({books}){
 const currentYear=new Date().getFullYear();
 const years=Array.from({length:6},(_,index)=>currentYear-5+index);
 const data=years.map(year=>({
  year:String(year),
  books:books.filter(book=>getPurchaseDate(book)?.getFullYear()===year).length
 }));

 return(
  <Panel kicker="Catalog" title="New in Library" className="dashboard-board-chart" actionLabel="View library" actionTo="/books?sort=purchaseDate">
   <ResponsiveContainer width="100%" height={155}>
    <BarChart data={data}>
     <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false}/>
     <XAxis dataKey="year" tickLine={false} axisLine={false} fontSize={11}/>
     <YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={11}/>
     <Tooltip/>
     <Bar dataKey="books" fill="var(--primary)" radius={[2,2,0,0]} barSize={14} maxBarSize={14}/>
    </BarChart>
   </ResponsiveContainer>
  </Panel>
 );
}

function ReadingYearChart({books}){
 const currentYear=new Date().getFullYear();
 const years=Array.from({length:6},(_,index)=>currentYear-5+index);
 const data=years.map(year=>{
  const finished=books.filter(book=>getFinishedDate(book)?.getFullYear()===year);
  return{
   year:String(year),
   books:finished.length,
   pages:finished.reduce((sum,book)=>sum+getBookPages(book),0)
  };
 });

 return(
  <Panel kicker="Reading" title="Read per Year" className="dashboard-board-chart" actionLabel="View finished" actionTo="/books?reading=finished">
   <ResponsiveContainer width="100%" height={155}>
    <BarChart data={data}>
     <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false}/>
     <XAxis dataKey="year" tickLine={false} axisLine={false} fontSize={11}/>
     <YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={11}/>
     <Tooltip/>
     <Bar dataKey="books" fill="var(--secondary)" radius={[2,2,0,0]} barSize={14} maxBarSize={14}/>
    </BarChart>
   </ResponsiveContainer>
  </Panel>
 );
}

function OutlookList({books,authorMap}){
 const current=books
  .filter(book=>String(book?.reading?.status||"").toLowerCase()==="reading")
  .map(book=>{
   const currentPage=Number(book?.reading?.currentPage||0);
   const totalPages=Number(book?.reading?.totalPages||0);
   const percent=totalPages?Math.round((currentPage/totalPages)*100):Number(book?.reading?.progressPercent||0);
   return{_id:book._id,title:getBookTitle(book),author:getBookAuthor(book,authorMap),percent,currentPage,totalPages};
  })
  .sort((a,b)=>b.percent-a.percent)
  .slice(0,8);

 return(
  <Panel kicker="Outlook" title="Up Next" className="dashboard-board-list" actionLabel="View reading" actionTo="/books?reading=reading">
   <div className="dashboard-outlook-list">
    {!current.length?<div className="dashboard-board-empty">No books are marked reading.</div>:current.map(item=>(
     <Link key={item._id} to={`/books?book=${encodeURIComponent(item._id)}`} className="dashboard-outlook-row">
      <span>{item.title}</span>
      <strong>{item.percent}%</strong>
     </Link>
    ))}
   </div>
  </Panel>
 );
}

function FormatTypes({books}){
 const formats=[
  {label:"Book",match:item=>item.includes("hardcover")||item.includes("softcover")||item.includes("paperback")},
  {label:"Digital",match:item=>item.includes("digital")||item.includes("ebook")||item.includes("e-book")||item.includes("kindle")||item.includes("pdf")},
  {label:"Audio",match:item=>item.includes("audio")},
  {label:"Other",match:item=>!item}
 ];
 const rows=formats.map(row=>({
  label:row.label,
  value:books.filter(book=>{
   const names=getFormatNames(book);
   return row.label==="Other"?!names.length:names.some(row.match);
  }).length
 }));

 return(
  <Panel kicker="Formats" title="Types" className="dashboard-board-strip" actionLabel="View formats" actionTo="/collections#formats">
   <div className="dashboard-type-grid">
    {rows.map((row,index)=><div key={row.label} className={`dashboard-type-badge dashboard-type-badge-${index}`}><span>{row.label}</span><strong>{row.value}</strong></div>)}
   </div>
  </Panel>
 );
}

function CategoryDonut({books}){
 const data=getGenreBreakdown(books).slice(0,8).map(item=>({name:item.label,value:item.value}));
 const total=data.reduce((sum,item)=>sum+item.value,0);

 return(
  <Panel kicker="Collection" title="Top Categories" className="dashboard-donut-panel dashboard-board-tall" actionLabel="View catalog" actionTo="/books">
   <div className="dashboard-donut-layout">
    <ResponsiveContainer width="100%" height={190}>
     <PieChart>
      <Pie data={data} dataKey="value" innerRadius={62} outerRadius={94} paddingAngle={1}>
       {data.map((entry,index)=><Cell key={entry.name} fill={COLORS[index%COLORS.length]}/>)}
      </Pie>
      <Tooltip/>
     </PieChart>
    </ResponsiveContainer>
    <div className="dashboard-donut-center"><span>Library</span><strong>{total}</strong></div>
    <div className="dashboard-donut-legend">
     {data.map((item,index)=><div key={item.name}><i style={{background:COLORS[index%COLORS.length]}} />{item.name}</div>)}
    </div>
   </div>
  </Panel>
 );
}

function MonthlyOverview({books}){
 const currentYear=new Date().getFullYear();
 const years=Array.from({length:6},(_,index)=>currentYear-5+index);
 const max=Math.max(1,...years.flatMap(year=>monthNames.map((_,month)=>books.filter(book=>{
  const date=getFinishedDate(book);
  return date&&date.getFullYear()===year&&date.getMonth()===month;
 }).length)));

 return(
  <Panel kicker="Calendar" title="Monthly Overview">
   <div className="dashboard-heatmap">
    <div className="dashboard-heatmap-head"><span>Month</span>{years.map(year=><span key={year}>{year}</span>)}</div>
    {monthNames.map((monthLabel,month)=>(
     <div key={monthLabel} className="dashboard-heatmap-row">
      <span>{monthLabel}</span>
      {years.map(year=>{
       const count=books.filter(book=>{
        const date=getFinishedDate(book);
        return date&&date.getFullYear()===year&&date.getMonth()===month;
       }).length;
       return <b key={`${year}-${month}`} style={{"--heat":count/max}}>{count}</b>;
      })}
     </div>
    ))}
   </div>
  </Panel>
 );
}

function YearlyOverview({books}){
 const currentYear=new Date().getFullYear();
 const years=Array.from({length:6},(_,index)=>currentYear-5+index).reverse();

 return(
  <Panel kicker="Reading" title="Yearly Overview" className="dashboard-board-table">
   <table className="dashboard-year-table">
    <thead><tr><th>Year</th><th>Books</th><th>Pages</th><th>/Day</th></tr></thead>
    <tbody>
     {years.map(year=>{
      const finished=books.filter(book=>getFinishedDate(book)?.getFullYear()===year);
      const pages=finished.reduce((sum,book)=>sum+getBookPages(book),0);
      return <tr key={year}><td>{year}</td><td>{finished.length}</td><td>{pages.toLocaleString()}</td><td>{(pages/365).toFixed(1)}</td></tr>;
     })}
    </tbody>
   </table>
  </Panel>
 );
}

function LibraryStatusPane({books,authors,publishers,loans}){
 const rows=[
  {label:"Total books",value:books.length,to:"/books"},
  {label:"Author records",value:authors.length,to:"/authors"},
  {label:"Active loans",value:loans.filter(isActiveLoan).length,to:"/loans?status=active"},
  {label:"Publisher records",value:publishers.length,to:"/publishers"}
 ];

 return(
  <Panel kicker="Summary" title="Library Status" className="dashboard-board-list">
   <div className="dashboard-status-list">
    {rows.map(row=>(
     <Link key={row.label} to={row.to} className="dashboard-status-row">
      <span>{row.label}</span>
      <strong>{row.value.toLocaleString()}</strong>
     </Link>
    ))}
   </div>
  </Panel>
 );
}

const getMetadataReviewRows=(books,authorMap)=>{
 const counts=getDashboardMetadataCounts(books,authorMap);

 return [
  {label:"Missing authors",value:counts.missingAuthors,to:"/books?missing=authors"},
  {label:"Missing publishers",value:counts.missingPublishers,to:"/books?missing=publishers"},
  {label:"Missing formats",value:counts.missingFormats,to:"/books?missing=formats"},
  {label:"No cover",value:counts.missingCovers,to:"/books?missing=covers"},
  {label:"No print ISBN",value:counts.missingIsbn13,to:"/books?missing=isbn"},
  {label:"No eISBN for digital",value:counts.missingEisbn,to:"/books?missing=eisbn"},
  {label:"No ASIN where required",value:counts.missingAsin,to:"/books?missing=asin&required=true"},
  {label:"Has identifier",value:counts.hasIdentifier,to:"/books?has=identifier"},
  {label:"ASIN Only",value:counts.asinOnly,to:"/books?catalogStatus=ASIN%20Only"},
  {label:"No ISBN",value:counts.noIsbn,to:"/books?missing=isbn"},
  {label:"Digital No ISBN",value:counts.digitalNoIsbn,to:"/books?catalogStatus=Digital%20No%20ISBN"},
  {label:"Manual Entry",value:counts.manualEntry,to:"/books?catalogStatus=Manual%20Entry"},
  {label:"No subjects",value:counts.missingSubjects,to:"/books?missing=subjects"},
  {label:"Duplicate ISBN",value:counts.duplicateIsbns,to:"/books?duplicate=isbn"},
  {label:"Duplicate ASIN",value:counts.duplicateAsins,to:"/books?duplicate=asin"},
  {label:"Duplicate titles",value:counts.duplicateTitles,to:"/books?duplicate=title"}
 ];
};

function MissingMetadataModal({rows,onClose}){
 return(
  <div className="dashboard-chart-modal-backdrop" role="presentation" onMouseDown={onClose}>
   <section className="dashboard-chart-modal dashboard-metadata-modal" role="dialog" aria-modal="true" aria-labelledby="dashboard-metadata-modal-title" onMouseDown={event=>event.stopPropagation()}>
    <header className="dashboard-chart-modal-head">
     <div>
      <p>Cleanup</p>
      <h2 id="dashboard-metadata-modal-title">Missing Metadata Review</h2>
     </div>
     <button type="button" className="dashboard-chart-modal-close" onClick={onClose} aria-label="Close missing metadata modal">x</button>
    </header>
    <div className="dashboard-metadata-review-list">
     {rows.map(row=>(
      <Link key={row.label} to={row.to} className="dashboard-metadata-review-row" onClick={onClose}>
       <span>{row.label}</span>
       <strong>{row.value.toLocaleString()}</strong>
      </Link>
     ))}
    </div>
   </section>
  </div>
 );
}

function MetadataPane({books,authorMap,onReviewAll}){
 const rows=getMetadataReviewRows(books,authorMap);

 return(
  <Panel kicker="Cleanup" title="Missing Metadata" className="dashboard-board-gridpanel" actionLabel="Review all" onAction={onReviewAll}>
   <div className="dashboard-mini-grid">
    {rows.map(row=>(
     <Link key={row.label} to={row.to} className="dashboard-mini-cell">
      <strong>{row.value}</strong>
      <span>{row.label}</span>
     </Link>
    ))}
   </div>
  </Panel>
 );
}

function LoanPane({loans}){
 const active=loans.filter(isActiveLoan);
 const returned=loans.filter(loan=>loan?.returnedAt||String(loan?.status||"").toLowerCase()==="returned");
 const rows=[
  {label:"Active",value:active.length,to:"/loans?status=active"},
  {label:"Returned",value:returned.length,to:"/loans?status=returned"},
  {label:"All loans",value:loans.length,to:"/loans"}
 ];

 return(
  <Panel kicker="Circulation" title="Loan Health" className="dashboard-board-list" actionLabel="View loans" actionTo="/loans">
   <div className="dashboard-status-list">
    {rows.map(row=>(
     <Link key={row.label} to={row.to} className="dashboard-status-row">
      <span>{row.label}</span>
      <strong>{row.value.toLocaleString()}</strong>
     </Link>
    ))}
   </div>
  </Panel>
 );
}

const getCalendarRange=(view,date)=>{
 const safeDate=date instanceof Date&&!Number.isNaN(date.getTime())?date:new Date();
 const start=new Date(safeDate);
 const end=new Date(safeDate);

 if(view==="year"){
  start.setMonth(0,1);
  start.setHours(0,0,0,0);
  end.setFullYear(start.getFullYear(),11,31);
  end.setHours(23,59,59,999);
  return {start,end,label:"Selected year",unit:"month"};
 }

 if(view==="day"){
  start.setHours(0,0,0,0);
  end.setHours(23,59,59,999);
  return {start,end,label:"Selected day",unit:"hour"};
 }

 if(view==="week"){
  const day=start.getDay();
  start.setDate(start.getDate()-day);
  start.setHours(0,0,0,0);
  end.setTime(start.getTime());
  end.setDate(start.getDate()+6);
  end.setHours(23,59,59,999);
  return {start,end,label:"Selected week",unit:"day"};
 }

 if(view==="agenda"){
  start.setHours(0,0,0,0);
  end.setTime(start.getTime());
  end.setDate(start.getDate()+30);
  end.setHours(23,59,59,999);
  return {start,end,label:"Next 30 days",unit:"day"};
 }

 start.setDate(1);
 start.setHours(0,0,0,0);
 end.setFullYear(start.getFullYear(),start.getMonth()+1,0);
 end.setHours(23,59,59,999);
 return {start,end,label:"Selected month",unit:"day"};
};

const buildValueTrend=(books,view,date)=>{
 const {start,end,label,unit}=getCalendarRange(view,date);
 const bucketCount=unit==="hour"?24:unit==="month"?12:Math.max(1,Math.round((end-start)/(24*60*60*1000))+1);
 const buckets=Array.from({length:bucketCount},(_,index)=>{
  const bucketDate=new Date(start);
  if(unit==="hour")bucketDate.setHours(index,0,0,0);
  else if(unit==="month")bucketDate.setMonth(index,1);
  else bucketDate.setDate(start.getDate()+index);
  return {
   key:unit==="hour"?String(index):unit==="month"?monthNames[index]:`${bucketDate.getMonth()+1}/${bucketDate.getDate()}`,
   value:0
  };
 });

 books.forEach(book=>{
  const valueDate=getPurchaseDate(book);
  if(!valueDate||valueDate<start||valueDate>end)return;
  const index=unit==="hour"?valueDate.getHours():unit==="month"?valueDate.getMonth():Math.floor((valueDate-start)/(24*60*60*1000));
  if(buckets[index])buckets[index].value+=getBookEffectiveCost(book);
 });

 return {data:buckets,label,total:buckets.reduce((sum,item)=>sum+item.value,0)};
};

const toDateInputValue=date=>{
 const safeDate=date instanceof Date&&!Number.isNaN(date.getTime())?date:new Date();
 const year=safeDate.getFullYear();
 const month=String(safeDate.getMonth()+1).padStart(2,"0");
 const day=String(safeDate.getDate()).padStart(2,"0");
 return `${year}-${month}-${day}`;
};

const toMonthInputValue=date=>{
 const safeDate=date instanceof Date&&!Number.isNaN(date.getTime())?date:new Date();
 return `${safeDate.getFullYear()}-${String(safeDate.getMonth()+1).padStart(2,"0")}`;
};

const parseRangeDate=(view,value,currentDate)=>{
 if(view==="year"){
  const year=Number(value)||new Date().getFullYear();
  return new Date(year,0,1);
 }

 if(view==="month"){
  const [year,month]=String(value||"").split("-").map(Number);
  return Number.isFinite(year)&&Number.isFinite(month)?new Date(year,month-1,1):currentDate;
 }

 const [year,month,day]=String(value||"").split("-").map(Number);
 if(Number.isFinite(year)&&Number.isFinite(month)&&Number.isFinite(day))return new Date(year,month-1,day);
 return currentDate;
};

function ValueChartsModal({books,trend,onClose}){
 const total=books.reduce((sum,book)=>sum+getBookEffectiveCost(book),0);
 const formatRows=getValueByFormat(books).filter(row=>row.value>0);

 return(
  <div className="dashboard-chart-modal-backdrop" role="presentation" onMouseDown={onClose}>
   <section className="dashboard-chart-modal" role="dialog" aria-modal="true" aria-labelledby="dashboard-value-chart-title" onMouseDown={event=>event.stopPropagation()}>
    <header className="dashboard-chart-modal-head">
     <div>
      <p>Money</p>
      <h2 id="dashboard-value-chart-title">Library Value Charts</h2>
     </div>
     <button type="button" className="dashboard-chart-modal-close" onClick={onClose} aria-label="Close chart modal">x</button>
    </header>
    <div className="dashboard-chart-modal-summary">
     <div><span>Total library value</span><strong>${total.toFixed(2)}</strong></div>
     <div><span>{trend.label}</span><strong>${trend.total.toFixed(2)}</strong></div>
    </div>
    <div className="dashboard-chart-modal-grid">
     <div className="dashboard-chart-modal-panel">
      <h3>Value Trend</h3>
      <ResponsiveContainer width="100%" height={260}>
       <LineChart data={trend.data}>
        <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false}/>
        <XAxis dataKey="key" tickLine={false} axisLine={false} fontSize={11} interval="preserveStartEnd"/>
        <YAxis tickLine={false} axisLine={false} fontSize={11}/>
        <Tooltip formatter={value=>`$${Number(value).toFixed(2)}`}/>
        <Line type="monotone" dataKey="value" stroke="var(--primary)" strokeWidth={2.5} dot={{r:3}} activeDot={{r:5}}/>
       </LineChart>
      </ResponsiveContainer>
     </div>
     <div className="dashboard-chart-modal-panel">
      <h3>Value by Format</h3>
      <ResponsiveContainer width="100%" height={260}>
       <BarChart data={formatRows} layout="vertical" margin={{left:18,right:16}}>
        <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" horizontal={false}/>
        <XAxis type="number" tickLine={false} axisLine={false} fontSize={11} tickFormatter={value=>`$${value}`}/>
        <YAxis type="category" dataKey="label" tickLine={false} axisLine={false} fontSize={11} width={78}/>
        <Tooltip formatter={value=>`$${Number(value).toFixed(2)}`}/>
        <Bar dataKey="value" fill="var(--accent-2)" radius={[0,4,4,0]} barSize={16} maxBarSize={16}/>
       </BarChart>
      </ResponsiveContainer>
     </div>
    </div>
   </section>
  </div>
 );
}

function ValuePane({books,calendarView,calendarDate,onCalendarViewChange,onCalendarDateChange,onOpenChart}){
 const total=books.reduce((sum,book)=>sum+getBookEffectiveCost(book),0);
 const trend=buildValueTrend(books,calendarView,calendarDate);
 const rangeInputType=calendarView==="year"?"number":calendarView==="month"?"month":"date";
 const rangeInputValue=calendarView==="year"?String(calendarDate.getFullYear()):calendarView==="month"?toMonthInputValue(calendarDate):toDateInputValue(calendarDate);

 return(
  <Panel id="library-value" kicker="Money" title="Library Value" className="dashboard-board-list dashboard-value-panel" actionLabel="View chart" onAction={()=>onOpenChart(trend)}>
   <div className="dashboard-range-controls">
    <select value={calendarView} onChange={event=>onCalendarViewChange(event.target.value)}>
     <option value="year">Year</option>
     <option value="month">Month</option>
     <option value="week">Week</option>
     <option value="day">Day</option>
     <option value="agenda">Next 30 days</option>
    </select>
    <input
     type={rangeInputType}
     value={rangeInputValue}
     onChange={event=>onCalendarDateChange(parseRangeDate(calendarView,event.target.value,calendarDate))}
    />
   </div>
   <div className="dashboard-value-metrics">
    <div className="dashboard-status-row"><span>Total library value</span><strong>${total.toFixed(2)}</strong></div>
    <div className="dashboard-status-row"><span>{trend.label}</span><strong>${trend.total.toFixed(2)}</strong></div>
   </div>
   <ResponsiveContainer width="100%" height={120}>
    <LineChart data={trend.data}>
     <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false}/>
     <XAxis dataKey="key" tickLine={false} axisLine={false} fontSize={10} interval="preserveStartEnd"/>
     <YAxis tickLine={false} axisLine={false} fontSize={10}/>
     <Tooltip formatter={value=>`$${Number(value).toFixed(2)}`}/>
     <Line type="monotone" dataKey="value" stroke="var(--primary)" strokeWidth={2} dot={false}/>
    </LineChart>
   </ResponsiveContainer>
  </Panel>
 );
}

function CalendarPane({readingCalendarEvents,calendarView,calendarDate,onCalendarViewChange,onCalendarDateChange}){
 const calendarSafeView=calendarView==="year"?"month":calendarView;

 return(
  <Panel kicker="Calendar" title="Reading Calendar" className="dashboard-board-calendar">
   <ReadingCalendarCard
    events={readingCalendarEvents}
    view={calendarSafeView}
    date={calendarDate}
    onViewChange={onCalendarViewChange}
    onDateChange={onCalendarDateChange}
   />
  </Panel>
 );
}

function PlannerPane({readingPlans,readingGoal}){
 return(
  <Panel kicker="Workflow" title="Reading Plan" className="dashboard-board-planner" actionLabel="View plans" actionTo="/reading-planner">
   <div className="dashboard-planner-actions">
    <Link to="/reading-planner">Add plan</Link>
    <Link to="/reading-planner">View plans</Link>
    <Link to="/reading-planner">Set goal</Link>
   </div>
   <div className="dashboard-planner-summary">
    <div><span>Active plans</span><strong>{readingPlans.length}</strong></div>
    <div><span>Goal</span><strong>{readingGoal?.name||"Not set"}</strong></div>
   </div>
  </Panel>
 );
}

export default function DashboardVisualBoard({books,authors,publishers,loans,authorMap,readingGoal,readingPlans,readingCalendarEvents}){
 const [calendarView,setCalendarView]=useState("month");
 const [calendarDate,setCalendarDate]=useState(new Date());
 const [valueChartTrend,setValueChartTrend]=useState(null);
 const [showMetadataReview,setShowMetadataReview]=useState(false);
 const metadataReviewRows=getMetadataReviewRows(books,authorMap);

 return(
  <div className="dashboard-board">
   <CalendarPane
    readingCalendarEvents={readingCalendarEvents}
    calendarView={calendarView}
    calendarDate={calendarDate}
    onCalendarViewChange={setCalendarView}
    onCalendarDateChange={setCalendarDate}
   />
   <div className="dashboard-board-column">
    <NewLibraryChart books={books}/>
    <ValuePane
     books={books}
     calendarView={calendarView}
     calendarDate={calendarDate}
     onCalendarViewChange={setCalendarView}
     onCalendarDateChange={setCalendarDate}
     onOpenChart={setValueChartTrend}
    />
   </div>
   <div className="dashboard-board-column">
    <ReadingYearChart books={books}/>
    <YearlyOverview books={books}/>
    <MetadataPane books={books} authorMap={authorMap} onReviewAll={()=>setShowMetadataReview(true)}/>
   </div>
   <div className="dashboard-board-column">
    <FormatTypes books={books}/>
    <CategoryDonut books={books}/>
    <LibraryStatusPane books={books} authors={authors} publishers={publishers} loans={loans}/>
    <LoanPane loans={loans}/>
   </div>
   <div className="dashboard-board-column">
    <OutlookList books={books} authorMap={authorMap}/>
    <PlannerPane
     readingPlans={readingPlans}
     readingGoal={readingGoal}
    />
   </div>
   {valueChartTrend?<ValueChartsModal books={books} trend={valueChartTrend} onClose={()=>setValueChartTrend(null)}/>:null}
   {showMetadataReview?<MissingMetadataModal rows={metadataReviewRows} onClose={()=>setShowMetadataReview(false)}/>:null}
  </div>
 );
}
