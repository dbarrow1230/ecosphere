export function normalizeIsbn(value){
 return String(value||"").replace(/[\s-]/g,"").toUpperCase();
}

export function validIsbn(isbn){
 if(/^\d{9}[\dX]$/.test(isbn)){
  return [...isbn].reduce((sum,char,index)=>sum+(char==="X"?10:Number(char))*(10-index),0)%11===0;
 }
 return /^97[89]\d{10}$/.test(isbn)&&[...isbn].reduce((sum,char,index)=>sum+Number(char)*(index%2?3:1),0)%10===0;
}

export async function lookupIsbn(req,res){
 const isbn=normalizeIsbn(req.query.isbn);
 if(!validIsbn(isbn))return res.status(400).json({message:"Enter a valid ISBN-10 or ISBN-13 (spaces and hyphens are allowed)."});
 try{
  const response=await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`,{
   signal:AbortSignal.timeout(12000),headers:{"User-Agent":"BookManagement/1.0 (ISBN lookup)",Accept:"application/json"}
  });
  if(!response.ok)throw new Error("Provider unavailable");
  const data=await response.json();
  const book=data[`ISBN:${isbn}`];
  if(!book?.title)return res.status(404).json({message:"No book found for this ISBN. You can enter its information manually."});
  return res.json({source:"Open Library",book:{
   title:book.title,subtitle:book.subtitle||"",
   authors:(book.authors||[]).map(item=>item.name).filter(Boolean),
   publishers:(book.publishers||[]).map(item=>item.name).filter(Boolean),
   publishedDate:book.publish_date||"",totalPages:book.number_of_pages||0,
   isbn10:book.identifiers?.isbn_10?.find(validIsbn)||(isbn.length===10?isbn:""),
   isbn13:book.identifiers?.isbn_13?.find(validIsbn)||(isbn.length===13?isbn:""),
   subjects:(book.subjects||[]).map(item=>item.name).filter(Boolean),
   cover:book.cover?.large||book.cover?.medium||""
  }});
 }catch{
  return res.status(502).json({message:"ISBN lookup is temporarily unavailable. Please try again."});
 }
}
