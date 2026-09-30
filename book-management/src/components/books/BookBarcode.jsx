import Barcode from "react-barcode";

function cleanIsbn10(value){
 return String(value||"").toUpperCase().replace(/[^0-9X]/g,"");
}

function cleanIsbn13(value){
 return String(value||"").replace(/\D/g,"");
}

function getEan13CheckDigit(value){
 const digits=String(value||"").replace(/\D/g,"").slice(0,12);
 if(digits.length!==12)return "";
 const sum=digits.split("").reduce((total,digit,index)=>total+(Number(digit)*(index%2===0?1:3)),0);
 return String((10-(sum%10))%10);
}

function isbn10ToIsbn13(value){
 const clean=cleanIsbn10(value);
 if(clean.length!==10)return "";
 const base=`978${clean.slice(0,9)}`;
 return `${base}${getEan13CheckDigit(base)}`;
}

function formatIsbn10(value){
 const clean=cleanIsbn10(value);
 if(clean.length!==10)return clean||String(value||"");
 return `${clean.slice(0,1)}-${clean.slice(1,4)}-${clean.slice(4,9)}-${clean.slice(9)}`;
}

function formatIsbn13(value){
 const clean=cleanIsbn13(value);
 if(clean.length!==13)return clean||String(value||"");
 return `${clean.slice(0,3)}-${clean.slice(3,4)}-${clean.slice(4,7)}-${clean.slice(7,12)}-${clean.slice(12)}`;
}

function formatObjectBarcode(value){
 const clean=String(value||"").toUpperCase().replace(/[^0-9A-Z]/g,"");
 if(!clean)return "";
 if(clean.length<=13)return clean.replace(/^(.{1})(.{2})(.{1})(.{1})(.{2})(.+)$/,"$1  $2-$3-$4  $5-$6");
 return `${clean.slice(0,1)}  ${clean.slice(1,3)}-${clean.slice(3,4)}-${clean.slice(4,5)}  ${clean.slice(5,7)}-${clean.slice(7)}`;
}

function getBookBarcodeSource(book,source,value){
 if(source==="isbn10"){
  const isbn=cleanIsbn10(value||book?.isbn10);
  const ean=isbn10ToIsbn13(isbn);
  return {value:ean||isbn,format:ean?"EAN13":"CODE128",text:ean||formatIsbn10(isbn),isObject:false};
 }

 if(source==="isbn13"){
  let isbn=cleanIsbn13(value||book?.isbn13);
  if(isbn.length===12)isbn=`${isbn}${getEan13CheckDigit(isbn)}`;
  return {value:isbn,format:isbn.length===13?"EAN13":"CODE128",text:isbn||formatIsbn13(isbn),isObject:false};
 }

 if(source==="eisbn"){
  let isbn=cleanIsbn13(value||book?.eisbn);
  if(isbn.length===12)isbn=`${isbn}${getEan13CheckDigit(isbn)}`;
  return {value:isbn,format:isbn.length===13?"EAN13":"CODE128",text:isbn||formatIsbn13(isbn),isObject:false};
 }

 const objectValue=String(value||book?.barcode||book?._id||"").trim();
 if(!objectValue)return {value:"",format:"CODE128",text:""};
 return {value:objectValue,format:"CODE128",text:formatObjectBarcode(objectValue)||objectValue,isObject:true};
}

export default function BookBarcode({book,value,source="object",height=44,width=1.2,displayValue=true,className=""}){
 const barcode=getBookBarcodeSource(book||{},source,value);

 if(!barcode.value)return <span className={className}>No Barcode</span>;

 return(
  <div className={className}>
   <Barcode
    value={barcode.value}
    format={barcode.format}
    width={width}
    height={height}
    margin={0}
    displayValue={displayValue}
    text={barcode.text}
    fontSize={14}
    textMargin={0}
    background="transparent"
   />
  </div>
 );
}
