import {useEffect,useMemo,useState} from "react";
import {createPortal,flushSync} from "react-dom";
import {Accordion,Button,Form,InputGroup,Modal,Pagination,Table} from "react-bootstrap";
import {FaEdit,FaPlus,FaPrint,FaSearch,FaTrash} from "react-icons/fa";
import {Link,useSearchParams} from "react-router-dom";
import DOMPurify from "dompurify";
import BookForm from "../forms/BookForm";
import BookBarcode from "../../components/books/BookBarcode.jsx";
import {getBookAuthorDisplay,getBookFilingCode} from "../../utils/bookFilingCode.js";
import "../../styles/BooksIndexPage.css";

const getName=item=>{
 if(!item)return "";
 if(typeof item==="string")return item;
 const first=item?.firstName?.trim?.()||"";
 const middle=item?.middleName?.trim?.()||"";
 const last=item?.lastName?.trim?.()||"";
 const full=[first,middle,last].filter(Boolean).join(" ");
 return item?.displayName||item?.name||item?.title||item?.label||item?.value||full||"";
};

const isObjectIdLike=value=>/^[a-f0-9]{24}$/i.test(String(value||"").trim());

const getReadableName=item=>{
 if(!item)return "";
 if(typeof item==="string"){
  const value=item.trim();
  return isObjectIdLike(value)?"":value;
 }
 const first=item?.firstName?.trim?.()||"";
 const middle=item?.middleName?.trim?.()||"";
 const last=item?.lastName?.trim?.()||"";
 const full=[first,middle,last].filter(Boolean).join(" ");
 return item?.displayName||item?.name||item?.title||item?.label||item?.value||full||"";
};

const joinNames=(items,key="name")=>{
 if(!Array.isArray(items)||!items.length)return "";
 return items.map(item=>{
  if(typeof item==="string")return item;
  return item?.[key]||getName(item);
 }).filter(Boolean).join(", ");
};

const year=v=>{
 if(!v)return "";
 const d=new Date(v);
 if(Number.isNaN(d.getTime()))return "";
 return d.getFullYear();
};

const fullDate=v=>{
 if(!v)return "";
 const d=new Date(v);
 if(Number.isNaN(d.getTime()))return "";
 return d.toLocaleDateString("en-US",{month:"2-digit",day:"2-digit",year:"numeric"});
};

const firstImage=images=>{
 if(!Array.isArray(images)||!images.length)return "";
 return images.find(Boolean)||"";
};

const firstPublisher=publishers=>{
 if(!Array.isArray(publishers)||!publishers.length)return "";
 return getName(publishers[0]);
};

const firstFormat=formats=>{
 if(!Array.isArray(formats)||!formats.length)return "";
 return getName(formats[0]);
};

const PRINT_CARD_SIZES=[
 {value:"3x5",label:"3 x 5",cardsPerPage:3},
 {value:"4x6",label:"4 x 6"},
 {value:"5x7",label:"5 x 7"},
 {value:"half-letter",label:"5.5 x 8.5",cardsPerPage:1},
 {value:"full-sheet",label:"8.5 x 11"}
];

const chunkItems=(items,size)=>{
 const chunks=[];
 for(let index=0;index<items.length;index+=size)chunks.push(items.slice(index,index+size));
 return chunks;
};

const getPrintCardsPerPage=size=>PRINT_CARD_SIZES.find(item=>item.value===size)?.cardsPerPage||2;

const hasText=value=>String(value??"").trim().length>0;

const normalizeKey=value=>String(value??"").trim().toLowerCase();

const isTruthyValue=value=>{
 if(value===true)return true;
 const normalized=normalizeKey(value);
 return normalized==="yes"||normalized==="y"||normalized==="true"||normalized==="1"||normalized==="required";
};

const getBookIdentifiers=book=>({
 isbn10:String(book?.isbn10||"").trim(),
 isbn13:String(book?.isbn13||"").trim(),
 eisbn:String(book?.eisbn||"").trim(),
 asin:String(book?.asin||"").trim(),
 customId:String(book?.customId||"").trim()
});

const getBookFormatNames=book=>{
 const names=[];
 if(Array.isArray(book?.formats))book.formats.forEach(format=>{const name=getName(format); if(name)names.push(name);});
 if(Array.isArray(book?.formatPrices))book.formatPrices.forEach(item=>{const name=getName(item?.format); if(name)names.push(name);});
 if(book?.format){const name=getName(book.format); if(name)names.push(name);}
 return [...new Set(names.map(name=>name.toLowerCase().trim()).filter(Boolean))];
};

const isDigitalBook=book=>getBookFormatNames(book).some(format=>
 format.includes("digital")||
 format.includes("ebook")||
 format.includes("e-book")||
 format.includes("kindle")||
 format.includes("pdf")||
 format.includes("epub")||
 format.includes("mobi")
);

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

const hasBookCover=book=>{
 if(Array.isArray(book?.images)&&book.images.some(hasText))return true;
 if(Array.isArray(book?.imageLinks)&&book.imageLinks.some(hasText))return true;
 return hasText(book?.coverUrl)||
  hasText(book?.coverURL)||
  hasText(book?.cover)||
  hasText(book?.imageUrl)||
  hasText(book?.imageURL)||
  hasText(book?.thumbnail)||
  hasText(book?.metadata?.coverUrl);
};

const hasBookSubjects=book=>
 (Array.isArray(book?.subjects)&&book.subjects.length>0)||
 (Array.isArray(book?.genres)&&book.genres.length>0)||
 (Array.isArray(book?.categories)&&book.categories.length>0)||
 (Array.isArray(book?.tags)&&book.tags.length>0)||
 hasText(book?.subject)||
 hasText(book?.genre)||
 hasText(book?.category);

const getBookReadingStatus=book=>String(book?.reading?.status||book?.readingStatus||"Unread").trim();

const matchStatus=(value,filter)=>String(value||"").toLowerCase().trim()===String(filter||"").toLowerCase().trim();

const hasDashboardFilterMatch=(book,{missingFilter,hasFilter,readingFilter,requiredFilter,catalogStatusFilter})=>{
 const missingAuthor=!getBookAuthorDisplay(book);
 const missingPublisher=!firstPublisher(book?.publishers)&&!getReadableName(book?.publisher)&&!getReadableName(book?.publisherRef);
 const missingFormat=!firstFormat(book?.formats)&&!(Array.isArray(book?.formatPrices)&&book.formatPrices.length);
 const identifiers=getBookIdentifiers(book);
 const hasPrintIsbn=!!(identifiers.isbn10||identifiers.isbn13);
 const hasAnyIsbn=!!(hasPrintIsbn||identifiers.eisbn);
 const hasAnyIdentifier=!!(hasAnyIsbn||identifiers.asin||identifiers.customId);
 const missingCover=!hasBookCover(book);
 const missingPrintIsbn=!hasPrintIsbn;
 const missingEisbn=isDigitalBook(book)&&!identifiers.eisbn;
 const missingAsin=requiredFilter==="true"?isAmazonRequired(book)&&!identifiers.asin:!identifiers.asin;
 const missingSubject=!hasBookSubjects(book);
 const missingAcquisitionSource=!book?.acquisitionSource;
 const missingAcquisitionMethod=!book?.acquisitionMethod;
 const missingAcquisitionNotes=!String(book?.acquisitionNotes||"").trim();
 if(catalogStatusFilter==="ASIN Only")return !!identifiers.asin&&!hasAnyIsbn;
 if(catalogStatusFilter==="No ISBN")return !hasPrintIsbn;
 if(catalogStatusFilter==="Digital No ISBN")return isDigitalBook(book)&&!hasPrintIsbn;
 if(catalogStatusFilter==="Manual Entry")return normalizeKey(book?.catalogStatus)==="manual entry"||normalizeKey(book?.source)==="manual"||normalizeKey(book?.entrySource)==="manual"||normalizeKey(book?.importSource)==="manual"||normalizeKey(book?.createdByImport)==="manual";
 if(missingFilter==="metadata")return missingAuthor||missingPublisher||missingFormat||missingCover||missingSubject;
 if(missingFilter==="authors")return !getBookAuthorDisplay(book);
 if(missingFilter==="publishers")return !firstPublisher(book?.publishers)&&!getReadableName(book?.publisher)&&!getReadableName(book?.publisherRef);
 if(missingFilter==="formats")return !firstFormat(book?.formats)&&!(Array.isArray(book?.formatPrices)&&book.formatPrices.length);
 if(missingFilter==="covers")return !hasBookCover(book);
 if(missingFilter==="isbn"||missingFilter==="isbn10"||missingFilter==="isbn13")return missingPrintIsbn;
 if(missingFilter==="eisbn")return missingEisbn;
 if(missingFilter==="asin")return missingAsin;
 if(missingFilter==="acquisitionsource")return missingAcquisitionSource;
 if(missingFilter==="acquisitionmethod")return missingAcquisitionMethod;
 if(missingFilter==="acquisitionnotes")return missingAcquisitionNotes;
 if(missingFilter==="subjects")return !hasBookSubjects(book);
 if(hasFilter==="cover")return hasBookCover(book);
 if(hasFilter==="isbn")return hasPrintIsbn;
 if(hasFilter==="asin")return !!identifiers.asin;
 if(hasFilter==="identifier")return hasAnyIdentifier;
 if(hasFilter==="acquisitionsource")return !!book?.acquisitionSource;
 if(hasFilter==="acquisitionmethod")return !!book?.acquisitionMethod;
 if(hasFilter==="acquisitionnotes")return !!String(book?.acquisitionNotes||"").trim();
 if(hasFilter==="subjects")return Array.isArray(book?.subjects)&&book.subjects.length>0;
 if(readingFilter)return matchStatus(getBookReadingStatus(book),readingFilter);
 return true;
};

const matchesArray=(arr,value,key="name")=>{
 if(!value)return true;
 if(!Array.isArray(arr)||!arr.length)return false;
 return arr.some(item=>{
  if(typeof item==="string")return item===value;
  return (item?.[key]||getName(item))===value;
 });
};

const matchesObject=(item,value,key="name")=>{
 if(!value)return true;
 if(!item)return false;
 if(typeof item==="string")return item===value;
 return (item?.[key]||getName(item))===value;
};

const toAmount=value=>{
 if(value===null||value===undefined||value==="")return 0;
 const num=Number(value);
 return Number.isFinite(num)?num:0;
};

const getBookTotal=book=>{
 const base=toAmount(book?.cost);
 const formatTotal=Array.isArray(book?.formatPrices)?book.formatPrices.reduce((sum,item)=>sum+toAmount(item?.price),0):0;
 return base+formatTotal;
};

const getBookCurrency=book=>{
 return (book?.currency||book?.formatPrices?.[0]?.currency||"USD").toUpperCase();
};

const getTotalsByCurrency=items=>{
 return items.reduce((acc,book)=>{
  const currency=getBookCurrency(book);
  acc[currency]=(acc[currency]||0)+getBookTotal(book);
  return acc;
 },{});
};

const formatCurrencyTotals=totals=>{
 const entries=Object.entries(totals);
 if(!entries.length)return "—";
 return entries.map(([currency,total])=>`${currency}: ${formatMoney(total,currency)}`).join(" | ");
};

const getBookId=book=>String(book?._id||book?.id||"");

const getDuplicateTitleKey=book=>{
 const title=normalizeKey(book?.title);
 if(!title)return "";
 return [
  title,
  normalizeKey(book?.subtitle),
  normalizeKey(book?.edition),
  normalizeKey(book?.volume),
  normalizeKey(book?.series?._id||book?.series?.id||getReadableName(book?.series)||book?.series),
  normalizeKey(book?.seriesNumber)
 ].join("|");
};

const getDuplicateValueSet=(items,getValue)=>{
 const counts=new Map();
 items.map(getValue).filter(Boolean).forEach(value=>counts.set(value,(counts.get(value)||0)+1));
 return new Set([...counts.entries()].filter(([,count])=>count>1).map(([value])=>value));
};

const getCostRange=label=>{
 if(label==="Free / $0")return {min:0,max:0};
 if(label==="$0.01 - $5")return {min:0.01,max:5};
 if(label==="$5.01 - $15")return {min:5.01,max:15};
 if(label==="$15.01 - $30")return {min:15.01,max:30};
 if(label==="$30+")return {min:30.01,max:null};
 return null;
};

const formatMoney=(amount,currency="USD")=>{
 const safeAmount=Number.isFinite(amount)?amount:0;
 try{
  return new Intl.NumberFormat("en-US",{style:"currency",currency:(currency||"USD").toUpperCase()}).format(safeAmount);
 }catch{
  return `${(currency||"USD").toUpperCase()} ${safeAmount.toFixed(2)}`;
 }
};

const cleanIsbn10=value=>String(value||"").toUpperCase().replace(/[^0-9X]/g,"");
const cleanIsbn13=value=>String(value||"").replace(/\D/g,"");

const formatIsbn10=value=>{
 const clean=cleanIsbn10(value);
 if(clean.length!==10)return clean||String(value||"");
 return `${clean.slice(0,1)}-${clean.slice(1,4)}-${clean.slice(4,9)}-${clean.slice(9)}`;
};

const formatIsbn13=value=>{
 const clean=cleanIsbn13(value);
 if(clean.length!==13)return clean||String(value||"");
 return `${clean.slice(0,3)}-${clean.slice(3,4)}-${clean.slice(4,7)}-${clean.slice(7,12)}-${clean.slice(12)}`;
};

const normalizeBooks=data=>{
 if(Array.isArray(data))return data;
 if(Array.isArray(data?.books))return data.books;
 if(Array.isArray(data?.data))return data.data;
 if(Array.isArray(data?.data?.books))return data.data.books;
 return [];
};

const getVersionedImageSrc=(image,version)=>image?`/images/${image}${version?`?v=${version}`:""}`:"";

function FormattedText({value}){
 const text=Array.isArray(value)?value.filter(Boolean).join("<br/>"):String(value||"");
 if(!text)return "—";
 return <div className="books-index-formatted-text" dangerouslySetInnerHTML={{__html:DOMPurify.sanitize(text)}} />;
}

function BookDetailField({label,children,wide=false}){
 return(
  <div className={wide?"books-index-modal-field is-wide":"books-index-modal-field"}>
   <span className="label">{label}</span>
   <div className="books-index-modal-value">{children||"—"}</div>
  </div>
 );
}

export default function BooksIndexPage({books:propBooks,onAdd,onEdit,onDelete,onDeleteSelected}){
 const [searchParams]=useSearchParams();
 const [books,setBooks]=useState(normalizeBooks(propBooks));
 const [loading,setLoading]=useState(!Array.isArray(propBooks));
 const [totalBooks,setTotalBooks]=useState(normalizeBooks(propBooks).length);
 const [serverTotalPages,setServerTotalPages]=useState(1);
 const [search,setSearch]=useState("");
 const [authorFilter,setAuthorFilter]=useState("");
 const [publisherFilter,setPublisherFilter]=useState("");
 const [genreFilter,setGenreFilter]=useState("");
 const [subjectFilter,setSubjectFilter]=useState("");
 const [formatFilter,setFormatFilter]=useState("");
 const [acquisitionSourceFilter,setAcquisitionSourceFilter]=useState("");
 const [acquisitionMethodFilter,setAcquisitionMethodFilter]=useState("");
 const [selectedRows,setSelectedRows]=useState([]);
 const [currentPage,setCurrentPage]=useState(1);
 const [activeBook,setActiveBook]=useState(null);
 const [printCardSize,setPrintCardSize]=useState("4x6");
 const [printLayout,setPrintLayout]=useState("single");
 const [printBooks,setPrintBooks]=useState([]);
 const [isPrinting,setIsPrinting]=useState(false);
 const [showBookFormModal,setShowBookFormModal]=useState(false);
 const [bookFormMode,setBookFormMode]=useState("add");
 const [selectedBook,setSelectedBook]=useState(null);
 const [imageVersions,setImageVersions]=useState({});
 const [showDeleteModal,setShowDeleteModal]=useState(false);
 const [filterOptions,setFilterOptions]=useState({authors:[],publishers:[],genres:[],subjects:[],formats:[],acquisitionSources:[],acquisitionMethods:[]});
 const [libraryBooks,setLibraryBooks]=useState(()=>Array.isArray(propBooks)?normalizeBooks(propBooks):[]);
 const pageSize=15;
 const missingFilter=searchParams.get("missing")||"";
 const hasFilter=searchParams.get("has")||"";
 const readingFilter=searchParams.get("reading")||"";
 const duplicateFilter=searchParams.get("duplicate")||"";
 const bookFilter=searchParams.get("book")||"";
 const requiredFilter=searchParams.get("required")||"";
 const catalogStatusFilter=searchParams.get("catalogStatus")||"";
 const urlGenreFilter=searchParams.get("genre")||"";
 const urlFormatFilter=searchParams.get("format")||"";
 const urlAcquisitionSourceFilter=searchParams.get("acquisitionSource")||"";
 const urlAcquisitionMethodFilter=searchParams.get("acquisitionMethod")||"";
 const costFilter=searchParams.get("cost")||"";
 const sortFilter=searchParams.get("sort")||"";
 const effectiveGenreFilter=genreFilter||urlGenreFilter;
 const effectiveFormatFilter=formatFilter||urlFormatFilter;
 const effectiveAcquisitionSourceFilter=acquisitionSourceFilter||urlAcquisitionSourceFilter;
 const effectiveAcquisitionMethodFilter=acquisitionMethodFilter||urlAcquisitionMethodFilter;

 const loadFilterOptions=async()=>{
  try{
   const res=await fetch("/api/books/filter-options",{cache:"no-store"});
   const data=await res.json();
   if(!res.ok)throw new Error(data?.message||"Failed to load filter options");
   setFilterOptions({
    authors:Array.isArray(data?.authors)?data.authors:[],
    publishers:Array.isArray(data?.publishers)?data.publishers:[],
    genres:Array.isArray(data?.genres)?data.genres:[],
    subjects:Array.isArray(data?.subjects)?data.subjects:[],
    formats:Array.isArray(data?.formats)?data.formats:[],
    acquisitionSources:Array.isArray(data?.acquisitionSources)?data.acquisitionSources:[],
    acquisitionMethods:Array.isArray(data?.acquisitionMethods)?data.acquisitionMethods:[]
   });
  }catch{
   setFilterOptions({authors:[],publishers:[],genres:[],subjects:[],formats:[],acquisitionSources:[],acquisitionMethods:[]});
  }
 };

 const dashboardFilterLabel=useMemo(()=>{
  if(bookFilter)return "Selected book";
  if(catalogStatusFilter)return catalogStatusFilter;
  if(missingFilter==="metadata")return "Books with missing metadata";
  if(missingFilter==="authors")return "Books missing authors";
  if(missingFilter==="publishers")return "Books missing publishers";
  if(missingFilter==="formats")return "Books missing formats";
  if(missingFilter==="covers")return "Books with no cover";
  if(missingFilter==="isbn"||missingFilter==="isbn10"||missingFilter==="isbn13")return "Books with no ISBN-10/13";
  if(missingFilter==="eisbn")return "Digital books with no eISBN";
  if(missingFilter==="asin")return requiredFilter==="true"?"Books with no ASIN where required":"Books with no ASIN";
  if(missingFilter==="acquisitionsource")return "Books with no acquisition source";
  if(missingFilter==="acquisitionmethod")return "Books with no acquisition method";
  if(missingFilter==="acquisitionnotes")return "Books with no acquisition notes";
  if(missingFilter==="subjects")return "Books with no subjects";
  if(hasFilter==="cover")return "Books with cover images";
  if(hasFilter==="isbn")return "Books with ISBN-10/13 data";
  if(hasFilter==="asin")return "Books with ASIN data";
  if(hasFilter==="identifier")return "Books with identifier data";
  if(hasFilter==="acquisitionsource")return "Books with acquisition source";
  if(hasFilter==="acquisitionmethod")return "Books with acquisition method";
  if(hasFilter==="acquisitionnotes")return "Books with acquisition notes";
  if(hasFilter==="subjects")return "Books with subject tags";
  if(readingFilter)return `Books marked ${readingFilter}`;
  if(duplicateFilter==="isbn")return "Duplicate ISBN review";
  if(duplicateFilter==="asin")return "Duplicate ASIN review";
  if(duplicateFilter==="identifier")return "Duplicate identifier review";
  if(duplicateFilter==="title")return "Duplicate title review";
  if(urlGenreFilter)return `Genre: ${urlGenreFilter}`;
  if(urlFormatFilter)return `Format: ${urlFormatFilter}`;
  if(urlAcquisitionSourceFilter)return `Acquisition Source: ${urlAcquisitionSourceFilter}`;
  if(urlAcquisitionMethodFilter)return `Acquisition Method: ${urlAcquisitionMethodFilter}`;
  if(costFilter)return `Cost range: ${costFilter}`;
  if(sortFilter==="recent")return "Recently added books";
  if(sortFilter==="cost"||sortFilter==="value")return "Books by highest value";
  if(sortFilter==="purchaseDate")return "Books by purchase date";
  return "";
 },[bookFilter,catalogStatusFilter,missingFilter,requiredFilter,hasFilter,readingFilter,duplicateFilter,urlGenreFilter,urlFormatFilter,urlAcquisitionSourceFilter,urlAcquisitionMethodFilter,costFilter,sortFilter]);

 useEffect(()=>{
  setCurrentPage(1);
 },[missingFilter,hasFilter,readingFilter,duplicateFilter,bookFilter,requiredFilter,catalogStatusFilter,urlGenreFilter,urlFormatFilter,urlAcquisitionSourceFilter,urlAcquisitionMethodFilter,costFilter,sortFilter]);

 useEffect(()=>{
  loadFilterOptions();
 },[]);

 useEffect(()=>{
  const clearPrinting=()=>{
   document.body.classList.remove("books-index-printing");
   setIsPrinting(false);
  };
  window.addEventListener("afterprint",clearPrinting);
  return()=>window.removeEventListener("afterprint",clearPrinting);
 },[]);

 useEffect(()=>{
  if(Array.isArray(propBooks)){
   setLibraryBooks(normalizeBooks(propBooks));
   return;
  }

  let active=true;

  (async()=>{
   try{
    const res=await fetch("/api/books?sort=title&order=asc",{cache:"no-store"});
    const data=await res.json();
    if(!res.ok)throw new Error(data?.message||"Failed to load library totals");
    if(active)setLibraryBooks(normalizeBooks(data));
   }catch{
    if(active)setLibraryBooks([]);
   }
  })();

  return()=>{active=false;};
 },[propBooks]);

 useEffect(()=>{
  if(Array.isArray(propBooks)){
   setBooks(normalizeBooks(propBooks));
   setTotalBooks(normalizeBooks(propBooks).length);
   setServerTotalPages(Math.max(1,Math.ceil(normalizeBooks(propBooks).length/pageSize)));
   setLoading(false);
   return;
  }

  let active=true;

  (async()=>{
   try{
    setLoading(true);
    const sortMap={
     recent:{sort:"createdAt",order:"desc"},
     cost:{sort:"cost",order:"desc"},
     value:{sort:"cost",order:"desc"},
     purchaseDate:{sort:"purchaseDate",order:"desc"}
    };
    const sortConfig=sortMap[sortFilter]||{sort:"title",order:"asc"};
    const params=new URLSearchParams({
     page:String(currentPage),
     limit:String(pageSize),
     sort:sortConfig.sort,
     order:sortConfig.order
    });
    const costRange=getCostRange(costFilter);

    if(search.trim())params.set("search",search.trim());
    if(bookFilter)params.set("book",bookFilter);
    if(authorFilter)params.set("author",authorFilter);
    if(publisherFilter)params.set("publisher",publisherFilter);
    if(effectiveGenreFilter)params.set("genre",effectiveGenreFilter);
    if(effectiveFormatFilter)params.set("format",effectiveFormatFilter);
    if(effectiveAcquisitionSourceFilter)params.set("acquisitionSource",effectiveAcquisitionSourceFilter);
    if(effectiveAcquisitionMethodFilter)params.set("acquisitionMethod",effectiveAcquisitionMethodFilter);
    if(subjectFilter)params.set("subject",subjectFilter);
    if(costRange){
     params.set("minCost",String(costRange.min));
     if(costRange.max!==null)params.set("maxCost",String(costRange.max));
    }
    if(missingFilter)params.set("missing",missingFilter);
    if(hasFilter)params.set("has",hasFilter);
    if(readingFilter)params.set("reading",readingFilter);
    if(duplicateFilter)params.set("duplicate",duplicateFilter);
    if(requiredFilter)params.set("required",requiredFilter);
    if(catalogStatusFilter)params.set("catalogStatus",catalogStatusFilter);

    const res=await fetch(`/api/books?${params.toString()}`,{cache:"no-store"});
    const data=await res.json();
    if(!res.ok)throw new Error(data?.message||"Failed to load books");
    if(!active)return;
    let loadedBooks=normalizeBooks(data);
    if(bookFilter&&!loadedBooks.some(book=>getBookId(book)===bookFilter)){
     const singleRes=await fetch(`/api/books/${encodeURIComponent(bookFilter)}`,{cache:"no-store"});
     const singleData=await singleRes.json();
     if(singleRes.ok){
      loadedBooks=normalizeBooks(singleData?.book?[singleData.book]:singleData);
     }
    }
    if(!active)return;
    setBooks(loadedBooks);
    setTotalBooks(bookFilter?loadedBooks.length:Number(data?.total)||loadedBooks.length);
    setServerTotalPages(bookFilter?1:Math.max(1,Number(data?.pages)||1));
   }catch{
    if(active){
     setBooks([]);
     setTotalBooks(0);
     setServerTotalPages(1);
    }
   }finally{
    if(active)setLoading(false);
   }
  })();
  return()=>{active=false;};
 },[propBooks,currentPage,search,authorFilter,publisherFilter,effectiveGenreFilter,subjectFilter,effectiveFormatFilter,effectiveAcquisitionSourceFilter,effectiveAcquisitionMethodFilter,bookFilter,costFilter,sortFilter,missingFilter,hasFilter,readingFilter,duplicateFilter,requiredFilter,catalogStatusFilter]);

 const authorOptions=useMemo(()=>{
  const source=filterOptions.authors.length?filterOptions.authors:books.flatMap(book=>book.authors||[]);
  return [...new Set(source.map(author=>getName(author)).filter(Boolean))].sort((a,b)=>a.localeCompare(b));
 },[books,filterOptions.authors]);

 const publisherOptions=useMemo(()=>{
  const source=filterOptions.publishers.length?filterOptions.publishers:books.flatMap(book=>book.publishers||[]);
  return [...new Set(source.map(publisher=>getName(publisher)).filter(Boolean))].sort((a,b)=>a.localeCompare(b));
 },[books,filterOptions.publishers]);

 const genreOptions=useMemo(()=>{
  const source=filterOptions.genres.length?filterOptions.genres:books.flatMap(book=>book.genres||[]);
  return [...new Set(source.map(genre=>getName(genre)).filter(Boolean))].sort((a,b)=>a.localeCompare(b));
 },[books,filterOptions.genres]);

 const subjectOptions=useMemo(()=>{
  const source=filterOptions.subjects.length?filterOptions.subjects:books.flatMap(book=>book.subjects||[]);
  return [...new Set(source.filter(Boolean))].sort((a,b)=>String(a).localeCompare(String(b)));
 },[books,filterOptions.subjects]);

 const formatOptions=useMemo(()=>{
  const source=filterOptions.formats.length?filterOptions.formats:books.flatMap(book=>book.formats||[]);
  return [...new Set(source.map(format=>getName(format)).filter(Boolean))].sort((a,b)=>a.localeCompare(b));
 },[books,filterOptions.formats]);

 const acquisitionSourceOptions=useMemo(()=>{
  const source=filterOptions.acquisitionSources.length?filterOptions.acquisitionSources:books.map(book=>book.acquisitionSource).filter(Boolean);
  return [...new Set(source.map(item=>getName(item)).filter(Boolean))].sort((a,b)=>a.localeCompare(b));
 },[books,filterOptions.acquisitionSources]);

 const acquisitionMethodOptions=useMemo(()=>{
  const source=filterOptions.acquisitionMethods.length?filterOptions.acquisitionMethods:books.map(book=>book.acquisitionMethod).filter(Boolean);
  return [...new Set(source.map(item=>getName(item)).filter(Boolean))].sort((a,b)=>a.localeCompare(b));
 },[books,filterOptions.acquisitionMethods]);

 const duplicateReviewKeys=useMemo(()=>({
  isbn:getDuplicateValueSet(books,book=>getBookIdentifiers(book).isbn13||getBookIdentifiers(book).isbn10||getBookIdentifiers(book).eisbn),
  asin:getDuplicateValueSet(books,book=>getBookIdentifiers(book).asin),
  identifier:getDuplicateValueSet(books,book=>{
   const identifiers=getBookIdentifiers(book);
   return identifiers.isbn13||identifiers.isbn10||identifiers.eisbn||identifiers.asin||identifiers.customId;
  }),
  title:getDuplicateValueSet(books,getDuplicateTitleKey)
 }),[books]);

 const filteredBooks=useMemo(()=>{
 const q=search.trim().toLowerCase();
 const applyLocalDuplicateFilter=Array.isArray(propBooks)&&!!duplicateFilter;
 return books.filter(book=>{
   const haystack=[
    book._id,
    book.title,
    book.subtitle,
    joinNames(book.authors,"displayName"),
    joinNames(book.publishers,"name"),
    book.series?.name||"",
    joinNames(book.genres,"name"),
    (book.subjects||[]).join(" "),
    joinNames(book.formats,"name"),
    joinNames(book.fileTypes,"name"),
    book.publication?.language?.name||book.publication?.language||"",
    book.isbn10,
    book.isbn13,
    book.eisbn,
    book.asin,
    book.customId,
    book.identifierNotes,
    getName(book.acquisitionSource),
    getName(book.acquisitionMethod),
    book.acquisitionNotes,
    book.cost,
    book.currency,
    Array.isArray(book.formatPrices)?book.formatPrices.map(item=>`${getName(item?.format)} ${item?.price||""} ${item?.currency||""}`).join(" "):""
   ].join(" ").toLowerCase();

   const costRange=getCostRange(costFilter);
   const totalCost=getBookTotal(book);
   const identifiers=getBookIdentifiers(book);

   if(bookFilter&&getBookId(book)!==bookFilter)return false;
   if(!hasDashboardFilterMatch(book,{missingFilter,hasFilter,readingFilter,requiredFilter,catalogStatusFilter}))return false;
   if(applyLocalDuplicateFilter&&duplicateFilter==="isbn"&&!duplicateReviewKeys.isbn.has(identifiers.isbn13||identifiers.isbn10||identifiers.eisbn))return false;
   if(applyLocalDuplicateFilter&&duplicateFilter==="asin"&&!duplicateReviewKeys.asin.has(identifiers.asin))return false;
   if(applyLocalDuplicateFilter&&duplicateFilter==="identifier"&&!duplicateReviewKeys.identifier.has(identifiers.isbn13||identifiers.isbn10||identifiers.eisbn||identifiers.asin||identifiers.customId))return false;
   if(applyLocalDuplicateFilter&&duplicateFilter==="title"&&!duplicateReviewKeys.title.has(getDuplicateTitleKey(book)))return false;
   if(q&&!haystack.includes(q))return false;
   if(authorFilter&&!matchesArray(book.authors,authorFilter,"displayName"))return false;
   if(publisherFilter&&!matchesArray(book.publishers,publisherFilter,"name"))return false;
   if(effectiveGenreFilter&&!matchesArray(book.genres,effectiveGenreFilter,"name"))return false;
   if(subjectFilter&&!(book.subjects||[]).includes(subjectFilter))return false;
   if(effectiveFormatFilter&&!matchesArray(book.formats,effectiveFormatFilter,"name"))return false;
   if(effectiveAcquisitionSourceFilter&&!matchesObject(book.acquisitionSource,effectiveAcquisitionSourceFilter,"name"))return false;
   if(effectiveAcquisitionMethodFilter&&!matchesObject(book.acquisitionMethod,effectiveAcquisitionMethodFilter,"name"))return false;
   if(costRange&&(totalCost<costRange.min||(costRange.max!==null&&totalCost>costRange.max)))return false;
   return true;
  });
 },[books,search,authorFilter,publisherFilter,effectiveGenreFilter,subjectFilter,effectiveFormatFilter,effectiveAcquisitionSourceFilter,effectiveAcquisitionMethodFilter,missingFilter,hasFilter,readingFilter,requiredFilter,catalogStatusFilter,bookFilter,costFilter,duplicateFilter,duplicateReviewKeys,propBooks]);

 const libraryTotalsByCurrency=useMemo(()=>getTotalsByCurrency(libraryBooks),[libraryBooks]);
 const currentSectionTotalsByCurrency=useMemo(()=>getTotalsByCurrency(filteredBooks),[filteredBooks]);

 const totalPages=Array.isArray(propBooks)?Math.max(1,Math.ceil(filteredBooks.length/pageSize)):serverTotalPages;
 const safeCurrentPage=currentPage>totalPages?totalPages:currentPage;
 const paginatedBooks=useMemo(()=>{
  if(!Array.isArray(propBooks))return filteredBooks;
  const start=(safeCurrentPage-1)*pageSize;
  return filteredBooks.slice(start,start+pageSize);
 },[filteredBooks,safeCurrentPage,propBooks]);

 const selectedBooksForPrint=useMemo(()=>filteredBooks.filter(book=>selectedRows.includes(book._id)),[filteredBooks,selectedRows]);

 const toggleRow=id=>{
  setSelectedRows(prev=>prev.includes(id)?prev.filter(item=>item!==id):[...prev,id]);
 };

 const toggleAllCurrentPage=()=>{
  const ids=paginatedBooks.map(book=>book._id);
  const allSelected=ids.every(id=>selectedRows.includes(id));
  if(allSelected){
   setSelectedRows(prev=>prev.filter(id=>!ids.includes(id)));
   return;
  }
  setSelectedRows(prev=>[...new Set([...prev,...ids])]);
 };

 const clearAuthorFilter=()=>{setAuthorFilter("");setCurrentPage(1);};
 const clearPublisherFilter=()=>{setPublisherFilter("");setCurrentPage(1);};
 const clearGenreFilter=()=>{setGenreFilter("");setCurrentPage(1);};
 const clearSubjectFilter=()=>{setSubjectFilter("");setCurrentPage(1);};
 const clearFormatFilter=()=>{setFormatFilter("");setCurrentPage(1);};
 const clearAcquisitionSourceFilter=()=>{setAcquisitionSourceFilter("");setCurrentPage(1);};
 const clearAcquisitionMethodFilter=()=>{setAcquisitionMethodFilter("");setCurrentPage(1);};
 const clearSearch=()=>{setSearch("");setCurrentPage(1);};
 const clearAllFilters=()=>{
  setSearch("");
  setAuthorFilter("");
  setPublisherFilter("");
  setGenreFilter("");
  setSubjectFilter("");
  setFormatFilter("");
  setAcquisitionSourceFilter("");
  setAcquisitionMethodFilter("");
  setCurrentPage(1);
 };

 const openAddBookModal=()=>{
  setBookFormMode("add");
  setSelectedBook(null);
  setShowBookFormModal(true);
 };

 const openEditBookModal=book=>{
  setBookFormMode("edit");
  setSelectedBook(book);
  setShowBookFormModal(true);
 };

 const closeBookFormModal=()=>{
  setShowBookFormModal(false);
  setSelectedBook(null);
 };

 const openDeleteModal=book=>{
  setSelectedBook(book);
  setShowDeleteModal(true);
 };

 const closeDeleteModal=()=>{
  setShowDeleteModal(false);
  setSelectedBook(null);
 };

 const confirmDeleteBook=async()=>{
  if(typeof onDelete==="function"&&selectedBook){
   await onDelete(selectedBook);
  }else if(selectedBook?._id){
   await fetch(`/api/books/${selectedBook._id}`,{method:"DELETE"});
  }
  setBooks(prev=>prev.filter(book=>book._id!==selectedBook?._id));
  setShowDeleteModal(false);
  setSelectedBook(null);
 };

 const handleDeleteSelected=async()=>{
  if(typeof onDeleteSelected==="function"&&selectedRows.length){
   await onDeleteSelected(selectedRows);
  }else{
   await Promise.all(selectedRows.map(id=>fetch(`/api/books/${id}`,{method:"DELETE"})));
  }
  setBooks(prev=>prev.filter(book=>!selectedRows.includes(book._id)));
  setSelectedRows([]);
 };

 const handleBookSaved=book=>{
  setShowBookFormModal(false);
  loadFilterOptions();
  const savedBook=book||selectedBook;
  const savedBookId=savedBook?._id||selectedBook?._id;
  if(savedBookId&&Array.isArray(savedBook?.images)){
   setImageVersions(prev=>({...prev,[savedBookId]:Date.now()}));
  }
  if(bookFormMode==="edit"){
   if(typeof onEdit==="function")onEdit(savedBook);
   setBooks(prev=>prev.map(item=>item._id===savedBookId?savedBook:item));
   setActiveBook(prev=>prev?._id===savedBookId?savedBook:prev);
  }else{
   if(typeof onAdd==="function")onAdd(book);
   if(book?._id)setBooks(prev=>[book,...prev.filter(item=>item._id!==book._id)]);
 }
 setSelectedBook(null);
};

 const getPrintPageCss=()=>(
  "@media print{@page{size:8.5in 11in;margin:0;}}"
 );

 const printAfterStateUpdate=layout=>{
  document.getElementById("books-index-print-page-size")?.remove();
  const style=document.createElement("style");
  style.id="books-index-print-page-size";
  style.textContent=getPrintPageCss(layout);
  document.head.appendChild(style);
  document.body.classList.add("books-index-printing");
  flushSync(()=>setIsPrinting(true));
  setTimeout(()=>{
   window.print();
   setTimeout(()=>{
    document.body.classList.remove("books-index-printing");
    setIsPrinting(false);
   },250);
  },50);
 };

const handlePrintSingleCard=()=>{
 if(!activeBook)return;
 flushSync(()=>{
  setPrintLayout("sheet");
  setPrintBooks([activeBook]);
 });
 printAfterStateUpdate("sheet");
};

 const handlePrintSelectedCards=()=>{
  if(!selectedBooksForPrint.length)return;
  flushSync(()=>{
   setPrintLayout("sheet");
   setPrintBooks(selectedBooksForPrint);
  });
  printAfterStateUpdate("sheet");
 };

 const renderCompactPrintFront=book=>(
  <article className="books-index-sheet-card books-index-sheet-card-front" key={`${book._id}-front`}>
   <div className="books-index-print-card-head">
    <h2>{book.title}{book.subtitle?`: ${book.subtitle}`:""}</h2>
    <div className="books-index-filing-code">{getBookFilingCode(book)}</div>
   </div>
   <div className="books-index-sheet-card-body">
    <div><strong>Author</strong><span>{getBookAuthorDisplay(book)||"—"}</span></div>
    <div><strong>Publisher</strong><span>{joinNames(book.publishers,"name")||"—"}</span></div>
    <div><strong>Series</strong><span>{book.series?.name||"—"}{book.seriesNumber?` #${book.seriesNumber}`:""}</span></div>
    <div><strong>Publication</strong><span>{[fullDate(book.publication?.publishedDate),getName(book.publication?.language)].filter(Boolean).join(" • ")||"—"}</span></div>
    <div><strong>ISBN-13</strong><span>{book.isbn13?formatIsbn13(book.isbn13):"—"}</span></div>
    <div><strong>ISBN-10</strong><span>{book.isbn10?formatIsbn10(book.isbn10):"—"}</span></div>
    <div><strong>Genre</strong><span>{joinNames(book.genres,"name")||"—"}</span></div>
    <div><strong>Subjects</strong><span>{(book.subjects||[]).join("; ")||"—"}</span></div>
    <div><strong>Custom ID</strong><span>{book.customId||"—"}</span></div>
    <div><strong>ASIN</strong><span>{book.asin||"—"}</span></div>
   </div>
  </article>
 );

 const renderCompactPrintBack=book=>(
  <article className="books-index-sheet-card books-index-sheet-card-back" key={`${book._id}-back`}>
   <div className="books-index-print-card-head">
    <h2>{book.title}{book.subtitle?`: ${book.subtitle}`:""}</h2>
    <div className="books-index-filing-code">{getBookFilingCode(book)}</div>
   </div>
   <div className="books-index-sheet-card-body is-back">
    <section className="books-index-card-back-acquisition">
     <h3>Acquisition</h3>
     <p><strong>Source:</strong> {getName(book.acquisitionSource)||"—"}</p>
     <p><strong>Method:</strong> {getName(book.acquisitionMethod)||"—"}</p>
     <p><strong>Purchase Date:</strong> {fullDate(book.purchaseDate)||"—"}</p>
     <p><strong>Total Cost:</strong> {formatMoney(getBookTotal(book),getBookCurrency(book))}</p>
     <p><strong>Notes:</strong> {book.acquisitionNotes||"—"}</p>
    </section>
    <section className="books-index-card-back-summary">
     <h3>Summary</h3>
     <FormattedText value={book.summary} />
    </section>
    <section className="books-index-card-back-notes">
     <h3>Notes</h3>
     <FormattedText value={book.notes} />
    </section>
   </div>
  </article>
 );

 const renderFullSheetPrint=book=>(
  <article className="books-index-full-sheet-page" key={`${book._id}-full-sheet`}>
   <div className="books-index-print-card-head">
    <h2>{book.title}{book.subtitle?`: ${book.subtitle}`:""}</h2>
    <div className="books-index-filing-code">{getBookFilingCode(book)}</div>
   </div>
   <div className="books-index-sheet-card-body">
    <div><strong>Author</strong><span>{getBookAuthorDisplay(book)||"—"}</span></div>
    <div><strong>Publisher</strong><span>{joinNames(book.publishers,"name")||"—"}</span></div>
    <div><strong>Series</strong><span>{book.series?.name||"—"}{book.seriesNumber?` #${book.seriesNumber}`:""}</span></div>
    <div><strong>Publication</strong><span>{[fullDate(book.publication?.publishedDate),getName(book.publication?.language)].filter(Boolean).join(" • ")||"—"}</span></div>
    <div><strong>ISBN-13</strong><span>{book.isbn13?formatIsbn13(book.isbn13):"—"}</span></div>
    <div><strong>ISBN-10</strong><span>{book.isbn10?formatIsbn10(book.isbn10):"—"}</span></div>
    <div><strong>Genre</strong><span>{joinNames(book.genres,"name")||"—"}</span></div>
    <div><strong>Subjects</strong><span>{(book.subjects||[]).join("; ")||"—"}</span></div>
    <div><strong>Custom ID</strong><span>{book.customId||"—"}</span></div>
    <div><strong>ASIN</strong><span>{book.asin||"—"}</span></div>
   </div>
   <section className="books-index-full-sheet-section">
    <h3>Acquisition</h3>
    <div className="books-index-full-sheet-facts">
     <p><strong>Source:</strong> {getName(book.acquisitionSource)||"—"}</p>
     <p><strong>Method:</strong> {getName(book.acquisitionMethod)||"—"}</p>
     <p><strong>Purchase Date:</strong> {fullDate(book.purchaseDate)||"—"}</p>
     <p><strong>Total Cost:</strong> {formatMoney(getBookTotal(book),getBookCurrency(book))}</p>
    </div>
    <p><strong>Notes:</strong> {book.acquisitionNotes||"—"}</p>
   </section>
   <section className="books-index-full-sheet-section">
    <h3>Summary</h3>
    <FormattedText value={book.summary} />
   </section>
   <section className="books-index-full-sheet-section">
    <h3>Notes</h3>
    <FormattedText value={book.notes} />
   </section>
  </article>
 );

 const isFullSheetPrint=printCardSize==="full-sheet";
 const printCardChunks=chunkItems(printBooks,isFullSheetPrint?1:getPrintCardsPerPage(printCardSize));

 return(
  <div className="books-index-page">
   <div className="books-index-toolbar">
    <div className="books-index-heading">
     <h1>Book Collection</h1>
     {dashboardFilterLabel?<div className="text-muted fw-semibold mt-1">{dashboardFilterLabel}</div>:null}
    </div>
    <div className="books-index-actions">
     {selectedRows.length?(
      <>
       <Form.Select size="sm" className="books-index-print-size-select" value={printCardSize} onChange={e=>setPrintCardSize(e.target.value)} aria-label="Print card size">
        {PRINT_CARD_SIZES.map(size=><option key={size.value} value={size.value}>{size.label}</option>)}
       </Form.Select>
       <Button className="books-index-print-selected-btn" onClick={handlePrintSelectedCards}><FaPrint/> Print Selected Cards</Button>
      </>
     ):null}
     <Button className="books-index-add-btn" onClick={openAddBookModal}><FaPlus/> Add Book</Button>
     {selectedRows.length?(
      <Button className="books-index-delete-selected-btn" onClick={handleDeleteSelected}><FaTrash/> Delete Selected</Button>
     ):null}
    </div>
   </div>

   <div className="books-index-filters">
    {dashboardFilterLabel?(
     <div className="books-index-filter-alert">
      <div className="alert alert-info py-2 mb-0">
       Showing filtered catalog results for: <strong>{dashboardFilterLabel}</strong>
       <Link to="/dashboard" className="alert-link ms-2">Back to dashboard</Link>
      </div>
     </div>
    ):null}

    <div className="books-index-filter books-index-search">
     <label>Search</label>
     <InputGroup>
      <InputGroup.Text><FaSearch/></InputGroup.Text>
      <Form.Control value={search} onChange={e=>{setSearch(e.target.value);setCurrentPage(1);}} placeholder="Search title, author, publisher, language, genre, ISBN, ASIN, custom ID, acquisition, cost..." />
      <Button variant="outline-secondary" onClick={clearSearch} disabled={!search}>Clear</Button>
     </InputGroup>
    </div>

    <div className="books-index-filter">
     <label>Author</label>
     <div className="books-index-filter-row">
      <Form.Select value={authorFilter} onChange={e=>{setAuthorFilter(e.target.value);setCurrentPage(1);}}>
       <option value="">All Authors</option>
       {authorOptions.map(item=><option key={item} value={item}>{item}</option>)}
      </Form.Select>
      <Button variant="outline-secondary" onClick={clearAuthorFilter} disabled={!authorFilter}>Clear</Button>
     </div>
    </div>

    <div className="books-index-filter">
     <label>Publisher</label>
     <div className="books-index-filter-row">
      <Form.Select value={publisherFilter} onChange={e=>{setPublisherFilter(e.target.value);setCurrentPage(1);}}>
       <option value="">All Publishers</option>
       {publisherOptions.map(item=><option key={item} value={item}>{item}</option>)}
      </Form.Select>
      <Button variant="outline-secondary" onClick={clearPublisherFilter} disabled={!publisherFilter}>Clear</Button>
     </div>
    </div>

    <div className="books-index-filter">
     <label>Genre</label>
     <div className="books-index-filter-row">
      <Form.Select value={genreFilter} onChange={e=>{setGenreFilter(e.target.value);setCurrentPage(1);}}>
       <option value="">All Genres</option>
       {genreOptions.map(item=><option key={item} value={item}>{item}</option>)}
      </Form.Select>
      <Button variant="outline-secondary" onClick={clearGenreFilter} disabled={!genreFilter}>Clear</Button>
     </div>
    </div>

    <div className="books-index-filter">
     <label>Subject</label>
     <div className="books-index-filter-row">
      <Form.Select value={subjectFilter} onChange={e=>{setSubjectFilter(e.target.value);setCurrentPage(1);}}>
       <option value="">All Subjects</option>
       {subjectOptions.map(item=><option key={item} value={item}>{item}</option>)}
      </Form.Select>
      <Button variant="outline-secondary" onClick={clearSubjectFilter} disabled={!subjectFilter}>Clear</Button>
     </div>
    </div>

    <div className="books-index-filter">
     <label>Format</label>
     <div className="books-index-filter-row">
      <Form.Select value={formatFilter} onChange={e=>{setFormatFilter(e.target.value);setCurrentPage(1);}}>
       <option value="">All Formats</option>
       {formatOptions.map(item=><option key={item} value={item}>{item}</option>)}
      </Form.Select>
      <Button variant="outline-secondary" onClick={clearFormatFilter} disabled={!formatFilter}>Clear</Button>
     </div>
    </div>

    <div className="books-index-filter">
     <label>Acquisition Source</label>
     <div className="books-index-filter-row">
      <Form.Select value={acquisitionSourceFilter} onChange={e=>{setAcquisitionSourceFilter(e.target.value);setCurrentPage(1);}}>
       <option value="">All Sources</option>
       {acquisitionSourceOptions.map(item=><option key={item} value={item}>{item}</option>)}
      </Form.Select>
      <Button variant="outline-secondary" onClick={clearAcquisitionSourceFilter} disabled={!acquisitionSourceFilter}>Clear</Button>
     </div>
    </div>

    <div className="books-index-filter">
     <label>Acquisition Method</label>
     <div className="books-index-filter-row">
      <Form.Select value={acquisitionMethodFilter} onChange={e=>{setAcquisitionMethodFilter(e.target.value);setCurrentPage(1);}}>
       <option value="">All Methods</option>
       {acquisitionMethodOptions.map(item=><option key={item} value={item}>{item}</option>)}
      </Form.Select>
      <Button variant="outline-secondary" onClick={clearAcquisitionMethodFilter} disabled={!acquisitionMethodFilter}>Clear</Button>
     </div>
    </div>

    <div className="books-index-filter books-index-clear-all">
     <label>Filters</label>
     <Button className="books-index-clear-btn" onClick={clearAllFilters}>Clear All Filters</Button>
    </div>
   </div>

   <div className="books-index-summary">
    <div className="books-index-summary-item">
     <span>Running total:</span>
     <strong>{formatCurrencyTotals(libraryTotalsByCurrency)}</strong>
    </div>
    <div className="books-index-summary-item">
     <span>Current section:</span>
     <strong>{formatCurrencyTotals(currentSectionTotalsByCurrency)}</strong>
    </div>
   </div>

   <div className="books-index-table-wrap">
    <Table hover className="books-index-table">
     <thead>
      <tr>
       <th className="books-index-check-col"><Form.Check type="checkbox" checked={paginatedBooks.length>0&&paginatedBooks.every(book=>selectedRows.includes(book._id))} onChange={toggleAllCurrentPage}/></th>
       <th>Barcode</th>
       <th>Cover</th>
       <th>Title</th>
       <th>Author</th>
       <th>Publisher</th>
       <th>Genre</th>
       <th>Subject</th>
       <th>Format</th>
       <th>Cost</th>
       <th>Year</th>
       <th className="books-index-actions-col">Actions</th>
      </tr>
     </thead>
     <tbody>
      {loading?(
       Array.from({length:pageSize},(_,index)=>(
        <tr key={`book-loading-${index}`}>
         <td colSpan="12">
          <div className="placeholder-glow py-2">
           <span className="placeholder col-1 me-3"></span>
           <span className="placeholder col-2 me-3"></span>
           <span className="placeholder col-3 me-3"></span>
           <span className="placeholder col-2 me-3"></span>
           <span className="placeholder col-1"></span>
          </div>
         </td>
        </tr>
       ))
      ):!paginatedBooks.length&&(
       <tr>
        <td colSpan="12" className="books-index-empty">No books found.</td>
       </tr>
      )}
      {!loading&&paginatedBooks.map(book=>{
       const image=firstImage(book.images);
       const imageVersion=imageVersions[book._id];
       return(
        <tr key={book._id} className={selectedRows.includes(book._id)?"is-selected":""}>
         <td className="books-index-check-col" onClick={e=>e.stopPropagation()}><Form.Check type="checkbox" checked={selectedRows.includes(book._id)} onChange={()=>toggleRow(book._id)}/></td>
         <td onClick={()=>setActiveBook(book)} className="books-index-barcode"><BookBarcode book={book} height={28} width={0.9} displayValue /></td>
         <td onClick={()=>setActiveBook(book)}>
          <div className="books-index-cover">{image?<img src={getVersionedImageSrc(image,imageVersion)} alt={book.title}/>:<div className="books-index-cover-placeholder">No Image</div>}</div>
         </td>
         <td onClick={()=>setActiveBook(book)}>{book.title}{book.subtitle?`: ${book.subtitle}`:""}</td>
         <td onClick={()=>setActiveBook(book)}>{getBookAuthorDisplay(book)||"—"}</td>
         <td onClick={()=>setActiveBook(book)}>{firstPublisher(book.publishers)||"—"}</td>
         <td onClick={()=>setActiveBook(book)}>{joinNames(book.genres,"name")||"—"}</td>
         <td onClick={()=>setActiveBook(book)}>{(book.subjects||[]).slice(0,2).join(", ")||"—"}</td>
         <td onClick={()=>setActiveBook(book)}>{joinNames(book.formats,"name")||firstFormat(book.formats)||"—"}</td>
         <td onClick={()=>setActiveBook(book)}>{formatMoney(getBookTotal(book),getBookCurrency(book))}</td>
         <td onClick={()=>setActiveBook(book)}>{year(book.publication?.publishedDate)||"—"}</td>
         <td className="books-index-actions-col" onClick={e=>e.stopPropagation()}>
          <Button size="sm" className="books-index-edit-btn" onClick={()=>openEditBookModal(book)}><FaEdit/></Button>
          <Button size="sm" className="books-index-delete-btn" onClick={()=>openDeleteModal(book)}><FaTrash/></Button>
         </td>
        </tr>
       );
      })}
     </tbody>
    </Table>
   </div>

   <div className="books-index-footer">
    <div className="books-index-count">
     Showing {paginatedBooks.length?((safeCurrentPage-1)*pageSize)+1:0}-{Math.min(safeCurrentPage*pageSize,Array.isArray(propBooks)?filteredBooks.length:totalBooks)} of {Array.isArray(propBooks)?filteredBooks.length:totalBooks}
    </div>
    <Pagination className="books-index-pagination">
     <Pagination.First onClick={()=>setCurrentPage(1)} disabled={safeCurrentPage===1}/>
     <Pagination.Prev onClick={()=>setCurrentPage(safeCurrentPage-1)} disabled={safeCurrentPage===1}/>
     {Array.from({length:totalPages},(_,i)=>i+1).slice(Math.max(0,safeCurrentPage-3),Math.min(totalPages,safeCurrentPage+2)).map(page=><Pagination.Item key={page} active={page===safeCurrentPage} onClick={()=>setCurrentPage(page)}>{page}</Pagination.Item>)}
     <Pagination.Next onClick={()=>setCurrentPage(safeCurrentPage+1)} disabled={safeCurrentPage===totalPages}/>
     <Pagination.Last onClick={()=>setCurrentPage(totalPages)} disabled={safeCurrentPage===totalPages}/>
   </Pagination>
   </div>

   {createPortal(
   <div className={`books-index-print-range books-index-print-layout-${printLayout} ${isFullSheetPrint?"books-index-print-mode-full-sheet":"books-index-print-mode-duplex"} books-index-print-size-${printCardSize}`} aria-hidden="true">
     {printCardChunks.map((books,index)=>(
      <div className="books-index-print-sheet-pair" key={`sheet-pair-${index}`}>
       {isFullSheetPrint?(
        <div className="books-index-print-sheet books-index-print-sheet-full">
         {books.map(renderFullSheetPrint)}
        </div>
       ):(
        <>
         <div className="books-index-print-sheet books-index-print-sheet-front">
          {books.map(renderCompactPrintFront)}
         </div>
         <div className="books-index-print-sheet books-index-print-sheet-back">
          {books.map(renderCompactPrintBack)}
         </div>
        </>
       )}
      </div>
     ))}
    </div>,
    document.body
   )}

   <Modal show={!!activeBook&&!isPrinting} onHide={()=>setActiveBook(null)} centered size="xl" className={`books-index-modal books-index-print-layout-${printLayout} ${isFullSheetPrint?"books-index-print-mode-full-sheet":"books-index-print-mode-duplex"} books-index-print-size-${printCardSize}`} backdrop="static">
    <Modal.Header closeButton>
     <Modal.Title>{activeBook?.title}{activeBook?.subtitle?`: ${activeBook.subtitle}`:""}</Modal.Title>
     <div className="books-index-modal-print-actions">
      <Form.Select size="sm" className="books-index-print-size-select" value={printCardSize} onChange={e=>setPrintCardSize(e.target.value)} aria-label="Print card size">
       {PRINT_CARD_SIZES.map(size=><option key={size.value} value={size.value}>{size.label}</option>)}
      </Form.Select>
      <Button type="button" size="sm" className="books-index-print-btn" onClick={handlePrintSingleCard}><FaPrint/> Print Card</Button>
     </div>
    </Modal.Header>
    <Modal.Body>
     {activeBook&&(
      <>
       <div className="books-index-print-front">
        <div className="books-index-print-card-head">
         <h2 className="books-index-print-card-title">{activeBook.title}{activeBook.subtitle?`: ${activeBook.subtitle}`:""}</h2>
         <div className="books-index-filing-code">{getBookFilingCode(activeBook)}</div>
        </div>
        <div className="books-index-modal-content">
         <div className="books-index-modal-image">
          {firstImage(activeBook.images)?<img src={getVersionedImageSrc(firstImage(activeBook.images),imageVersions[activeBook._id])} alt={activeBook.title}/>:<div className="books-index-modal-image-placeholder">No Image</div>}
         </div>
         <div className="books-index-modal-details">
          <BookDetailField label="Barcode" wide>
           <div className="books-index-barcode-with-code">
            <BookBarcode book={activeBook} height={38} width={.9} displayValue />
            <div className="books-index-filing-code is-screen">{getBookFilingCode(activeBook)}</div>
           </div>
          </BookDetailField>
          <BookDetailField label="Author">{getBookAuthorDisplay(activeBook)||"—"}</BookDetailField>
          <BookDetailField label="Publisher">{joinNames(activeBook.publishers,"name")||"—"}</BookDetailField>
          <BookDetailField label="Series">{activeBook.series?.name||"—"}{activeBook.seriesNumber?` #${activeBook.seriesNumber}`:""}</BookDetailField>
          <BookDetailField label="Publication">{[fullDate(activeBook.publication?.publishedDate),getName(activeBook.publication?.language)].filter(Boolean).join(" • ")||"—"}</BookDetailField>
          <BookDetailField label="Edition">{activeBook.edition||"—"}</BookDetailField>
          <BookDetailField label="Volume">{activeBook.volume||"—"}</BookDetailField>
          <BookDetailField label="ISBN-10">
           {activeBook.isbn10?(
            <>
             <div className="books-index-isbn-number">{formatIsbn10(activeBook.isbn10)}</div>
             <BookBarcode book={activeBook} source="isbn10" height={38} width={.9} displayValue />
            </>
           ):"—"}
          </BookDetailField>
          <BookDetailField label="ISBN-13">
           {activeBook.isbn13?(
            <>
             <div className="books-index-isbn-number">{formatIsbn13(activeBook.isbn13)}</div>
             <BookBarcode book={activeBook} source="isbn13" height={38} width={.9} displayValue />
            </>
           ):"—"}
          </BookDetailField>
          <BookDetailField label="eISBN">
           {activeBook.eisbn?(
            <>
             <div className="books-index-isbn-number">{formatIsbn13(activeBook.eisbn)}</div>
             <BookBarcode book={activeBook} source="eisbn" height={38} width={.9} displayValue />
            </>
           ):"—"}
          </BookDetailField>
          <BookDetailField label="ASIN">{activeBook.asin||"—"}</BookDetailField>
          <BookDetailField label="Custom ID">{activeBook.customId||"—"}</BookDetailField>
          <BookDetailField label="Identifier Notes" wide>{activeBook.identifierNotes||"—"}</BookDetailField>
          <BookDetailField label="Format Prices" wide>{Array.isArray(activeBook.formatPrices)&&activeBook.formatPrices.length?activeBook.formatPrices.map(item=>`${getName(item?.format)||"Format"}: ${formatMoney(toAmount(item?.price),item?.currency||activeBook.currency||"USD")}`).join(" • "):"—"}</BookDetailField>
          <BookDetailField label="Total Cost">{formatMoney(getBookTotal(activeBook),getBookCurrency(activeBook))}</BookDetailField>
          <BookDetailField label="Condition">{activeBook.condition||"—"}</BookDetailField>
          <BookDetailField label="Reading Status">{activeBook.reading?.status||"Unread"}</BookDetailField>
          <BookDetailField label="Total Pages">{activeBook.reading?.totalPages||activeBook.pages||activeBook.pageCount||"—"}</BookDetailField>
          <BookDetailField label="Formats">{joinNames(activeBook.formats,"name")||"—"}</BookDetailField>
          <BookDetailField label="File Types">{joinNames(activeBook.fileTypes,"name")||"—"}</BookDetailField>
          <BookDetailField label="Genres">{joinNames(activeBook.genres,"name")||"—"}</BookDetailField>
          <BookDetailField label="Subjects">{(activeBook.subjects||[]).join("; ")||"—"}</BookDetailField>
          <div className="books-index-modal-accordions">
           <Accordion>
            <Accordion.Item eventKey="acquisition">
             <Accordion.Header>Acquisition</Accordion.Header>
             <Accordion.Body>
              <div className="books-index-modal-details">
               <BookDetailField label="Source">{getName(activeBook.acquisitionSource)||"—"}</BookDetailField>
               <BookDetailField label="Method">{getName(activeBook.acquisitionMethod)||"—"}</BookDetailField>
               <BookDetailField label="Purchase Date">{fullDate(activeBook.purchaseDate)||"—"}</BookDetailField>
               <BookDetailField label="Currency">{activeBook.currency||"USD"}</BookDetailField>
               <BookDetailField label="Total Cost">{formatMoney(getBookTotal(activeBook),getBookCurrency(activeBook))}</BookDetailField>
               <BookDetailField label="Notes" wide>{activeBook.acquisitionNotes||"—"}</BookDetailField>
              </div>
             </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="summary">
             <Accordion.Header>Summary</Accordion.Header>
             <Accordion.Body><FormattedText value={activeBook.summary} /></Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="notes">
             <Accordion.Header>Notes</Accordion.Header>
             <Accordion.Body><FormattedText value={activeBook.notes} /></Accordion.Body>
            </Accordion.Item>
           </Accordion>
          </div>
         </div>
        </div>
       </div>
       <div className="books-index-print-back">
        <div className="books-index-print-card-head">
         <h2>{activeBook.title}{activeBook.subtitle?`: ${activeBook.subtitle}`:""}</h2>
         <div className="books-index-filing-code">{getBookFilingCode(activeBook)}</div>
        </div>
        <div className="books-index-print-back-grid">
         <section>
          <h3>Acquisition</h3>
          <p><strong>Source:</strong> {getName(activeBook.acquisitionSource)||"—"}</p>
          <p><strong>Method:</strong> {getName(activeBook.acquisitionMethod)||"—"}</p>
          <p><strong>Purchase Date:</strong> {fullDate(activeBook.purchaseDate)||"—"}</p>
          <p><strong>Total Cost:</strong> {formatMoney(getBookTotal(activeBook),getBookCurrency(activeBook))}</p>
          <p><strong>Notes:</strong> {activeBook.acquisitionNotes||"—"}</p>
         </section>
         <section>
          <h3>Summary</h3>
          <FormattedText value={activeBook.summary} />
         </section>
         <section>
          <h3>Notes</h3>
          <FormattedText value={activeBook.notes} />
         </section>
        </div>
       </div>
      </>
     )}
    </Modal.Body>
   </Modal>

   <Modal show={showBookFormModal} onHide={closeBookFormModal} centered size="xl" backdrop="static">
    <Modal.Header closeButton>
     <Modal.Title>{bookFormMode==="edit"?"Edit Book":"Add Book"}</Modal.Title>
    </Modal.Header>
    <Modal.Body>
     <BookForm
      mode={bookFormMode}
      bookId={bookFormMode==="edit"?selectedBook?._id:""}
      initialData={bookFormMode==="edit"?selectedBook:null}
      onSaved={handleBookSaved}
      onCancel={closeBookFormModal}
     />
    </Modal.Body>
   </Modal>

   <Modal show={showDeleteModal} onHide={closeDeleteModal} centered>
    <Modal.Header closeButton>
     <Modal.Title>Delete Book</Modal.Title>
    </Modal.Header>
    <Modal.Body>
     <div className="d-flex align-items-start gap-3">
      <div style={{width:"72px",height:"96px",flex:"0 0 72px",borderRadius:"8px",overflow:"hidden",background:"#f3f3f3",display:"flex",alignItems:"center",justifyContent:"center"}}>
       {firstImage(selectedBook?.images)?<img src={getVersionedImageSrc(firstImage(selectedBook?.images),imageVersions[selectedBook?._id])} alt={selectedBook?.title} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<div style={{fontSize:"12px",color:"#666",textAlign:"center",padding:"8px"}}>No Image</div>}
      </div>
      <div className="flex-grow-1">
       <div className="fw-bold mb-2">{selectedBook?.title||"Selected book"}{selectedBook?.subtitle?`: ${selectedBook.subtitle}`:""}</div>
       <div><span className="label">Author:</span> {getBookAuthorDisplay(selectedBook)||"—"}</div>
       <div><span className="label">Publisher:</span> {joinNames(selectedBook?.publishers,"name")||"—"}</div>
       <div><span className="label">ASIN:</span> {selectedBook?.asin||"—"}</div>
       <div><span className="label">Custom ID:</span> {selectedBook?.customId||"—"}</div>
       <div><span className="label">Acquisition Source:</span> {getName(selectedBook?.acquisitionSource)||"—"}</div>
       <div><span className="label">Acquisition Method:</span> {getName(selectedBook?.acquisitionMethod)||"—"}</div>
       <div><span className="label">Total Cost:</span> {formatMoney(getBookTotal(selectedBook||{}),getBookCurrency(selectedBook||{}))}</div>
       <div className="mt-2">Are you sure you want to delete this book?</div>
       <div className="text-muted mt-2">This action cannot be undone.</div>
      </div>
     </div>
    </Modal.Body>
    <Modal.Footer>
     <Button variant="secondary" onClick={closeDeleteModal}>Cancel</Button>
     <Button variant="danger" onClick={confirmDeleteBook}><FaTrash className="me-2"/>Delete</Button>
    </Modal.Footer>
   </Modal>
  </div>
 );
}
