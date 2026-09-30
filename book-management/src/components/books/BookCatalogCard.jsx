// src/components/books/BookCatalogCard.jsx
import Card from "react-bootstrap/Card";
import "./BookCatalogCard.css";

const joinNames=(items,key="name")=>{
 if(!Array.isArray(items)||!items.length)return "";
 return items.map(item=>{
  if(typeof item==="string")return item;
  return item?.[key]||item?.displayName||item?.name||"";
 }).filter(Boolean).join(", ");
};

const year=v=>{
 if(!v)return "";
 const d=new Date(v);
 if(Number.isNaN(d.getTime()))return "";
 return d.getFullYear();
};

export default function BookCatalogCard({book={}}){
 const authors=joinNames(book.authors,"displayName");
 const publishers=joinNames(book.publishers,"name");
 const seriesName=book.series?.name||"";
 const pubYear=year(book.publication?.publishedDate);
 const language=book.publication?.language||"";
 const formats=Array.isArray(book.formats)?book.formats.filter(Boolean).join(", "):"";
 const subjects=Array.isArray(book.subjects)?book.subjects.filter(Boolean).join("; "):"";
 const image=Array.isArray(book.images)&&book.images.length?book.images[0]:"";

 return(
  <Card className="catalog-card">
   {image&&<div className="catalog-card-image"><img src={image} alt={book.title}/></div>}
   <Card.Body className="catalog-card-body">
    <Card.Title className="catalog-card-title">{book.title}{book.subtitle?`: ${book.subtitle}`:""}</Card.Title>
    {authors&&<div className="catalog-card-authors">{authors}</div>}
    <div className="catalog-card-meta">
     {book.edition&&<div><span className="label">Edition:</span> {book.edition}</div>}
     {publishers&&<div><span className="label">Publisher:</span> {publishers}</div>}
     {(pubYear||language)&&<div><span className="label">Publication:</span> {[pubYear,language].filter(Boolean).join(" ")}</div>}
     {seriesName&&<div><span className="label">Series:</span> {seriesName}{book.seriesNumber?` #${book.seriesNumber}`:""}</div>}
     {book.isbn13&&<div><span className="label">ISBN-13:</span> {book.isbn13}</div>}
     {book.isbn10&&<div><span className="label">ISBN-10:</span> {book.isbn10}</div>}
     {formats&&<div><span className="label">Format:</span> {formats}</div>}
     {subjects&&<div><span className="label">Subjects:</span> {subjects}</div>}
    </div>
   </Card.Body>
  </Card>
 );
}