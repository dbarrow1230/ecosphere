import DOMPurify from "dompurify";

export const richTextToPlainText=value=>{
 const source=String(value||"");
 if(!/<\/?[a-z][\s\S]*>/i.test(source))return source;
 const parsed=new DOMParser().parseFromString(DOMPurify.sanitize(source),"text/html");
 return parsed.body.textContent?.trim()||"";
};

export const richTextToTitle=value=>{
 const source=String(value||"").trim();
 if(!source)return "";

 let firstLine="";

 if(/<\/?[a-z][\s\S]*>/i.test(source)){
  const parsed=new DOMParser().parseFromString(DOMPurify.sanitize(source),"text/html");
  const firstBlock=parsed.body.querySelector("h1,h2,h3,h4,h5,h6,p,li,blockquote,div");
  firstLine=(firstBlock?.textContent||parsed.body.textContent||"").trim();
 }else{
  firstLine=source.split(/\r?\n/).find(line=>line.trim())?.trim()||"";
 }

 return firstLine.replace(/^(?:recipe\s+name|title|name)\s*:\s*/i,"").trim();
};
