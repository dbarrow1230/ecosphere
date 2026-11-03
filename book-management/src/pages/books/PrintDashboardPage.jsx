import {useEffect,useMemo,useState} from "react";
import {createPortal} from "react-dom";
import {Button,Form,Table} from "react-bootstrap";
import {FaPrint,FaSearch} from "react-icons/fa";
import DOMPurify from "dompurify";
import {getBookAuthorDisplay,getBookFilingCode} from "../../utils/bookFilingCode.js";
import "../../styles/PrintDashboardPage.css";

const PRINT_SIZES=[
 {value:"3x5",label:"3 x 5",cardsPerPage:3},
 {value:"4x6",label:"4 x 6",cardsPerPage:2},
 {value:"5x7",label:"5 x 7",cardsPerPage:2},
 {value:"catalog-card",label:"Catalog card",cardsPerPage:2},
 {value:"half-letter",label:"5.5 x 8.5",cardsPerPage:1},
 {value:"full-sheet",label:"8.5 x 11",cardsPerPage:1}
];

let printDashboardBookCache=null;

const normalizeBooks=data=>{
 if(Array.isArray(data))return data;
 if(Array.isArray(data?.books))return data.books;
 if(Array.isArray(data?.data))return data.data;
 if(Array.isArray(data?.data?.books))return data.data.books;
 return [];
};

const chunkItems=(items,size)=>{
 const chunks=[];
 for(let index=0;index<items.length;index+=size)chunks.push(items.slice(index,index+size));
 return chunks;
};

const getName=item=>{
 if(!item)return "";
 if(typeof item==="string")return item;
 const first=item?.firstName?.trim?.()||"";
 const middle=item?.middleName?.trim?.()||"";
 const last=item?.lastName?.trim?.()||"";
 const full=[first,middle,last].filter(Boolean).join(" ");
 return item?.displayName||item?.name||item?.title||item?.label||item?.value||full||"";
};

const joinNames=(items,key="name")=>{
 if(!Array.isArray(items)||!items.length)return "";
 return items.map(item=>typeof item==="string"?item:item?.[key]||getName(item)).filter(Boolean).join(", ");
};

const fullDate=value=>{
 if(!value)return "";
 const date=new Date(value);
 if(Number.isNaN(date.getTime()))return "";
 return date.toLocaleDateString("en-US",{month:"2-digit",day:"2-digit",year:"numeric"});
};

const toAmount=value=>{
 const amount=Number(value);
 return Number.isFinite(amount)?amount:0;
};

const getBookTotal=book=>{
 const base=toAmount(book?.cost);
 const formatTotal=Array.isArray(book?.formatPrices)?book.formatPrices.reduce((sum,item)=>sum+toAmount(item?.price),0):0;
 return base+formatTotal;
};

const getBookCurrency=book=>(book?.currency||book?.formatPrices?.[0]?.currency||"USD").toUpperCase();

const formatMoney=(amount,currency="USD")=>{
 try{
  return new Intl.NumberFormat("en-US",{style:"currency",currency}).format(Number.isFinite(amount)?amount:0);
 }catch{
  return `${currency} ${(Number.isFinite(amount)?amount:0).toFixed(2)}`;
 }
};

const formatIsbn=value=>String(value||"").trim()||"—";

const parseRangeSelection=(input,max)=>{
 const normalized=String(input||"").trim();
 if(!normalized)return [];
 const selected=new Set();
 normalized.split(",").map(part=>part.trim()).filter(Boolean).forEach(part=>{
  const rangeMatch=part.match(/^(\d+)\s*-\s*(\d+)$/);
  if(rangeMatch){
   const start=Math.max(1,Number(rangeMatch[1]));
   const end=Math.min(max,Number(rangeMatch[2]));
   const low=Math.min(start,end);
   const high=Math.max(start,end);
   for(let index=low;index<=high;index+=1)selected.add(index);
   return;
  }
  const value=Number(part);
  if(Number.isInteger(value)&&value>=1&&value<=max)selected.add(value);
 });
 return [...selected].sort((a,b)=>a-b);
};

function FormattedText({value}){
 const text=Array.isArray(value)?value.filter(Boolean).join("<br/>"):String(value||"");
 if(!text)return "—";
 return <div className="print-dashboard-formatted" dangerouslySetInnerHTML={{__html:DOMPurify.sanitize(text)}} />;
}

function PrintFront({book}){
 return(
  <article className="print-dashboard-card">
   <div className="print-dashboard-card-head">
    <h2>{book.title}{book.subtitle?`: ${book.subtitle}`:""}</h2>
    <div>{getBookFilingCode(book)}</div>
   </div>
   <div className="print-dashboard-card-grid">
    <div><strong>Author</strong><span>{getBookAuthorDisplay(book)||"—"}</span></div>
    <div><strong>Publisher</strong><span>{joinNames(book.publishers,"name")||"—"}</span></div>
    <div><strong>Series</strong><span>{book.series?.name||"—"}{book.seriesNumber?` #${book.seriesNumber}`:""}</span></div>
    <div><strong>Publication</strong><span>{[fullDate(book.publication?.publishedDate),getName(book.publication?.language)].filter(Boolean).join(" • ")||"—"}</span></div>
    <div><strong>ISBN-13</strong><span>{formatIsbn(book.isbn13)}</span></div>
    <div><strong>ISBN-10</strong><span>{formatIsbn(book.isbn10)}</span></div>
    <div><strong>Genre</strong><span>{joinNames(book.genres,"name")||"—"}</span></div>
    <div><strong>Subjects</strong><span>{(book.subjects||[]).join("; ")||"—"}</span></div>
    <div><strong>Custom ID</strong><span>{book.customId||"—"}</span></div>
    <div><strong>ASIN</strong><span>{book.asin||"—"}</span></div>
   </div>
  </article>
 );
}

function PrintBack({book}){
 return(
  <article className="print-dashboard-card">
   <div className="print-dashboard-card-head">
    <h2>{book.title}{book.subtitle?`: ${book.subtitle}`:""}</h2>
    <div>{getBookFilingCode(book)}</div>
   </div>
   <div className="print-dashboard-card-back">
    <section className="print-dashboard-card-acquisition">
     <h3>Acquisition</h3>
     <p><strong>Source:</strong> {getName(book.acquisitionSource)||"—"}</p>
     <p><strong>Method:</strong> {getName(book.acquisitionMethod)||"—"}</p>
     <p><strong>Purchase Date:</strong> {fullDate(book.purchaseDate)||"—"}</p>
     <p><strong>Total Cost:</strong> {formatMoney(getBookTotal(book),getBookCurrency(book))}</p>
    </section>
    <section>
     <h3>Summary</h3>
     <FormattedText value={book.summary}/>
    </section>
    <section>
     <h3>Notes</h3>
     <FormattedText value={book.notes}/>
    </section>
   </div>
  </article>
 );
}

function FullSheetPage({book}){
 return(
  <article className="print-dashboard-full-page">
   <div className="print-dashboard-card-head">
    <h2>{book.title}{book.subtitle?`: ${book.subtitle}`:""}</h2>
    <div>{getBookFilingCode(book)}</div>
   </div>
   <div className="print-dashboard-card-grid">
    <div><strong>Author</strong><span>{getBookAuthorDisplay(book)||"—"}</span></div>
    <div><strong>Publisher</strong><span>{joinNames(book.publishers,"name")||"—"}</span></div>
    <div><strong>Publication</strong><span>{[fullDate(book.publication?.publishedDate),getName(book.publication?.language)].filter(Boolean).join(" • ")||"—"}</span></div>
    <div><strong>Total Cost</strong><span>{formatMoney(getBookTotal(book),getBookCurrency(book))}</span></div>
    <div><strong>ISBN-13</strong><span>{formatIsbn(book.isbn13)}</span></div>
    <div><strong>ISBN-10</strong><span>{formatIsbn(book.isbn10)}</span></div>
    <div><strong>Genre</strong><span>{joinNames(book.genres,"name")||"—"}</span></div>
    <div><strong>Subjects</strong><span>{(book.subjects||[]).join("; ")||"—"}</span></div>
   </div>
   <section>
    <h3>Acquisition</h3>
    <p><strong>Source:</strong> {getName(book.acquisitionSource)||"—"} &nbsp; <strong>Method:</strong> {getName(book.acquisitionMethod)||"—"} &nbsp; <strong>Purchase Date:</strong> {fullDate(book.purchaseDate)||"—"}</p>
    <p><strong>Notes:</strong> {book.acquisitionNotes||"—"}</p>
   </section>
   <section>
    <h3>Summary</h3>
    <FormattedText value={book.summary}/>
   </section>
   <section>
    <h3>Notes</h3>
    <FormattedText value={book.notes}/>
   </section>
  </article>
 );
}

function CatalogPrintFront({book}){
 return(
  <article className="print-dashboard-catalog-card">
   <div className="print-dashboard-catalog-edge"><span>{getBookFilingCode(book)}</span></div>
   <div className="print-dashboard-catalog-body">
    <div className="print-dashboard-catalog-title">
     <h2>{book.title}{book.subtitle?`: ${book.subtitle}`:""}</h2>
    </div>
    <div className="print-dashboard-catalog-grid">
     <div><strong>Author</strong><span>{getBookAuthorDisplay(book)||"—"}</span></div>
     <div><strong>Publisher</strong><span>{joinNames(book.publishers,"name")||"—"}</span></div>
     <div><strong>Publication</strong><span>{[fullDate(book.publication?.publishedDate),getName(book.publication?.language)].filter(Boolean).join(" • ")||"—"}</span></div>
     <div><strong>Subject</strong><span>{(book.subjects||[]).join("; ")||joinNames(book.genres,"name")||"—"}</span></div>
     <div><strong>Pages</strong><span>{book.reading?.totalPages||book.pages||book.pageCount||"—"}</span></div>
     <div><strong>Condition</strong><span>{book.condition||"—"}</span></div>
     {book.isbn13?<div><strong>ISBN-13</strong><span>{book.isbn13}</span></div>:null}
     {book.isbn10?<div><strong>ISBN-10</strong><span>{book.isbn10}</span></div>:null}
     {book.eisbn?<div><strong>eISBN</strong><span>{book.eisbn}</span></div>:null}
     {book.asin?<div><strong>ASIN</strong><span>{book.asin}</span></div>:null}
     {!book.isbn13&&!book.isbn10&&!book.eisbn&&!book.asin?<div><strong>Identifier</strong><span>No identifier</span></div>:null}
    </div>
   </div>
  </article>
 );
}

function CatalogPrintBack({book}){
 return(
  <article className="print-dashboard-catalog-card">
   <div className="print-dashboard-catalog-edge"><span>{getBookFilingCode(book)}</span></div>
   <div className="print-dashboard-catalog-body">
    <div className="print-dashboard-catalog-filing-row"><strong>Filing Code</strong><span>{getBookFilingCode(book)}</span></div>
    <div className="print-dashboard-catalog-grid">
     <div><strong>Acquisition Source</strong><span>{getName(book.acquisitionSource)||"—"}</span></div>
     <div><strong>Acquisition Method</strong><span>{getName(book.acquisitionMethod)||"—"}</span></div>
     <div><strong>Purchase Date</strong><span>{fullDate(book.purchaseDate)||"—"}</span></div>
     <div><strong>ASIN</strong><span>{book.asin||"—"}</span></div>
     <div><strong>Custom ID</strong><span>{book.customId||"—"}</span></div>
    </div>
    <div className="print-dashboard-catalog-copy">
     <strong>Summary / Notes</strong>
     <FormattedText value={book.summary||book.notes}/>
    </div>
   </div>
  </article>
 );
}

export default function PrintDashboardPage(){
 const [books,setBooks]=useState([]);
 const [loading,setLoading]=useState(true);
 const [search,setSearch]=useState("");
 const [printSize,setPrintSize]=useState("4x6");
 const [selectionMode,setSelectionMode]=useState("all");
 const [rangeInput,setRangeInput]=useState("");
 const [preparedPrintBooks,setPreparedPrintBooks]=useState([]);

 const handleSelectionModeChange=value=>{
  setSelectionMode(value);
  if(value==="all")setRangeInput("");
 };

 useEffect(()=>{
  let active=true;
  if(printDashboardBookCache){
   setBooks(printDashboardBookCache);
   setLoading(false);
   return()=>{active=false;};
  }
  (async()=>{
   try{
    const response=await fetch("/api/books?sort=title&order=asc&limit=10000",{cache:"no-store"});
    const data=await response.json();
    const normalized=normalizeBooks(data);
    printDashboardBookCache=normalized;
    if(active)setBooks(normalized);
   }catch{
    if(active)setBooks([]);
   }finally{
    if(active)setLoading(false);
   }
  })();
  return()=>{active=false;};
 },[]);

 const filteredBooks=useMemo(()=>{
  const q=search.trim().toLowerCase();
  if(!q)return books;
  return books.filter(book=>[
   book.title,
   book.subtitle,
   getBookAuthorDisplay(book),
   joinNames(book.publishers,"name"),
   book.isbn10,
   book.isbn13,
   book.asin,
   book.customId
  ].filter(Boolean).join(" ").toLowerCase().includes(q));
 },[books,search]);

 const selectedIndexes=useMemo(()=>parseRangeSelection(rangeInput,filteredBooks.length),[rangeInput,filteredBooks.length]);
 const printBooks=selectionMode==="range"?selectedIndexes.map(index=>filteredBooks[index-1]).filter(Boolean):filteredBooks;
 const currentSize=PRINT_SIZES.find(size=>size.value===printSize)||PRINT_SIZES[1];
 const isFullSheet=printSize==="full-sheet";
 const isCatalogCard=printSize==="catalog-card";
 const printChunks=chunkItems(preparedPrintBooks,currentSize.cardsPerPage);
 const visibleBooks=selectionMode==="range"&&selectedIndexes.length?printBooks:filteredBooks.slice(0,100);

 const printRangeLabel=selectionMode==="range"&&selectedIndexes.length
  ?selectedIndexes.join(", ")
  :"All";

 const resetPrintOptions=()=>{
  setPrintSize("4x6");
  setSelectionMode("all");
  setRangeInput("");
 };

 const handlePrint=()=>{
  setPreparedPrintBooks(printBooks);
  document.body.classList.add("print-dashboard-printing");
  setTimeout(()=>{
   window.print();
   setTimeout(()=>{
    document.body.classList.remove("print-dashboard-printing");
    setPreparedPrintBooks([]);
   },250);
  },100);
 };

 useEffect(()=>{
  const clearPrinting=()=>{
   document.body.classList.remove("print-dashboard-printing");
   setPreparedPrintBooks([]);
  };
  window.addEventListener("afterprint",clearPrinting);
  return()=>{
   window.removeEventListener("afterprint",clearPrinting);
   document.body.classList.remove("print-dashboard-printing");
   setPreparedPrintBooks([]);
  };
 },[]);

 return(
  <div className="print-dashboard-page">
   <section className="print-dashboard-controls">
    <div>
     <h1>Print Dashboard</h1>
     <div className="print-dashboard-muted">{loading?"Loading library...":`${filteredBooks.length.toLocaleString()} books available`}</div>
    </div>
    <div className="print-dashboard-actions">
     <Button className="print-dashboard-print-btn" onClick={handlePrint} disabled={!printBooks.length}><FaPrint/> Print</Button>
     <Button variant="outline-secondary" onClick={resetPrintOptions}>Reset</Button>
    </div>
   </section>

   <section className="print-dashboard-panel">
    <div className="print-dashboard-field">
     <label>Search</label>
     <div className="print-dashboard-joined">
      <span><FaSearch/></span>
      <Form.Control value={search} onChange={event=>setSearch(event.target.value)} placeholder="Search title, author, publisher, ISBN, ASIN..." />
      <Button variant="outline-secondary" onClick={()=>setSearch("")} disabled={!search}>Clear</Button>
     </div>
    </div>

    <div className="print-dashboard-field">
     <label>Print Size</label>
     <Form.Select value={printSize} onChange={event=>setPrintSize(event.target.value)}>
      {PRINT_SIZES.map(size=><option key={size.value} value={size.value}>{size.label}</option>)}
     </Form.Select>
    </div>

    <div className="print-dashboard-field">
     <label>Selection</label>
     <Form.Select value={selectionMode} onChange={event=>handleSelectionModeChange(event.target.value)}>
      <option value="all">Full current list</option>
      <option value="range">Range / item numbers</option>
     </Form.Select>
    </div>

    <div className="print-dashboard-field">
     <label>Range</label>
     <div className="print-dashboard-joined">
      <Form.Control value={rangeInput} onChange={event=>setRangeInput(event.target.value)} disabled={selectionMode!=="range"} placeholder="3-50 or 3, 6, 32" />
      <Button variant="outline-secondary" onClick={()=>setRangeInput("")} disabled={!rangeInput}>Clear</Button>
     </div>
    </div>
   </section>

   <section className="print-dashboard-summary">
   <span>Printing: <strong>{printBooks.length.toLocaleString()}</strong></span>
   <span>Range: <strong>{printRangeLabel}</strong></span>
   <span>Size: <strong>{currentSize.label}</strong></span>
   {selectionMode!=="range"&&filteredBooks.length>visibleBooks.length?<span>Table: <strong>showing first {visibleBooks.length}</strong></span>:null}
  </section>

   <div className="print-dashboard-table-wrap">
    <Table hover className="print-dashboard-table">
     <thead>
      <tr>
       <th>#</th>
       <th>Identifier</th>
       <th>Title</th>
       <th>Author</th>
       <th>Publisher</th>
       <th>ISBN</th>
      </tr>
     </thead>
     <tbody>
      {visibleBooks.map((book,index)=>{
       const rowNumber=selectionMode==="range"&&selectedIndexes.length?selectedIndexes[index]:index+1;
       return(
       <tr key={book._id||index} className={selectionMode==="range"&&selectedIndexes.includes(rowNumber)?"is-in-print-range":""}>
        <td>{rowNumber}</td>
        <td>{book.customId||book.isbn13||book.isbn10||book.asin||"—"}</td>
        <td>{book.title}{book.subtitle?`: ${book.subtitle}`:""}</td>
        <td>{getBookAuthorDisplay(book)||"—"}</td>
        <td>{joinNames(book.publishers,"name")||"—"}</td>
        <td>{book.isbn13||book.isbn10||"—"}</td>
       </tr>
       );
      })}
     </tbody>
    </Table>
   </div>

   {preparedPrintBooks.length?createPortal(
   <div className={`print-dashboard-print-area print-dashboard-size-${printSize} ${isFullSheet?"is-full-sheet":"is-duplex"}`} aria-hidden="true">
    {isFullSheet?(
     preparedPrintBooks.map(book=>(
      <div className="print-dashboard-sheet" key={book._id||book.title}>
       <FullSheetPage book={book}/>
      </div>
     ))
    ):(
     printChunks.map((chunk,index)=>(
      <div className="print-dashboard-sheet-pair" key={`chunk-${index}`}>
       <div className="print-dashboard-sheet">
        {chunk.map(book=>isCatalogCard?<CatalogPrintFront key={`${book._id}-front`} book={book}/>:<PrintFront key={`${book._id}-front`} book={book}/>)}
       </div>
       <div className="print-dashboard-sheet">
        {chunk.map(book=>isCatalogCard?<CatalogPrintBack key={`${book._id}-back`} book={book}/>:<PrintBack key={`${book._id}-back`} book={book}/>)}
       </div>
      </div>
     ))
    )}
   </div>,
   document.body
   ):null}
  </div>
 );
}
