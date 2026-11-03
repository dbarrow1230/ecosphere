import {useEffect,useMemo,useState} from "react";
import {Button,Form,InputGroup,Modal,Spinner} from "react-bootstrap";
import {FaBookOpen,FaPrint,FaSearch,FaTimes} from "react-icons/fa";
import {Link} from "react-router-dom";
import {getBookFilingCode} from "../../utils/bookFilingCode.js";
import "../../styles/CardCatalogPage.css";

const letters=["ALL","#","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"];
const pageSizes=[24,48,96];

const normalizeBooks=data=>{
 if(Array.isArray(data))return data;
 if(Array.isArray(data?.books))return data.books;
 if(Array.isArray(data?.data))return data.data;
 if(Array.isArray(data?.data?.books))return data.data.books;
 return [];
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

const joinNames=items=>Array.isArray(items)?items.map(getName).filter(Boolean).join(", "):"";
const getAuthorNames=book=>joinNames(book?.authors)||getName(book?.author)||getName(book?.authorRef)||getName(book?.authorId);
const getPublisherNames=book=>joinNames(book?.publishers)||getName(book?.publisher)||getName(book?.publisherRef)||getName(book?.publisherId);
const getGenreNames=book=>joinNames(book?.genres)||joinNames(book?.subjects)||getName(book?.genre)||getName(book?.subject);

const getYear=value=>{
 if(!value)return "";
 const date=new Date(value);
 if(Number.isNaN(date.getTime()))return "";
 return date.getFullYear();
};

const getPublicationYear=book=>book?.publicationYear||book?.publishedYear||getYear(book?.publicationDate)||getYear(book?.publishedDate)||"";

const getIdentifierFields=book=>[
 ["ISBN-13",book?.isbn13],
 ["ISBN-10",book?.isbn10],
 ["eISBN",book?.eisbn],
 ["ASIN",book?.asin],
 ["Custom ID",book?.customId]
].filter(([,value])=>value);

const compactTitle=title=>String(title||"Untitled Book").replace(/\s+/g," ").trim();
const getFormatNames=book=>joinNames(book?.formats)||joinNames(book?.fileTypes)||getName(book?.format);
const getLanguage=book=>getName(book?.publication?.language)||getName(book?.language);
const getPages=book=>book?.reading?.totalPages||book?.pages||book?.pageCount||"";
const getCondition=book=>book?.condition||book?.bookCondition||"";
const getAcquisitionSource=book=>getName(book?.acquisitionSource)||getName(book?.source);
const getAcquisitionMethod=book=>getName(book?.acquisitionMethod)||getName(book?.method);
const getPurchaseDate=book=>book?.purchaseDate?new Date(book.purchaseDate).toLocaleDateString("en-US",{month:"2-digit",day:"2-digit",year:"numeric"}):"";
const getSummary=book=>String(book?.summary||book?.description||book?.notes||"").trim();
const getFilingCodeStyle=code=>{
 const length=String(code||"").length;
 if(length>70)return {"--catalog-print-filing-code-font-size":"5pt","--catalog-print-edge-code-font-size":"5pt"};
 if(length>60)return {"--catalog-print-filing-code-font-size":"5.5pt","--catalog-print-edge-code-font-size":"5.5pt"};
 if(length>50)return {"--catalog-print-filing-code-font-size":"6pt","--catalog-print-edge-code-font-size":"6pt"};
 if(length>42)return {"--catalog-print-filing-code-font-size":"6.5pt","--catalog-print-edge-code-font-size":"6.5pt"};
 return {"--catalog-print-filing-code-font-size":"7pt","--catalog-print-edge-code-font-size":"7pt"};
};

const getPrintTitleStyle=title=>{
 const length=String(title||"").length;
 if(length>95)return {"--catalog-print-title-font-size":"7.5pt"};
 if(length>80)return {"--catalog-print-title-font-size":"8.5pt"};
 if(length>65)return {"--catalog-print-title-font-size":"9.5pt"};
 if(length>50)return {"--catalog-print-title-font-size":"11pt"};
 return {"--catalog-print-title-font-size":"13pt"};
};

const pageWindow=(page,pages)=>{
 const safePages=Math.max(pages,1);
 const start=Math.max(1,Math.min(page-2,safePages-4));
 const end=Math.min(safePages,start+4);
 return Array.from({length:end-start+1},(_,index)=>start+index);
};

export default function CardCatalogPage(){
 const [books,setBooks]=useState([]);
 const [search,setSearch]=useState("");
 const [letter,setLetter]=useState("ALL");
 const [page,setPage]=useState(1);
 const [limit,setLimit]=useState(48);
 const [total,setTotal]=useState(0);
 const [pages,setPages]=useState(1);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");
 const [selectedCard,setSelectedCard]=useState(null);

 const clearModalPrinting=()=>{
  document.body.classList.remove("catalog-modal-card-printing");
 };

 const handlePrintSelectedCard=()=>{
  if(!selectedCard)return;
  document.body.classList.add("catalog-modal-card-printing");
  setTimeout(()=>{
   window.print();
   setTimeout(clearModalPrinting,250);
  },100);
 };

 useEffect(()=>{
  setPage(1);
 },[search,letter,limit]);

 useEffect(()=>{
  let active=true;
  const controller=new AbortController();

  const loadBooks=async()=>{
   setLoading(true);
   setError("");

   try{
    const params=new URLSearchParams({
     page:String(page),
     limit:String(limit),
     sort:"title",
     order:"asc"
    });

    if(search.trim())params.set("search",search.trim());
    if(letter!=="ALL")params.set("letter",letter);

    const res=await fetch(`/api/books?${params.toString()}`,{cache:"no-store",signal:controller.signal});
    const data=await res.json();

    if(!res.ok)throw new Error(data?.message||"Failed to load books");
    if(!active)return;

    setBooks(normalizeBooks(data));
    setTotal(Number(data?.total)||0);
    setPages(Math.max(Number(data?.pages)||1,1));
   }catch(err){
    if(err.name==="AbortError")return;
    if(active)setError(err.message||"Failed to load books");
   }finally{
    if(active)setLoading(false);
   }
  };

  loadBooks();

  return()=>{
   active=false;
   controller.abort();
  };
 },[page,limit,search,letter]);

 useEffect(()=>{
  window.addEventListener("afterprint",clearModalPrinting);
  return()=>{
   window.removeEventListener("afterprint",clearModalPrinting);
   clearModalPrinting();
  };
 },[]);

 const pageNumbers=useMemo(()=>pageWindow(page,pages),[page,pages]);
 const startCount=total?((page-1)*limit)+1:0;
 const endCount=Math.min(page*limit,total);
 const renderCatalogCard=(book,{isModal=false}={})=>{
  const id=book?._id||book?.id;
  const author=getAuthorNames(book);
  const publisher=getPublisherNames(book);
  const year=getPublicationYear(book);
  const category=getGenreNames(book);
  const identifierFields=getIdentifierFields(book);

  return(
   <article
    className={isModal?"catalog-index-card catalog-index-card-modal":"catalog-index-card"}
    key={id||`${book?.title}-${author}`}
    role={isModal?undefined:"button"}
    tabIndex={isModal?undefined:0}
    onClick={isModal?undefined:()=>setSelectedCard(book)}
    onKeyDown={isModal?undefined:event=>{
     if(event.key==="Enter"||event.key===" "){
      event.preventDefault();
      setSelectedCard(book);
     }
    }}
   >
    <div className="catalog-index-edge"><span>{getBookFilingCode(book)}</span></div>
    <div className="catalog-index-body">
     <div className="catalog-index-main">
      <h2>{compactTitle(book?.title)}</h2>
      {book?.subtitle?<div className="catalog-subtitle">{book.subtitle}</div>:null}
     </div>

     <dl className="catalog-fields">
      <div><dt>Author</dt><dd>{author||"-"}</dd></div>
     <div><dt>Publisher</dt><dd>{publisher||"-"}</dd></div>
     <div><dt>Year</dt><dd>{year||"-"}</dd></div>
     <div><dt>Subject</dt><dd>{category||"-"}</dd></div>
      {identifierFields.length?identifierFields.map(([label,value])=>(
       <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
      )):<div><dt>Identifier</dt><dd>No identifier</dd></div>}
     </dl>

     <div className="catalog-bottom-row">
      {id&&!isModal?<Link to={`/books/${id}/edit`} className="catalog-edit-link" onClick={event=>event.stopPropagation()}>Edit</Link>:null}
     </div>
    </div>
   </article>
  );
 };

 const renderModalDetails=book=>{
  const summary=getSummary(book);
  const hasIdentifier=book?.isbn13||book?.isbn10||book?.eisbn||book?.asin;
  const filingCode=getBookFilingCode(book);
  const title=compactTitle(book?.title);

  return(
   <div className="catalog-modal-details" style={{...getFilingCodeStyle(filingCode),...getPrintTitleStyle(title)}}>
    <div className="catalog-modal-print-sheet">
     <section className="catalog-modal-face">
      <div className="catalog-index-edge"><span>{filingCode}</span></div>
      <div className="catalog-modal-face-body">
       <div className="catalog-modal-card-title">
        <h2>{title}</h2>
        {book?.subtitle?<div>{book.subtitle}</div>:null}
       </div>
      <div className="catalog-modal-grid">
       <div><strong>Author</strong><span>{getAuthorNames(book)||"—"}</span></div>
       <div><strong>Publisher</strong><span>{getPublisherNames(book)||"—"}</span></div>
       <div><strong>Publication Year</strong><span>{getPublicationYear(book)||"—"}</span></div>
       <div><strong>Language</strong><span>{getLanguage(book)||"—"}</span></div>
       <div><strong>Subject</strong><span>{getGenreNames(book)||"—"}</span></div>
       <div><strong>Format</strong><span>{getFormatNames(book)||"—"}</span></div>
       <div><strong>Pages</strong><span>{getPages(book)||"—"}</span></div>
       <div><strong>Condition</strong><span>{getCondition(book)||"—"}</span></div>
       {book?.isbn13?<div><strong>ISBN-13</strong><span>{book.isbn13}</span></div>:null}
       {book?.isbn10?<div><strong>ISBN-10</strong><span>{book.isbn10}</span></div>:null}
       {book?.eisbn?<div><strong>eISBN</strong><span>{book.eisbn}</span></div>:null}
       {book?.asin?<div><strong>ASIN</strong><span>{book.asin}</span></div>:null}
       {!hasIdentifier?<div><strong>Identifier</strong><span>No identifier</span></div>:null}
      </div>
      </div>
     </section>
     </div>

    <div className="catalog-modal-print-sheet">
     <section className="catalog-modal-face">
      <div className="catalog-index-edge"><span>{filingCode}</span></div>
      <div className="catalog-modal-face-body">
      <div className="catalog-modal-filing-row"><strong>Filing Code</strong><span>{filingCode}</span></div>
      <div className="catalog-modal-grid">
       <div><strong>Acquisition Source</strong><span>{getAcquisitionSource(book)||"—"}</span></div>
       <div><strong>Acquisition Method</strong><span>{getAcquisitionMethod(book)||"—"}</span></div>
       <div><strong>Purchase Date</strong><span>{getPurchaseDate(book)||"—"}</span></div>
       <div><strong>ASIN</strong><span>{book?.asin||"—"}</span></div>
       <div><strong>Custom ID</strong><span>{book?.customId||"—"}</span></div>
      </div>
      <div className="catalog-modal-copy">
       <strong>Summary / Notes</strong>
       <p>{summary||"No summary or notes recorded."}</p>
      </div>
      </div>
     </section>
    </div>
   </div>
  );
 };

 return(
  <div className="card-catalog-page">
   <div className="catalog-shell">
    <aside className="catalog-tabs" aria-label="Alphabetical catalog tabs">
     {letters.map(item=>(
      <button
       type="button"
       key={item}
       className={letter===item?"catalog-tab is-active":"catalog-tab"}
       onClick={()=>setLetter(item)}
      >
       {item}
      </button>
     ))}
    </aside>

    <section className="catalog-drawer">
     <div className="catalog-sticky-bar">
      <div className="catalog-header">
       <div>
        <h1>Card Catalog</h1>
        <div className="catalog-count">
         {loading?"Loading":`${startCount.toLocaleString()}-${endCount.toLocaleString()} of ${total.toLocaleString()}`} {letter==="ALL"?"books":`under ${letter}`}
        </div>
       </div>

       <Button as={Link} to="/books" className="catalog-books-btn">
        <FaBookOpen/> Books
       </Button>
      </div>

      <div className="catalog-controls">
       <div className="catalog-search">
        <Form.Label htmlFor="cardCatalogSearch">Search</Form.Label>
        <InputGroup>
         <InputGroup.Text><FaSearch/></InputGroup.Text>
         <Form.Control
          id="cardCatalogSearch"
          value={search}
          onChange={event=>setSearch(event.target.value)}
          placeholder="Title, author, publisher, ISBN, ASIN, genre, notes"
         />
         {search?(
          <Button variant="outline-secondary" onClick={()=>setSearch("")} aria-label="Clear search">
           <FaTimes/>
          </Button>
         ):null}
        </InputGroup>
       </div>

       <div className="catalog-page-size">
        <Form.Label htmlFor="catalogPageSize">Cards per page</Form.Label>
        <Form.Select id="catalogPageSize" value={limit} onChange={event=>setLimit(Number(event.target.value))}>
         {pageSizes.map(size=><option key={size} value={size}>{size}</option>)}
        </Form.Select>
       </div>
      </div>
     </div>

     {loading?(
      <div className="catalog-state"><Spinner animation="border" size="sm"/> Loading catalog drawer...</div>
     ):null}

     {error?(
      <div className="alert alert-danger">{error}</div>
     ):null}

     {!loading&&!error&&!books.length?(
      <div className="catalog-state">No catalog cards match this drawer.</div>
     ):null}

     {!loading&&!error&&books.length?(
      <>
       <div className="catalog-card-stack">
        {books.map(book=>renderCatalogCard(book))}
       </div>

       <div className="catalog-pagination" aria-label="Catalog pagination">
        <button type="button" onClick={()=>setPage(1)} disabled={page<=1}>First</button>
        <button type="button" onClick={()=>setPage(prev=>Math.max(prev-1,1))} disabled={page<=1}>Prev</button>
        {pageNumbers.map(item=>(
         <button type="button" key={item} className={page===item?"is-active":""} onClick={()=>setPage(item)}>
          {item}
         </button>
        ))}
        <button type="button" onClick={()=>setPage(prev=>Math.min(prev+1,pages))} disabled={page>=pages}>Next</button>
        <button type="button" onClick={()=>setPage(pages)} disabled={page>=pages}>Last</button>
       </div>
      </>
     ):null}
    </section>
   </div>

   <Modal show={!!selectedCard} onHide={()=>setSelectedCard(null)} centered size="xl" className="catalog-card-modal">
   <Modal.Header closeButton>
     <Modal.Title>{selectedCard?compactTitle(selectedCard.title):"Catalog Card"}</Modal.Title>
     <Button className="catalog-modal-print-btn" onClick={handlePrintSelectedCard} disabled={!selectedCard}>
      <FaPrint/> Print 5 x 6
     </Button>
    </Modal.Header>
    <Modal.Body>
     {selectedCard?renderModalDetails(selectedCard):null}
    </Modal.Body>
   </Modal>
  </div>
 );
}
