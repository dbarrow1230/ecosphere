// src/pages/Poems.jsx
import {useEffect,useMemo,useState} from "react";
import {Alert,Button,Carousel,Col,Form,Modal,Pagination,Row,Spinner,Table} from "react-bootstrap";
import {useSearchParams} from "react-router-dom";
import DOMPurify from "dompurify";
import PoemForm from "./forms/PoemForm.jsx";
import PoemDisplayModal from "./forms/PoemDisplayModal.jsx";
import "../styles/Poems.css";

function decodeHtml(value){
 const text=String(value||"");
 if(!text)return "";
 if(typeof document==="undefined")return text;

 const textarea=document.createElement("textarea");
 textarea.innerHTML=text;
 return textarea.value;
}

function escapeHtml(value){
 return String(value||"")
  .replace(/&/g,"&amp;")
  .replace(/</g,"&lt;")
  .replace(/>/g,"&gt;")
  .replace(/"/g,"&quot;")
  .replace(/'/g,"&#39;");
}

function formatPlainPoemText(value){
 return String(value||"")
  .replace(/\u00a0/g," ")
  .replace(/\r\n?/g,"\n")
  .split(/\n{2,}/)
  .map(stanza=>stanza.trim())
  .filter(Boolean)
  .map(stanza=>`<p>${escapeHtml(stanza).replace(/\n/g,"<br />")}</p>`)
  .join("");
}

function poemContentHtml(value){
 const decoded=decodeHtml(value);
 const hasHtml=/<\/?[a-z][\s\S]*>/i.test(decoded);
 const formatted=hasHtml?decoded:formatPlainPoemText(decoded.replace(/\u00a0/g," "));

 return DOMPurify.sanitize(formatted,{
  ALLOWED_TAGS:[
   "p",
   "br",
   "strong",
   "em",
   "b",
   "i",
   "u",
   "s",
   "span",
   "blockquote",
   "sup",
   "sub",
   "h1",
   "h2",
   "h3",
   "h4",
   "h5",
   "h6",
   "ul",
   "ol",
   "li",
   "a"
  ],
  ALLOWED_ATTR:[
   "style",
   "href",
   "target",
   "rel"
  ]
 });
}

function getAuthorName(poem){
 return poem?.author?.displayName||`${poem?.author?.firstName||""} ${poem?.author?.lastName||""}`.trim()||"Unknown Author";
}

const poemStatusOptions=[
 {value:"draft",label:"Draft"},
 {value:"in-progress",label:"In Progress"},
 {value:"incomplete",label:"Incomplete"},
 {value:"revision",label:"Revision"},
 {value:"finished",label:"Finished"},
 {value:"archived",label:"Archived"}
];

const publishWhereLabels={
 facebook:"Facebook",
 instagram:"Instagram",
 threads:"Threads",
 x:"X",
 website:"Website",
 blog:"Blog",
 journal:"Journal",
 book:"Book",
 other:"Other"
};

const filterParamNames=["author","genre","section","subsection","status","title","search"];

function normalizePoemStatus(status){
 const value=String(status||"").trim().toLowerCase();
 return value==="complete"?"finished":value;
}

function statusAllowsPublishing(status){
 const normalized=normalizePoemStatus(status);
 return normalized!=="draft"&&normalized!=="incomplete";
}

function getPoemStatusLabel(status){
 return poemStatusOptions.find(option=>option.value===normalizePoemStatus(status))?.label||"Finished";
}

function formatPublishedWhere(poem){
 if(!poem?.isPublished||!statusAllowsPublishing(poem?.status))return "—";
 const list=Array.isArray(poem?.publishedWhere)?poem.publishedWhere:[];
 if(!list.length)return "Published";
 return list.map(item=>publishWhereLabels[item]||item).join(", ");
}

function comparePoemTitles(a,b){
 return String(a?.title||"").localeCompare(String(b?.title||""),undefined,{
  sensitivity:"base",
  numeric:true
 });
}

function getPoemFolderPath(poem){
 return [poem?.collection,poem?.section,poem?.subsection]
  .map(item=>String(item||"").trim())
  .filter(Boolean)
  .join(" / ");
}

function getImageValue(value){
 if(!value)return "";
 if(typeof value==="string")return value;
 return value?.url||value?.src||value?.path||value?.filename||"";
}

function getPoemImageUrl(poem){
 const direct=getImageValue(poem?.backgroundImage)||getImageValue(poem?.image)||getImageValue(poem?.coverImage)||getImageValue(poem?.featuredImage);
 if(direct)return direct;

 if(Array.isArray(poem?.images)&&poem.images.length){
  return getImageValue(poem.images.find(Boolean));
 }

 if(Array.isArray(poem?.imageFiles)&&poem.imageFiles.length){
  return getImageValue(poem.imageFiles.find(Boolean));
 }

 return "";
}

function getPoemFeaturedDate(poem){
 const date=new Date(poem?.featuredAt);
 return Number.isNaN(date.getTime())?null:date;
}

function formatFeaturedDate(poem){
 const date=getPoemFeaturedDate(poem);
 if(!date)return "";
 return new Intl.DateTimeFormat("en-US",{month:"long",year:"numeric"}).format(date);
}

function formatPoemCopyrightDate(poem){
 const date=new Date(poem?.copyright);
 if(Number.isNaN(date.getTime()))return "";
 return new Intl.DateTimeFormat("en-US",{
  month:"long",
  day:"numeric",
  year:"numeric"
 }).format(date);
}

function getArrayText(value){
 if(!Array.isArray(value))return "";
 return value.join(" ");
}

function getAnalysisSearchText(poem){
 const analysis=poem?.analysis||{};
 return [
  analysis.formStructure||"",
  getArrayText(analysis.theme),
  getArrayText(analysis.tone),
  getArrayText(analysis.language),
  getArrayText(analysis.structure),
  getArrayText(analysis.personalInterpretation),
  getArrayText(analysis.broaderContextReflection),
  analysis.overall||""
 ].join(" ");
}

function normalizeSearchValue(value){
 return String(value||"").trim().toLowerCase();
}

function getFiltersFromSearchParams(searchParams){
 return {
  author:searchParams.get("author")||"",
  genre:searchParams.get("genre")||"",
  section:searchParams.get("section")||"",
  subsection:searchParams.get("subsection")||"",
  status:searchParams.get("status")||"",
  title:searchParams.get("title")||"",
  search:searchParams.get("search")||""
 };
}

function Poems(){

 const [searchParams,setSearchParams]=useSearchParams();
 const [poems,setPoems]=useState([]);
 const [authors,setAuthors]=useState([]);
 const [genres,setGenres]=useState([]);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");
 const [selectedPoem,setSelectedPoem]=useState(null);
 const [showPoemDisplayModal,setShowPoemDisplayModal]=useState(false);
 const [showDeleteModal,setShowDeleteModal]=useState(false);
 const [deleting,setDeleting]=useState(false);
 const [refreshKey,setRefreshKey]=useState(0);
 const [featuredIndex,setFeaturedIndex]=useState(0);

 const [filters,setFilters]=useState(()=>getFiltersFromSearchParams(searchParams));

 const [currentPage,setCurrentPage]=useState(1);
 const rowsPerPage=20;

 useEffect(()=>{
  let isMounted=true;

  const loadData=async()=>{
   try{
    setLoading(true);
    setError("");

    const [poemsRes,authorsRes,genresRes]=await Promise.all([
     fetch("/api/poems"),
     fetch("/api/authors"),
     fetch("/api/genres")
    ]);

    if(!poemsRes.ok)throw new Error("Failed to load poems");
    if(!authorsRes.ok)throw new Error("Failed to load authors");
    if(!genresRes.ok)throw new Error("Failed to load genres");

    const [poemsData,authorsData,genresData]=await Promise.all([
     poemsRes.json(),
     authorsRes.json(),
     genresRes.json()
    ]);

    if(!isMounted)return;

    const poemList=Array.isArray(poemsData)?poemsData:[];
    const authorList=Array.isArray(authorsData)?authorsData:authorsData?.authors||[];
    const genreList=Array.isArray(genresData)?genresData:genresData?.genres||[];

    setPoems(poemList);
    setAuthors(authorList);
    setGenres(genreList);

    const firstFeatured=poemList.find((poem)=>poem?.isFeatured);
    setSelectedPoem(firstFeatured||poemList[0]||null);
    setFeaturedIndex(0);
   }catch(err){
    if(isMounted)setError(err.message||"Failed to load poems");
   }finally{
    if(isMounted)setLoading(false);
   }
  };

  loadData();

  return()=>{
   isMounted=false;
  };
 },[refreshKey]);

 useEffect(()=>{
  const nextFilters=getFiltersFromSearchParams(searchParams);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  setFilters(prev=>{
   const unchanged=Object.keys(nextFilters).every(key=>prev[key]===nextFilters[key]);
   return unchanged?prev:nextFilters;
  });
 },[searchParams]);

 const editPoemId=searchParams.get("edit")||"";
 const showPoemFormModal=searchParams.get("modal")==="new"||Boolean(editPoemId);

 const openPoemFormModal=()=>{
  const next=new URLSearchParams(searchParams);
  next.set("modal","new");
  setSearchParams(next);
 };

 const closePoemFormModal=()=>{
  const next=new URLSearchParams(searchParams);
  next.delete("modal");
  next.delete("edit");
  setSearchParams(next);
 };

 const handlePoemSaved=()=>{
  closePoemFormModal();
  setRefreshKey(prev=>prev+1);
 };

const featuredPoems=useMemo(()=>{
  return poems
   .filter((poem)=>poem?.isFeatured&&statusAllowsPublishing(poem?.status))
   .sort((a,b)=>(getPoemFeaturedDate(b)?.getTime()||0)-(getPoemFeaturedDate(a)?.getTime()||0));
 },[poems]);

 useEffect(()=>{
  if(!featuredPoems.length){
   // eslint-disable-next-line react-hooks/set-state-in-effect
   setFeaturedIndex(0);
   return;
  }

  if(featuredIndex>featuredPoems.length-1){
   setFeaturedIndex(0);
  }
 },[featuredPoems,featuredIndex]);

 const titleOptions=useMemo(()=>{
  return [...new Map(
   poems
   .filter((poem)=>poem?.title)
   .map((poem)=>[poem.title,poem.title])
  ).values()].sort((a,b)=>a.localeCompare(b));
 },[poems]);

 const sectionOptions=useMemo(()=>{
  const genreFilter=filters.genre.trim();
  return [...new Set(
   poems
    .filter(poem=>!genreFilter||(poem?.genre?._id||poem?.genre||"")===genreFilter)
    .map(poem=>String(poem?.section||"").trim())
    .filter(Boolean)
  )]
   .sort((a,b)=>a.localeCompare(b));
 },[poems,filters.genre]);

 const subsectionOptions=useMemo(()=>{
  const genreFilter=filters.genre.trim();
  const sectionFilter=filters.section.trim();
  return [...new Set(
   poems
    .filter(poem=>(!genreFilter||(poem?.genre?._id||poem?.genre||"")===genreFilter)&&(!sectionFilter||poem?.section===sectionFilter))
    .map(poem=>String(poem?.subsection||"").trim())
    .filter(Boolean)
  )].sort((a,b)=>a.localeCompare(b));
 },[poems,filters.genre,filters.section]);

 const filteredPoems=useMemo(()=>{
  const authorFilter=filters.author.trim();
  const genreFilter=filters.genre.trim();
  const sectionFilter=filters.section.trim();
  const subsectionFilter=filters.subsection.trim();
  const statusFilter=filters.status.trim();
 const titleFilter=filters.title.trim();
  const searchFilter=normalizeSearchValue(filters.search);
  const exactSearchTitleExists=Boolean(searchFilter)&&poems.some(poem=>normalizeSearchValue(poem?.title)===searchFilter);

  return poems.filter((poem)=>{
   const poemAuthorId=poem?.author?._id||poem?.author||"";
   const poemGenreId=poem?.genre?._id||poem?.genre||"";
   const poemTitle=poem?.title||"";
   const authorName=poem?.author?.displayName||`${poem?.author?.firstName||""} ${poem?.author?.lastName||""}`.trim();
   const genreName=poem?.genre?.name||"";
   const statusLabel=getPoemStatusLabel(poem?.status);
   const publishedWhereText=formatPublishedWhere(poem);
   const folderPath=getPoemFolderPath(poem);
   const content=poem?.content||"";
   const subtitle=poem?.subtitle||"";
   const authorNote=poem?.authorNote||"";
   const analysisText=getAnalysisSearchText(poem);
   const definitionsText=Array.isArray(poem?.definitions)?poem.definitions.map(item=>`${item?.term||""} ${item?.meaning||""}`).join(" "):"";

   const matchesAuthor=!authorFilter||poemAuthorId===authorFilter;
   const matchesGenre=!genreFilter||poemGenreId===genreFilter;
   const matchesSection=!sectionFilter||poem?.section===sectionFilter;
   const matchesSubsection=!subsectionFilter||poem?.subsection===subsectionFilter;
   const matchesStatus=!statusFilter||normalizePoemStatus(poem?.status)===statusFilter;
   const matchesTitle=!titleFilter||poemTitle.toLowerCase().includes(titleFilter.toLowerCase());
   const matchesSearch=!searchFilter
    ||(exactSearchTitleExists
     ?normalizeSearchValue(poemTitle)===searchFilter
     :[
      poemTitle,
      subtitle,
      authorName,
      genreName,
      statusLabel,
      publishedWhereText,
      folderPath,
      content,
      authorNote,
      analysisText,
      definitionsText
     ].join(" ").toLowerCase().includes(searchFilter));

   return matchesAuthor&&matchesGenre&&matchesSection&&matchesSubsection&&matchesStatus&&matchesTitle&&matchesSearch;
  }).sort(comparePoemTitles);
 },[poems,filters]);

 const totalPages=Math.max(Math.ceil(filteredPoems.length/rowsPerPage),1);

 const paginatedPoems=useMemo(()=>{
  const start=(currentPage-1)*rowsPerPage;
  return filteredPoems.slice(start,start+rowsPerPage);
 },[filteredPoems,currentPage]);

 useEffect(()=>{
  // eslint-disable-next-line react-hooks/set-state-in-effect
  setCurrentPage(1);
 },[filters.author,filters.genre,filters.section,filters.subsection,filters.status,filters.title,filters.search]);

 const updateFilters=nextFilters=>{
  const nextParams=new URLSearchParams(searchParams);

  filterParamNames.forEach(param=>{
   if(nextFilters[param])nextParams.set(param,nextFilters[param]);
   else nextParams.delete(param);
  });

  setFilters(nextFilters);
  setSearchParams(nextParams,{replace:true});
 };

 const handleFilterChange=(e)=>{
  const {name,value}=e.target;
  updateFilters({
   ...filters,
   [name]:value,
   ...(name==="genre"?{section:"",subsection:""}:{}),
   ...(name==="section"?{subsection:""}:{})
  });
 };

 const clearFilter=name=>{
  updateFilters({
   ...filters,
   [name]:"",
   ...(name==="genre"?{section:"",subsection:""}:{}),
   ...(name==="section"?{subsection:""}:{})
  });
 };

 const handleFeaturedSelect=(poem)=>{
  setSelectedPoem(poem);
  setShowPoemDisplayModal(true);
 };

 const handleFeaturedSlide=(selectedIndex)=>{
  setFeaturedIndex(selectedIndex);
 };

 const handleRowSelect=(poem)=>{
  setSelectedPoem(poem);
  setShowPoemDisplayModal(true);
 };

 const closePoemDisplayModal=()=>{
  setShowPoemDisplayModal(false);
 };

 const openSelectedPoemEdit=poem=>{
  if(!poem?._id)return;
  setShowPoemDisplayModal(false);
  setSelectedPoem(poem);
  const next=new URLSearchParams(searchParams);
  next.delete("modal");
  next.set("edit",poem._id);
  setSearchParams(next);
 };

 const openDeleteModal=poem=>{
  if(!poem?._id)return;
  setShowPoemDisplayModal(false);
  setSelectedPoem(poem);
  setShowDeleteModal(true);
 };

 const closeDeleteModal=()=>{
  if(deleting)return;
  setShowDeleteModal(false);
 };

 const confirmDeletePoem=async()=>{
  if(!selectedPoem?._id||deleting)return;

  try{
   setDeleting(true);
   setError("");

   const response=await fetch(`/api/poems/${selectedPoem._id}`,{method:"DELETE"});
   const data=await response.json().catch(()=>null);

   if(!response.ok)throw new Error(data?.message||"Failed to delete poem");

   setPoems(prev=>prev.filter(poem=>poem?._id!==selectedPoem._id));
   setSelectedPoem(null);
   setShowDeleteModal(false);
   setShowPoemDisplayModal(false);
  }catch(err){
   setError(err.message||"Failed to delete poem");
  }finally{
   setDeleting(false);
  }
 };

 const resetFilters=()=>{
  const nextFilters={
   author:"",
   genre:"",
   section:"",
   subsection:"",
   status:"",
   title:"",
   search:""
  };
  const nextParams=new URLSearchParams(searchParams);
  filterParamNames.forEach(param=>nextParams.delete(param));
  setFilters(nextFilters);
  setSearchParams(nextParams,{replace:true});
 };

 const renderPagination=()=>{
  if(totalPages<=1)return null;

  const items=[];

  for(let i=1;i<=totalPages;i++){
   items.push(
    <Pagination.Item key={i} active={i===currentPage} onClick={()=>setCurrentPage(i)}>
     {i}
    </Pagination.Item>
   );
  }

  return <Pagination className="poems-page-pagination">{items}</Pagination>;
 };

 if(loading){
  return(
   <section className="poems-page">
    <div className="poems-page-status">
     <Spinner animation="border" role="status"/>
    </div>
   </section>
  );
 }

 if(error){
  return(
   <section className="poems-page">
    <Alert variant="danger">{error}</Alert>
   </section>
  );
 }

 return(
  <section className="poems-page">

   <section className="poems-featured">
    <h1 className="poems-section-title">Featured Poems</h1>

    {featuredPoems.length?(
     <Carousel
      activeIndex={featuredIndex}
      onSelect={handleFeaturedSlide}
      interval={5000}
      pause="hover"
      wrap
      controls={featuredPoems.length>1}
      indicators={featuredPoems.length>1}
      className="poems-featured-carousel"
     >
      {featuredPoems.map((poem,index)=>(
       <Carousel.Item key={`featured-slide-${poem._id}-${index}`}>
        <div className="poems-featured-grid poems-featured-grid-single">
         <article
          className={`poems-featured-card poems-featured-card-single${selectedPoem?._id===poem._id?" is-selected":""}`}
          onClick={()=>handleFeaturedSelect(poem)}
         >
          <div className="poems-featured-image">
           {getPoemImageUrl(poem)?(
            <img src={getPoemImageUrl(poem)} alt={poem?.backgroundImage?.alt||poem.title}/>
           ):(
            <div className="poems-featured-image-placeholder"/>
           )}
          </div>
          <div className="poems-featured-copy">
           <p className="poems-featured-eyebrow">
            Featured{formatFeaturedDate(poem)?` • ${formatFeaturedDate(poem)}`:""}
           </p>
           <h2 className="poems-featured-title">{poem.title}</h2>
           {poem.subtitle?<p className="poems-featured-subtitle">{poem.subtitle}</p>:null}
           <p className="poems-featured-meta">
           {getAuthorName(poem)}
           {poem?.genre?.name?` • ${poem.genre.name}`:""}
           {getPoemFolderPath(poem)?` • ${getPoemFolderPath(poem)}`:""}
          </p>
           <div
            className="poems-featured-content"
            dangerouslySetInnerHTML={{__html:poemContentHtml(poem.content)}}
           />
          </div>
         </article>
        </div>
       </Carousel.Item>
      ))}
     </Carousel>
    ):(
     <div className="poems-featured-empty">
      <div className="poems-featured-empty-inner">
       <p className="poems-featured-eyebrow">Featured</p>
       <h2 className="poems-featured-title">No Featured Poems Yet</h2>
       <p className="poems-featured-subtitle">Mark a poem as featured to display it here.</p>
      </div>
     </div>
    )}
   </section>

   <section className="poems-filters">
    <div className="d-flex align-items-center justify-content-between gap-3 flex-wrap">
     <h2 className="poems-section-title mb-0">Poem Archive</h2>
     <Button type="button" onClick={openPoemFormModal}>Add Poem</Button>
    </div>

    <Row className="g-3 poems-filter-grid">
     <Col xl={4} lg={6}>
      <Form.Group className="poems-filter-field">
       <Form.Label>Author:</Form.Label>
       <Form.Select name="author" value={filters.author} onChange={handleFilterChange}>
        <option value="">All Authors</option>
        {authors.map((author)=>(
         <option key={author._id} value={author._id}>
          {author.displayName||`${author.firstName||""} ${author.lastName||""}`.trim()}
         </option>
        ))}
       </Form.Select>
       <Button type="button" variant="outline-secondary" onClick={()=>clearFilter("author")} disabled={!filters.author}>Clear</Button>
      </Form.Group>
     </Col>

     <Col xl={4} lg={6}>
      <Form.Group className="poems-filter-field">
       <Form.Label>Genre:</Form.Label>
       <Form.Select name="genre" value={filters.genre} onChange={handleFilterChange}>
        <option value="">All Genres</option>
        {genres.map((genre)=>(
         <option key={genre._id} value={genre._id}>{genre.name}</option>
        ))}
       </Form.Select>
       <Button type="button" variant="outline-secondary" onClick={()=>clearFilter("genre")} disabled={!filters.genre}>Clear</Button>
      </Form.Group>
     </Col>

     <Col xl={4} lg={6}>
      <Form.Group className="poems-filter-field">
       <Form.Label>Section:</Form.Label>
       <Form.Select name="section" value={filters.section} onChange={handleFilterChange}>
        <option value="">All Sections</option>
        {sectionOptions.map((section)=>(
         <option key={section} value={section}>{section}</option>
        ))}
       </Form.Select>
       <Button type="button" variant="outline-secondary" onClick={()=>clearFilter("section")} disabled={!filters.section}>Clear</Button>
      </Form.Group>
     </Col>

     <Col xl={4} lg={6}>
      <Form.Group className="poems-filter-field">
       <Form.Label>Subsection:</Form.Label>
       <Form.Select name="subsection" value={filters.subsection} onChange={handleFilterChange}>
        <option value="">All Subsections</option>
        {subsectionOptions.map((subsection)=>(
         <option key={subsection} value={subsection}>{subsection}</option>
        ))}
       </Form.Select>
       <Button type="button" variant="outline-secondary" onClick={()=>clearFilter("subsection")} disabled={!filters.subsection}>Clear</Button>
      </Form.Group>
     </Col>

     <Col xl={4} lg={6}>
      <Form.Group className="poems-filter-field">
       <Form.Label>Status:</Form.Label>
       <Form.Select name="status" value={filters.status} onChange={handleFilterChange}>
        <option value="">All Statuses</option>
        {poemStatusOptions.map(option=>(
         <option key={option.value} value={option.value}>{option.label}</option>
        ))}
       </Form.Select>
       <Button type="button" variant="outline-secondary" onClick={()=>clearFilter("status")} disabled={!filters.status}>Clear</Button>
      </Form.Group>
     </Col>

     <Col xl={4} lg={6}>
      <Form.Group className="poems-filter-field">
       <Form.Label>Title:</Form.Label>
       <Form.Control
        type="text"
        name="title"
        value={filters.title}
        onChange={handleFilterChange}
        placeholder="Enter title"
        list="poem-title-options"
       />
       <datalist id="poem-title-options">
        {titleOptions.map((title)=>(
         <option key={title} value={title}/>
        ))}
       </datalist>
       <Button type="button" variant="outline-secondary" onClick={()=>clearFilter("title")} disabled={!filters.title}>Clear</Button>
      </Form.Group>
     </Col>

     <Col xs={12}>
      <Form.Group className="poems-filter-field poems-filter-field-wide">
       <Form.Label>Search:</Form.Label>
       <Form.Control
        type="text"
        name="search"
        value={filters.search}
        onChange={handleFilterChange}
        placeholder="Search poems"
       />
       <Button type="button" variant="outline-secondary" onClick={()=>clearFilter("search")} disabled={!filters.search}>Clear</Button>
      </Form.Group>
     </Col>
    </Row>

    <div className="poems-filter-actions">
     <button type="button" className="poems-filter-reset" onClick={resetFilters}>Reset Filters</button>
     <span className="poems-filter-count">{filteredPoems.length} poem{filteredPoems.length!==1?"s":""}</span>
    </div>
   </section>

   <section className="poems-table-wrap">
    <div className="table-responsive">
     <Table hover className="poems-table align-middle">
      <thead>
       <tr>
        <th>Image</th>
        <th>Title</th>
        <th>Author</th>
        <th>Genre</th>
        <th>Status</th>
        <th>Published Where</th>
        <th>Folder</th>
        <th>Actions</th>
       </tr>
      </thead>

      <tbody>
       {paginatedPoems.length?paginatedPoems.map((poem)=>(
        <tr
         key={poem._id}
         className={`poems-table-row${selectedPoem?._id===poem._id?" is-selected":""}`}
         onClick={()=>handleRowSelect(poem)}
        >
         <td>
          {getPoemImageUrl(poem)?(
           <img
            src={getPoemImageUrl(poem)}
            alt={poem?.backgroundImage?.alt||poem.title}
            className="poems-thumb"
           />
          ):(
           <div className="poems-thumb poems-thumb-placeholder"/>
          )}
         </td>
         <td>
          <div className="poems-table-title-wrap">
           <span className="poems-table-title">{poem.title}</span>
           {poem.subtitle?<span className="poems-table-subtitle">{poem.subtitle}</span>:null}
          </div>
         </td>
         <td>{getAuthorName(poem)}</td>
         <td>{poem?.genre?.name||"—"}</td>
         <td>{getPoemStatusLabel(poem?.status)}</td>
         <td>{formatPublishedWhere(poem)}</td>
         <td>{getPoemFolderPath(poem)||"—"}</td>
         <td>
          <div className="poems-table-actions" onClick={event=>event.stopPropagation()}>
           <Button type="button" variant="outline-primary" size="sm" onClick={()=>openSelectedPoemEdit(poem)}>Edit</Button>
           <Button type="button" variant="outline-danger" size="sm" onClick={()=>openDeleteModal(poem)}>Delete</Button>
          </div>
         </td>
        </tr>
       )):(
        <tr>
         <td colSpan="8" className="poems-table-empty">No poems found.</td>
        </tr>
       )}
      </tbody>
     </Table>
    </div>

    {renderPagination()}
   </section>

   <Modal
    show={showPoemFormModal}
    onHide={closePoemFormModal}
    size="xl"
    centered
    backdrop="static"
    dialogClassName="poems-form-dialog"
   >
    <Modal.Header closeButton>
     <Modal.Title>{editPoemId?"Edit Poem":"Add Poem"}</Modal.Title>
    </Modal.Header>
    <Modal.Body>
     <PoemForm
      isModal
      poemId={editPoemId}
      onClose={closePoemFormModal}
      onSaved={handlePoemSaved}
     />
    </Modal.Body>
   </Modal>

   <Modal
    show={showPoemDisplayModal&&!!selectedPoem}
    onHide={closePoemDisplayModal}
    centered
    className="poems-reader-modal"
    dialogClassName="poems-reader-presentation-dialog"
   >
    <Modal.Header closeButton>
     <div className="poems-reader-modal-heading">
      <div className="poems-reader-modal-meta">
       {getAuthorName(selectedPoem)}
       {selectedPoem?.genre?.name?` • ${selectedPoem.genre.name}`:""}
       {getPoemFolderPath(selectedPoem)?` • ${getPoemFolderPath(selectedPoem)}`:""}
       {formatPoemCopyrightDate(selectedPoem)?` • ${formatPoemCopyrightDate(selectedPoem)}`:""}
       {selectedPoem?.isFeatured&&formatFeaturedDate(selectedPoem)?` • Featured ${formatFeaturedDate(selectedPoem)}`:""}
      </div>
      <Modal.Title>{selectedPoem?.title||"Poem"}</Modal.Title>
     </div>
    </Modal.Header>
    <Modal.Body>
     <PoemDisplayModal
      poem={selectedPoem}
      poemHtml={poemContentHtml(selectedPoem?.content)}
     />
    </Modal.Body>
   </Modal>

   <Modal show={showDeleteModal} onHide={closeDeleteModal} centered backdrop="static">
    <Modal.Header closeButton={!deleting}>
     <Modal.Title>Delete Poem</Modal.Title>
    </Modal.Header>
    <Modal.Body>
     <p className="mb-2">Are you sure you want to delete this poem?</p>
     <div className="poems-delete-confirm-title">{selectedPoem?.title||"Selected poem"}</div>
     <p className="text-muted mb-0">This action cannot be undone.</p>
    </Modal.Body>
    <Modal.Footer>
     <Button type="button" variant="secondary" onClick={closeDeleteModal} disabled={deleting}>Cancel</Button>
     <Button type="button" variant="danger" onClick={confirmDeletePoem} disabled={deleting}>
      {deleting?"Deleting...":"Delete Poem"}
     </Button>
    </Modal.Footer>
   </Modal>

  </section>
 );
}

export default Poems;
