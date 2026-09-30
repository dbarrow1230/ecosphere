import {useEffect,useMemo,useState} from "react";
import {Button,Form,InputGroup,Modal,Table} from "react-bootstrap";
import {FaPlus,FaSearch,FaTrash,FaEdit} from "react-icons/fa";
import DOMPurify from "dompurify";
import BookBarcode from "../../components/books/BookBarcode.jsx";
import AuthorForm from "../forms/AuthorForm";
import "../../styles/AuthorsIndexPage.css";

const year=v=>{
 if(!v)return "";
 const d=new Date(v);
 if(!Number.isNaN(d.getTime()))return d.getFullYear();
 if(typeof v==="number"||/^\d{4}$/.test(String(v)))return String(v);
 return "";
};

const joinNames=(items,key="name")=>{
 if(!Array.isArray(items)||!items.length)return "";
 return items.map(item=>{
  if(typeof item==="string")return item;
  return item?.[key]||item?.displayName||item?.name||"";
 }).filter(Boolean).join(", ");
};

const firstImage=value=>{
 if(Array.isArray(value)&&value.length){
  const found=value.find(item=>{
   if(typeof item==="string")return !!item;
   return !!(item?.url||item?.src||item?.path||item?.thumbnail||item?.small||item?.medium||item?.large||item?.filename||item?.name);
  });
  if(!found)return "";
  if(typeof found==="string")return found;
  return found?.url||found?.src||found?.path||found?.thumbnail||found?.small||found?.medium||found?.large||found?.filename||found?.name||"";
 }
 if(typeof value==="string")return value;
 return value?.url||value?.src||value?.path||value?.thumbnail||value?.small||value?.medium||value?.large||value?.filename||value?.name||"";
};

const resolveImageSrc=value=>{
 const image=firstImage(value);
 if(!image)return "";
 if(/^https?:\/\//i.test(image)||/^data:/i.test(image)||/^blob:/i.test(image)||image.startsWith("/"))return image;
 return `/images/${image}`;
};

const resolveAuthorImageSrc=value=>{
 const image=firstImage(value);
 if(!image)return "";
 if(/^https?:\/\//i.test(image)||/^data:/i.test(image)||/^blob:/i.test(image)||image.startsWith("/"))return image;
 return `/authors/${image}`;
};

const normalizeAuthors=value=>{
 if(Array.isArray(value))return value;
 if(Array.isArray(value?.authors))return value.authors;
 if(Array.isArray(value?.items))return value.items;
 return [];
};

const normalizeBooks=value=>{
 if(Array.isArray(value))return value;
 if(Array.isArray(value?.books))return value.books;
 if(Array.isArray(value?.items))return value.items;
 return [];
};

const formatNames=value=>{
 if(!Array.isArray(value)||!value.length)return "";
 return value.map(item=>{
  if(typeof item==="string")return item;
  return item?.name||item?.label||item?.format||item?.type||"";
 }).filter(Boolean).join(", ");
};

const authorDisplay=author=>{
 return author?.displayName||author?.sortName||[author?.firstName,author?.middleName,author?.lastName].filter(Boolean).join(" ")||"";
};

const authorBio=author=>String(author?.bio||author?.biography||author?.about||author?.description||"").trim();

function AuthorBio({author}){
 const bio=authorBio(author);
 if(!bio)return <div className="authors-index-bio-empty">No biography recorded.</div>;
 return <div className="authors-index-bio-text" dangerouslySetInnerHTML={{__html:DOMPurify.sanitize(bio)}} />;
}

const matchesAuthorValue=(value,selectedAuthor)=>{
 if(!value||!selectedAuthor)return false;

 const selectedId=String(selectedAuthor?._id||"").trim();
 const selectedSlug=String(selectedAuthor?.slug||"").trim();
 const selectedDisplay=String(selectedAuthor?.displayName||"").trim();
 const selectedSort=String(selectedAuthor?.sortName||"").trim();
 const selectedFull=String([selectedAuthor?.firstName,selectedAuthor?.middleName,selectedAuthor?.lastName].filter(Boolean).join(" ")).trim();

 if(typeof value==="string"){
  const test=value.trim();
  return test===selectedId||test===selectedSlug||test===selectedDisplay||test===selectedSort||test===selectedFull;
 }

 const valueId=String(value?._id||"").trim();
 const valueSlug=String(value?.slug||"").trim();
 const valueDisplay=String(value?.displayName||"").trim();
 const valueSort=String(value?.sortName||"").trim();
 const valueFull=String([value?.firstName,value?.middleName,value?.lastName].filter(Boolean).join(" ")).trim();

 return valueId===selectedId||
  valueSlug===selectedSlug||
  valueDisplay===selectedDisplay||
  valueSort===selectedSort||
  valueFull===selectedFull;
};

export default function AuthorsIndexPage({authors,books,onSelectBook,onAddAuthor,onEditAuthor,onDeleteAuthor}){
 const [search,setSearch]=useState("");
 const [nationalityFilter,setNationalityFilter]=useState("");
 const [languageFilter,setLanguageFilter]=useState("");
 const [selectedAuthor,setSelectedAuthor]=useState(null);
 const [showAuthorFormModal,setShowAuthorFormModal]=useState(false);
 const [showDeleteModal,setShowDeleteModal]=useState(false);
 const [authorFormMode,setAuthorFormMode]=useState("add");
 const [fetchedAuthors,setFetchedAuthors]=useState([]);
 const [fetchedBooks,setFetchedBooks]=useState([]);
 const [activeBook,setActiveBook]=useState(null);
 const [isDeleting,setIsDeleting]=useState(false);

 const incomingAuthors=useMemo(()=>normalizeAuthors(authors),[authors]);
 const incomingBooks=useMemo(()=>normalizeBooks(books),[books]);

 useEffect(()=>{
  if(incomingAuthors.length)setFetchedAuthors(incomingAuthors);
 },[incomingAuthors]);

 useEffect(()=>{
  if(incomingBooks.length)setFetchedBooks(incomingBooks);
 },[incomingBooks]);

 useEffect(()=>{
  if(incomingAuthors.length||incomingBooks.length)return;

  let active=true;

  (async()=>{
   try{
    const authorsRes=await fetch("/api/authors");
    const authorsData=await authorsRes.json();

    if(!active)return;

    setFetchedAuthors(authorsRes.ok?normalizeAuthors(authorsData):[]);

    try{
     const booksRes=await fetch("/api/books");
     const booksData=await booksRes.json();

     if(!active)return;

     setFetchedBooks(booksRes.ok?normalizeBooks(booksData):[]);
    }catch{
     if(!active)return;
     setFetchedBooks([]);
    }
   }catch{
    if(!active)return;
    setFetchedAuthors([]);
    setFetchedBooks([]);
   }
  })();

  return()=>{active=false;};
 },[incomingAuthors.length,incomingBooks.length]);

 const authorsList=useMemo(()=>{
  return incomingAuthors.length?incomingAuthors:fetchedAuthors;
 },[incomingAuthors,fetchedAuthors]);

 const booksList=useMemo(()=>{
  return incomingBooks.length?incomingBooks:fetchedBooks;
 },[incomingBooks,fetchedBooks]);

 const nationalityOptions=useMemo(()=>{
  return [...new Set(authorsList.map(author=>author?.nationality).filter(Boolean))].sort((a,b)=>a.localeCompare(b));
 },[authorsList]);

 const languageOptions=useMemo(()=>{
  return [...new Set(authorsList.flatMap(author=>Array.isArray(author?.languages)?author.languages:[]).filter(Boolean))].sort((a,b)=>a.localeCompare(b));
 },[authorsList]);

 const filteredAuthors=useMemo(()=>{
  const q=search.trim().toLowerCase();
  return authorsList.filter(author=>{
   const haystack=[
    author?.displayName,
    author?.sortName,
    author?.firstName,
    author?.middleName,
    author?.lastName,
    author?.nationality,
    (Array.isArray(author?.languages)?author.languages:[]).join(" "),
    (Array.isArray(author?.roles)?author.roles:[]).join(" "),
    author?.bio,
    author?.slug
   ].filter(Boolean).join(" ").toLowerCase();

   if(q&&!haystack.includes(q))return false;
   if(nationalityFilter&&author?.nationality!==nationalityFilter)return false;
   if(languageFilter&&!(Array.isArray(author?.languages)?author.languages:[]).includes(languageFilter))return false;
   return true;
  }).sort((a,b)=>authorDisplay(a).localeCompare(authorDisplay(b),undefined,{sensitivity:"base"}));
 },[authorsList,search,nationalityFilter,languageFilter]);

 useEffect(()=>{
  if(!filteredAuthors.length){
   setSelectedAuthor(null);
   return;
  }
  if(!selectedAuthor){
   setSelectedAuthor(filteredAuthors[0]);
   return;
  }
  const exists=filteredAuthors.find(author=>author?._id===selectedAuthor?._id);
  if(!exists)setSelectedAuthor(filteredAuthors[0]);
 },[filteredAuthors,selectedAuthor]);

 const associatedBooks=useMemo(()=>{
  if(!selectedAuthor)return [];
  return booksList.filter(book=>{
   if(Array.isArray(book?.authors)&&book.authors.some(author=>matchesAuthorValue(author,selectedAuthor)))return true;
   if(matchesAuthorValue(book?.author,selectedAuthor))return true;
   if(matchesAuthorValue(book?.primaryAuthor,selectedAuthor))return true;
   if(matchesAuthorValue(book?.authorId,selectedAuthor))return true;
   if(matchesAuthorValue(book?.authorName,selectedAuthor))return true;
   if(Array.isArray(book?.authorNames)&&book.authorNames.some(name=>matchesAuthorValue(name,selectedAuthor)))return true;
   return false;
  });
 },[booksList,selectedAuthor]);

 const associatedPublishers=useMemo(()=>{
  const map=new Map();
  associatedBooks.forEach(book=>{
   const publishersList=Array.isArray(book?.publishers)?book.publishers:(book?.publisher?[book.publisher]:[]);
   publishersList.forEach(publisher=>{
    if(typeof publisher==="string"){
     if(!map.has(publisher))map.set(publisher,{_id:publisher,name:publisher,country:"",bookCount:0});
     map.get(publisher).bookCount+=1;
     return;
    }
    const id=publisher?._id||publisher?.name||publisher?.slug||publisher?.website||`${book?._id}-publisher`;
    const name=publisher?.name||"";
    if(!name)return;
    if(!map.has(id))map.set(id,{
     _id:id,
     name,
     website:publisher?.website||"",
     country:publisher?.country?.name||publisher?.country||"",
     bookCount:0
    });
    map.get(id).bookCount+=1;
   });
  });
  return [...map.values()].sort((a,b)=>(a.name||"").localeCompare(b.name||""));
 },[associatedBooks]);

 const clearSearch=()=>setSearch("");
 const clearNationality=()=>setNationalityFilter("");
 const clearLanguage=()=>setLanguageFilter("");
 const clearAll=()=>{
  setSearch("");
  setNationalityFilter("");
  setLanguageFilter("");
 };

 const openAddAuthorModal=()=>{
  setAuthorFormMode("add");
  setShowAuthorFormModal(true);
 };

 const openEditAuthorModal=()=>{
  if(!selectedAuthor?._id)return;
  setAuthorFormMode("edit");
  setShowAuthorFormModal(true);
 };

 const closeAuthorFormModal=()=>{
  setShowAuthorFormModal(false);
 };

 const openDeleteModal=()=>{
  if(!selectedAuthor?._id)return;
  setShowDeleteModal(true);
 };

 const closeDeleteModal=()=>{
  if(isDeleting)return;
  setShowDeleteModal(false);
 };

 const confirmDeleteAuthor=async()=>{
  if(!selectedAuthor?._id||isDeleting)return;

  try{
   setIsDeleting(true);

   if(typeof onDeleteAuthor==="function"){
    await onDeleteAuthor(selectedAuthor._id);
   }else{
    const res=await fetch(`/api/authors/${selectedAuthor._id}`,{method:"DELETE"});
    const data=await res.json().catch(()=>null);
    if(!res.ok)throw new Error(data?.message||"Failed to delete author");
   }

   setFetchedAuthors(prev=>prev.filter(item=>item?._id!==selectedAuthor._id));
   setShowDeleteModal(false);
   setSelectedAuthor(prev=>{
    if(prev?._id!==selectedAuthor._id)return prev;
    const remaining=authorsList.filter(item=>item?._id!==selectedAuthor._id);
    return remaining[0]||null;
   });
  }catch(error){
   window.alert(error?.message||"Failed to delete author");
  }finally{
   setIsDeleting(false);
  }
 };

 const handleAuthorFormSaved=author=>{
  setShowAuthorFormModal(false);
  if(author){
   setFetchedAuthors(prev=>{
    const exists=prev.find(item=>item?._id===author?._id);
    if(authorFormMode==="edit"){
     return exists?prev.map(item=>item?._id===author?._id ? author : item):prev;
    }
    return exists?prev:[author,...prev];
   });
   setSelectedAuthor(author);
  }
  if(authorFormMode==="edit"){
   if(onEditAuthor)onEditAuthor(author||selectedAuthor);
   return;
  }
  if(onAddAuthor)onAddAuthor(author);
 };

 return(
  <div className="authors-index-page">
   <div className="authors-index-toolbar">
    <div className="authors-index-heading">
     <h1>Authors</h1>
     <div className="authors-index-subtitle">Browse authors, books, and associated publishers</div>
    </div>
    <div className="d-flex gap-2">
     <Button onClick={openAddAuthorModal}><FaPlus className="me-2"/>Add Author</Button>
     <Button variant="outline-primary" onClick={openEditAuthorModal} disabled={!selectedAuthor}><FaEdit className="me-2"/>Edit Author</Button>
     <Button variant="outline-danger" onClick={openDeleteModal} disabled={!selectedAuthor}><FaTrash className="me-2"/>Delete Author</Button>
    </div>
   </div>

   <div className="authors-index-filters">
    <div className="authors-index-filter authors-index-search">
     <label>Search Authors</label>
     <InputGroup>
      <InputGroup.Text><FaSearch/></InputGroup.Text>
      <Form.Control value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search author, nationality, language..." />
      <Button variant="outline-secondary" onClick={clearSearch} disabled={!search}>Clear</Button>
     </InputGroup>
    </div>

    <div className="authors-index-filter">
     <label>Nationality</label>
     <div className="authors-index-filter-row">
      <Form.Select value={nationalityFilter} onChange={e=>setNationalityFilter(e.target.value)}>
       <option value="">All Nationalities</option>
       {nationalityOptions.map(item=><option key={item} value={item}>{item}</option>)}
      </Form.Select>
      <Button variant="outline-secondary" onClick={clearNationality} disabled={!nationalityFilter}>Clear</Button>
     </div>
    </div>

    <div className="authors-index-filter">
     <label>Language</label>
     <div className="authors-index-filter-row">
      <Form.Select value={languageFilter} onChange={e=>setLanguageFilter(e.target.value)}>
       <option value="">All Languages</option>
       {languageOptions.map(item=><option key={item} value={item}>{item}</option>)}
      </Form.Select>
      <Button variant="outline-secondary" onClick={clearLanguage} disabled={!languageFilter}>Clear</Button>
     </div>
    </div>

    <div className="authors-index-filter authors-index-clear-all">
     <label>&nbsp;</label>
     <Button className="authors-index-clear-btn" onClick={clearAll}>Clear All Filters</Button>
    </div>
   </div>

   <div className="authors-index-layout">
    <div className="authors-index-left">
     <div className="authors-index-panel-title">Authors</div>
     <div className="authors-index-author-list">
      {!filteredAuthors.length&&<div className="authors-index-empty">No authors found.</div>}
      {filteredAuthors.map(author=>{
       const isActive=selectedAuthor?._id===author?._id;
       return(
        <button key={author?._id||author?.slug} type="button" className={`authors-index-author-item${isActive?" is-active":""}`} onClick={()=>setSelectedAuthor(author)}>
         <div className="authors-index-author-name">{authorDisplay(author)||"—"}</div>
        </button>
       );
      })}
     </div>
    </div>

    <div className="authors-index-center">
     <div className="authors-index-panel-title">
      {selectedAuthor?(authorDisplay(selectedAuthor)||"Books"):"Books"}
     </div>

     {selectedAuthor&&(
     <div className="authors-index-author-card">
       <div className="authors-index-author-card-image">
        {resolveAuthorImageSrc(selectedAuthor.image||selectedAuthor.images||selectedAuthor.photo||selectedAuthor.avatar)?<img src={resolveAuthorImageSrc(selectedAuthor.image||selectedAuthor.images||selectedAuthor.photo||selectedAuthor.avatar)} alt={selectedAuthor.image?.alt||selectedAuthor.displayName||authorDisplay(selectedAuthor)} />:<div className="authors-index-author-card-placeholder">No Image</div>}
       </div>
       <div className="authors-index-author-card-details">
        <div><span className="label">Name:</span> {authorDisplay(selectedAuthor)||"—"}</div>
        <div><span className="label">Sort Name:</span> {selectedAuthor.sortName||"—"}</div>
        <div><span className="label">Slug:</span> {selectedAuthor.slug||"—"}</div>
        <div><span className="label">Nationality:</span> {selectedAuthor.nationality||"—"}</div>
        <div><span className="label">Languages:</span> {selectedAuthor.languages?.join(", ")||"—"}</div>
        <div><span className="label">Roles:</span> {selectedAuthor.roles?.join(", ")||"—"}</div>
        <div><span className="label">Born:</span> {year(selectedAuthor.birthDate)||"—"}</div>
       <div><span className="label">Died:</span> {year(selectedAuthor.deathDate)||"—"}</div>
        <div><span className="label">Books:</span> {associatedBooks.length}</div>
       </div>
       <div className="authors-index-author-bio">
        <div className="authors-index-author-bio-title">Bio</div>
        <AuthorBio author={selectedAuthor}/>
       </div>
      </div>
     )}

     <div className="authors-index-books-wrap">
      <Table responsive hover className="authors-index-books-table">
       <thead>
        <tr>
         <th>Cover</th>
         <th>Barcode</th>
         <th>Title</th>
         <th>Series</th>
         <th>Publisher</th>
         <th>Year</th>
         <th>Format</th>
        </tr>
       </thead>
       <tbody>
        {!associatedBooks.length&&(
         <tr>
          <td colSpan="7" className="authors-index-empty">No books associated with this author.</td>
         </tr>
        )}
        {associatedBooks.map(book=>{
         const image=resolveImageSrc(book?.images||book?.image||book?.coverImage||book?.cover||book?.imageLinks);
         const publishersList=Array.isArray(book?.publishers)?book.publishers:(book?.publisher?[book.publisher]:[]);
         const formatsList=Array.isArray(book?.formats)?book.formats:(book?.format?[book.format]:[]);
         return(
          <tr key={book?._id} onClick={()=>{setActiveBook(book);onSelectBook&&onSelectBook(book);}}>
           <td>
            <div className="authors-index-book-cover">
             {image?<img src={image} alt={book?.title}/>:<div className="authors-index-book-cover-placeholder">No Image</div>}
            </div>
           </td>
           <td className="authors-index-barcode"><BookBarcode book={book} height={28} width={0.9} displayValue /></td>
           <td>{book?.title||"—"}{book?.subtitle?`: ${book.subtitle}`:""}</td>
           <td>{book?.series?.name||book?.seriesTitle||"—"}{book?.seriesNumber?` #${book.seriesNumber}`:""}</td>
           <td>{joinNames(publishersList,"name")||"—"}</td>
           <td>{year(book?.publication?.publishedDate||book?.publishedDate||book?.year||book?.publicationYear)||"—"}</td>
           <td>{formatNames(formatsList)||"—"}</td>
          </tr>
         );
        })}
       </tbody>
      </Table>
     </div>
    </div>

    <div className="authors-index-right">
     <div className="authors-index-panel-title">Publishers</div>
     <div className="authors-index-publisher-list">
      {!associatedPublishers.length&&<div className="authors-index-empty">No publishers found.</div>}
      {associatedPublishers.map(publisher=>(
       <div key={publisher._id} className="authors-index-publisher-item">
        <div className="authors-index-publisher-name">{publisher.name||"—"}</div>
        <div className="authors-index-publisher-meta">
         {publisher.country||"—"} • {publisher.bookCount} {publisher.bookCount===1?"book":"books"}
        </div>
       </div>
      ))}
     </div>
    </div>
   </div>

   <Modal show={showAuthorFormModal} onHide={closeAuthorFormModal} size="xl" centered backdrop="static">
    <Modal.Header closeButton>
     <Modal.Title>{authorFormMode==="edit"?"Edit Author":"Add Author"}</Modal.Title>
    </Modal.Header>
    <Modal.Body>
     <AuthorForm
      mode={authorFormMode}
      authorId={authorFormMode==="edit"?selectedAuthor?._id:""}
      initialData={authorFormMode==="edit"?selectedAuthor:null}
      onSaved={handleAuthorFormSaved}
      onCancel={closeAuthorFormModal}
     />
    </Modal.Body>
   </Modal>

   <Modal show={showDeleteModal} onHide={closeDeleteModal} centered>
    <Modal.Header closeButton>
     <Modal.Title>Delete Author</Modal.Title>
    </Modal.Header>
    <Modal.Body>
     <div className="authors-index-delete">
      <div className="authors-index-delete-image">
       {resolveAuthorImageSrc(selectedAuthor?.image||selectedAuthor?.images||selectedAuthor?.photo||selectedAuthor?.avatar)?<img src={resolveAuthorImageSrc(selectedAuthor?.image||selectedAuthor?.images||selectedAuthor?.photo||selectedAuthor?.avatar)} alt={selectedAuthor?.image?.alt||selectedAuthor?.displayName||authorDisplay(selectedAuthor)} className="authors-index-delete-image-tag" />:<div className="authors-index-delete-placeholder">No Image</div>}
      </div>
      <div className="authors-index-delete-content">
       <div className="authors-index-delete-name">{selectedAuthor?.displayName||selectedAuthor?.sortName||"Selected author"}</div>
       <div>Are you sure you want to delete this author?</div>
       <div className="authors-index-delete-note">This action cannot be undone.</div>
      </div>
     </div>
    </Modal.Body>
    <Modal.Footer>
      <Button variant="secondary" onClick={closeDeleteModal} disabled={isDeleting}>Cancel</Button>
      <Button variant="danger" onClick={confirmDeleteAuthor} disabled={isDeleting}><FaTrash className="me-2"/>{isDeleting?"Deleting...":"Delete"}</Button>
   </Modal.Footer>
  </Modal>

  <Modal show={!!activeBook} onHide={()=>setActiveBook(null)} centered size="lg">
   <Modal.Header closeButton>
    <Modal.Title>{activeBook?.title}</Modal.Title>
   </Modal.Header>

   <Modal.Body>
    {activeBook&&(
     <div className="authors-index-book-modal-content">
      <div className="authors-index-book-modal-details">
       <div><strong>Barcode:</strong><div className="mt-2"><BookBarcode book={activeBook} height={52} width={1.2} displayValue /></div></div>
       <div><strong>Author:</strong> {joinNames(activeBook.authors,"displayName")||"—"}</div>
       <div><strong>Publisher:</strong> {joinNames(activeBook.publishers,"name")||"—"}</div>
       <div><strong>Series:</strong> {activeBook?.series?.name||activeBook?.seriesTitle||"—"}{activeBook?.seriesNumber?` #${activeBook.seriesNumber}`:""}</div>
       <div><strong>Format:</strong> {formatNames(Array.isArray(activeBook?.formats)?activeBook.formats:(activeBook?.format?[activeBook.format]:[]))||"—"}</div>
       <div><strong>Year:</strong> {year(activeBook?.publication?.publishedDate||activeBook?.publishedDate||activeBook?.year||activeBook?.publicationYear)||"—"}</div>
      </div>
      <div className="authors-index-book-modal-cover">
       {resolveImageSrc(activeBook?.images||activeBook?.image||activeBook?.coverImage||activeBook?.cover||activeBook?.imageLinks)?(
        <img src={resolveImageSrc(activeBook?.images||activeBook?.image||activeBook?.coverImage||activeBook?.cover||activeBook?.imageLinks)} alt={activeBook.title}/>
       ):(
        <div className="authors-index-book-modal-cover-placeholder">No Image</div>
       )}
      </div>
     </div>
    )}
   </Modal.Body>
  </Modal>
  </div>
 );
}
