export function normalizeIsbn(value){
 return String(value||"").replace(/[\s-]/g,"").toUpperCase();
}

export function validIsbn(isbn){
 if(/^\d{9}[\dX]$/.test(isbn)){
  return [...isbn].reduce((sum,char,index)=>sum+(char==="X"?10:Number(char))*(10-index),0)%11===0;
 }
 return /^97[89]\d{10}$/.test(isbn)&&[...isbn].reduce((sum,char,index)=>sum+Number(char)*(index%2?3:1),0)%10===0;
}

export function isbnPair(value){
 const isbn=normalizeIsbn(value);
 if(!validIsbn(isbn))return null;
 if(isbn.length===10){
  const base=`978${isbn.slice(0,9)}`;
  const sum=[...base].reduce((total,char,index)=>total+Number(char)*(index%2?3:1),0);
  return {isbn10:isbn,isbn13:base+(10-sum%10)%10};
 }
 if(!isbn.startsWith("978"))return {isbn10:"",isbn13:isbn};
 const base=isbn.slice(3,12);
 const check=(11-[...base].reduce((sum,char,index)=>sum+Number(char)*(10-index),0)%11)%11;
 return {isbn10:base+(check===10?"X":check),isbn13:isbn};
}

export function publicationDate(value){
 const text=String(value||"").trim();
 // Preserve partial dates in the preview instead of inventing a month/day.
 if(/^\d{4}(-\d{2})?$/.test(text))return "";
 if(!/\d{4}/.test(text))return "";
 const date=new Date(text);
 return Number.isNaN(date.getTime())?"":date.toISOString().slice(0,10);
}
