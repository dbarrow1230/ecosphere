import {useEffect,useMemo,useState} from "react";
import {Link} from "react-router-dom";
import {Modal} from "react-bootstrap";
import {FaBookOpen,FaChevronRight,FaLayerGroup,FaListUl,FaTags} from "react-icons/fa";
import "../../styles/CollectionsIndexPage.css";

function normalizeRows(data,key){
 if(Array.isArray(data))return data;
 if(Array.isArray(data?.[key]))return data[key];
 if(Array.isArray(data?.items))return data.items;
 if(Array.isArray(data?.results))return data.results;
 return [];
}

function getLabel(item){
 if(!item)return "";
 if(typeof item==="string")return item;
 return item.name||item.title||item.label||item.value||"";
}

function getMeta(item){
 if(item?.numberOfBooks===undefined||item?.numberOfBooks===null||item?.numberOfBooks==="")return "";
 const count=Number(item.numberOfBooks);
 if(!Number.isFinite(count))return "";
 return `${count} ${count===1?"book":"books"}`;
}

function getBookTitle(book){
 return [book?.title,book?.subtitle].filter(Boolean).join(": ")||"Untitled Book";
}

function joinNames(items,key="name"){
 if(!Array.isArray(items))return "";
 return items.map(item=>{
  if(typeof item==="string")return item;
  return item?.[key]||item?.displayName||item?.name||item?.title||"";
 }).filter(Boolean).join(", ");
}

function normalizeBooks(data){
 if(Array.isArray(data))return data;
 if(Array.isArray(data?.books))return data.books;
 if(Array.isArray(data?.data))return data.data;
 if(Array.isArray(data?.data?.books))return data.data.books;
 return [];
}

function CollectionPanel({id,title,items,managePath,error,getItemLabel=getLabel,showMeta=true,scrollAfter=10,collectionType,onSelect,selectedKey,icon}) {
 const sortedItems=useMemo(()=>{
  return [...items].sort((a,b)=>getItemLabel(a).localeCompare(getItemLabel(b)));
 },[items,getItemLabel]);
 const shouldScroll=sortedItems.length>scrollAfter;

 return(
  <section id={id} className="collections-panel">
   <div className="collections-panel-head">
    <div className="collections-panel-title-row">
     <div className="collections-panel-icon">{icon}</div>
     <div>
      <h2>{title} <span>{sortedItems.length}</span></h2>
     </div>
    </div>
    <Link className="collections-manage-link" to={managePath||"/collections"}>Manage</Link>
   </div>

   {error?<div className="collections-alert">{error}</div>:null}
   {!error&&!sortedItems.length?<div className="collections-empty">No records found.</div>:null}
   {!error&&sortedItems.length?(
    <div
     className="collections-list"
     style={{
      maxHeight:shouldScroll?"440px":"none",
      overflowY:shouldScroll?"auto":"visible"
     }}
   >
     {sortedItems.map((item,index)=>(
     <button
     key={item?._id||item?.id||getItemLabel(item)||index}
     type="button"
      className={`collections-list-item${selectedKey===(item?._id||item?.id||getItemLabel(item))?" is-active":""}`}
      onClick={()=>onSelect?.({type:collectionType,label:getItemLabel(item)||"Untitled",item})}
     >
       <span className="collections-list-label">{getItemLabel(item)||"Untitled"}</span>
       <div className="collections-list-meta">
        {showMeta&&getMeta(item)?<span>{getMeta(item)}</span>:null}
        {item?.isActive===false?<span className="collections-status">Inactive</span>:null}
        <FaChevronRight/>
       </div>
      </button>
     ))}
    </div>
   ):null}
  </section>
 );
}

function BooksForCollection({selected,books,loading,error,onClear}){
 return(
  <Modal show={!!selected} onHide={onClear} centered size="xl" dialogClassName="collections-modal" backdrop="static">
   <Modal.Header closeButton>
    <Modal.Title>
     <span>{selected?.type||"Collection"}</span>
     {selected?.label||"Collection"}
    </Modal.Title>
   </Modal.Header>
   <Modal.Body>
    <div className="collections-modal-count">{books.length} matching {books.length===1?"book":"books"}</div>

   {selected&&loading?<div className="collections-alert collections-alert-info">Loading books...</div>:null}
   {selected&&error?<div className="collections-alert">{error}</div>:null}
   {selected&&!loading&&!error&&!books.length?<div className="collections-empty">No books found for this collection.</div>:null}
   {selected&&!loading&&!error&&books.length?(
    <div className="collections-table-wrap">
     <table className="collections-table">
      <thead>
       <tr>
        <th>Title</th>
        <th>Author</th>
        <th>Series</th>
        <th>Genres</th>
        <th>Formats</th>
       </tr>
      </thead>
      <tbody>
       {books.map(book=>(
        <tr key={book?._id||book?.id||getBookTitle(book)}>
         <td>{getBookTitle(book)}</td>
         <td>{joinNames(book?.authors,"displayName")||"—"}</td>
         <td>{book?.series?.name||"—"}{book?.seriesNumber?` #${book.seriesNumber}`:""}</td>
         <td>{joinNames(book?.genres,"name")||"—"}</td>
         <td>{joinNames(book?.formats,"name")||"—"}</td>
        </tr>
       ))}
      </tbody>
     </table>
    </div>
   ):null}
   </Modal.Body>
  </Modal>
 );
}

export default function CollectionsIndexPage(){
 const [collections,setCollections]=useState({
  genres:[],
  series:[],
  formats:[],
  fileTypes:[]
 });
 const [errors,setErrors]=useState({});
 const [loading,setLoading]=useState(true);
 const [selectedCollection,setSelectedCollection]=useState(null);
 const [collectionBooks,setCollectionBooks]=useState([]);
 const [booksLoading,setBooksLoading]=useState(false);
 const [booksError,setBooksError]=useState("");

 const selectedKey=selectedCollection?.item?._id||selectedCollection?.item?.id||selectedCollection?.label||"";

 useEffect(()=>{
  let active=true;

  const loadCollection=async(endpoint,key,responseKey)=>{
   try{
    const res=await fetch(endpoint,{headers:{"Content-Type":"application/json"}});
    const data=await res.json();
    if(!res.ok)throw new Error(data?.message||`Failed to load ${key}`);
    return {key,rows:normalizeRows(data,responseKey),error:""};
   }catch(err){
    return {key,rows:[],error:err.message||`Failed to load ${key}`};
   }
  };

  (async()=>{
   setLoading(true);
   const results=await Promise.all([
    loadCollection("/api/genres","genres","genres"),
    loadCollection("/api/series?limit=1000","series","series"),
    loadCollection("/api/formats","formats","formats"),
    loadCollection("/api/filetypes","fileTypes","fileTypes")
   ]);

   if(!active)return;

   setCollections(results.reduce((acc,result)=>({...acc,[result.key]:result.rows}),{}));
   setErrors(results.reduce((acc,result)=>result.error?{...acc,[result.key]:result.error}:acc,{}));
   setLoading(false);
  })();

  return()=>{active=false;};
 },[]);

 useEffect(()=>{
  if(!selectedCollection){
   setCollectionBooks([]);
   setBooksError("");
   setBooksLoading(false);
   return;
  }

  const itemId=selectedCollection.item?._id||selectedCollection.item?.id;
  if(!itemId){
   setCollectionBooks([]);
   setBooksError("Selected collection is missing an id.");
   return;
  }

  const queryKey={
   Genres:"genre",
   Series:"series",
   Formats:"format",
   "File Types":"fileType"
  }[selectedCollection.type];

  if(!queryKey){
   setCollectionBooks([]);
   setBooksError("Unsupported collection type.");
   return;
  }

  let active=true;

  (async()=>{
   try{
    setBooksLoading(true);
    setBooksError("");
    const res=await fetch(`/api/books?${queryKey}=${encodeURIComponent(itemId)}`,{headers:{"Content-Type":"application/json"}});
    const data=await res.json();
    if(!res.ok)throw new Error(data?.message||"Failed to load books for this collection");
    if(active)setCollectionBooks(normalizeBooks(data));
   }catch(err){
    if(active){
     setCollectionBooks([]);
     setBooksError(err.message||"Failed to load books for this collection");
    }
   }finally{
    if(active)setBooksLoading(false);
   }
  })();

  return()=>{active=false;};
 },[selectedCollection]);

 return(
  <div className="collections-page">
   <div className="collections-hero">
    <div className="collections-hero-mark"><FaLayerGroup/></div>
    <div>
     <p>Library Reference Map</p>
     <h1>Collections</h1>
     <div>Open a collection to inspect the books attached to each genre, series, format, or file type.</div>
    </div>
   </div>

   {loading?<div className="collections-alert collections-alert-info">Loading collections...</div>:null}

   <div className="collections-grid">
    <CollectionPanel title="Genres" items={collections.genres} managePath="/genre" error={errors.genres} scrollAfter={10} collectionType="Genres" onSelect={setSelectedCollection} selectedKey={selectedKey} icon={<FaTags/>} />
    <CollectionPanel title="Series" items={collections.series} error={errors.series} getItemLabel={item=>item?.name||""} showMeta={false} scrollAfter={10} collectionType="Series" onSelect={setSelectedCollection} selectedKey={selectedKey} icon={<FaLayerGroup/>} />
    <CollectionPanel id="formats" title="Formats" items={collections.formats} error={errors.formats} scrollAfter={10} collectionType="Formats" onSelect={setSelectedCollection} selectedKey={selectedKey} icon={<FaBookOpen/>} />
    <CollectionPanel title="File Types" items={collections.fileTypes} error={errors.fileTypes} scrollAfter={10} collectionType="File Types" onSelect={setSelectedCollection} selectedKey={selectedKey} icon={<FaListUl/>} />
   </div>

   <BooksForCollection
    selected={selectedCollection}
    books={collectionBooks}
    loading={booksLoading}
    error={booksError}
    onClear={()=>setSelectedCollection(null)}
   />
  </div>
 );
}
