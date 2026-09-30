import DOMPurify from "dompurify";
import "../styles/RichText.css";

const looksLikeHtml=value=>(/<\/?[a-z][\s\S]*>/i).test(value);

const decodeHtml=value=>{
 const textarea=document.createElement("textarea");
 textarea.innerHTML=value;
 return textarea.value;
};

const normalizeRichText=value=>{
 let source=typeof value==="string"?value:String(value||"");

 if(/^\s*"[\s\S]*"\s*$/.test(source)){
  try{
   const parsed=JSON.parse(source);
   if(typeof parsed==="string")source=parsed;
  }catch{
   // Keep the original value when it is not a JSON-encoded string.
  }
 }

 for(let pass=0;pass<2&&!looksLikeHtml(source)&&/&(?:lt|gt|amp|quot|#39);/i.test(source);pass+=1){
  source=decodeHtml(source);
 }

 return source;
};

function RichTextContent({value="",empty="--",className=""}){
 const source=normalizeRichText(value);

 if(!source.trim())return <div className={`rich-text-content ${className}`.trim()}>{empty}</div>;

 const html=looksLikeHtml(source)
  ?source
  :source
   .replace(/\r\n/g,"\n")
   .replace(/\r/g,"\n")
   .split("\n")
   .map(line=>line||"<br>")
   .join("<br>");

 return(
  <div
   className={`rich-text-content ${className}`.trim()}
   style={{whiteSpace:"pre-wrap"}}
   dangerouslySetInnerHTML={{__html:DOMPurify.sanitize(html)}}
  />
 );
}

export default RichTextContent;
