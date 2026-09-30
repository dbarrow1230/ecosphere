import DOMPurify from "dompurify";

const encoder=new TextEncoder();
const xml=value=>String(value||"").replace(/[&<>"']/g,character=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&apos;"})[character]);
const crcTable=Array.from({length:256},(_,index)=>{
 let value=index;
 for(let bit=0;bit<8;bit+=1)value=value&1?0xedb88320^(value>>>1):value>>>1;
 return value>>>0;
});
const crc32=bytes=>{
 let value=0xffffffff;
 for(const byte of bytes)value=crcTable[(value^byte)&255]^(value>>>8);
 return (value^0xffffffff)>>>0;
};
const join=parts=>{
 const result=new Uint8Array(parts.reduce((size,part)=>size+part.length,0));
 let offset=0;
 for(const part of parts){result.set(part,offset);offset+=part.length;}
 return result;
};

// DOCX is an Open Packaging Convention ZIP. Stored entries keep this export dependency-free.
export function zipEntries(entries){
 const localParts=[];
 const directoryParts=[];
 let offset=0;
 for(const [name,content] of entries){
  const fileName=encoder.encode(name);
  const data=encoder.encode(content);
  const checksum=crc32(data);
  const local=new Uint8Array(30);
  const l=new DataView(local.buffer);
  l.setUint32(0,0x04034b50,true);l.setUint16(4,20,true);l.setUint16(6,0x0800,true);
  l.setUint32(14,checksum,true);l.setUint32(18,data.length,true);l.setUint32(22,data.length,true);l.setUint16(26,fileName.length,true);
  localParts.push(local,fileName,data);
  const central=new Uint8Array(46);
  const c=new DataView(central.buffer);
  c.setUint32(0,0x02014b50,true);c.setUint16(4,20,true);c.setUint16(6,20,true);c.setUint16(8,0x0800,true);
  c.setUint32(16,checksum,true);c.setUint32(20,data.length,true);c.setUint32(24,data.length,true);
  c.setUint16(28,fileName.length,true);c.setUint32(42,offset,true);
  directoryParts.push(central,fileName);
  offset+=local.length+fileName.length+data.length;
 }
 const directory=join(directoryParts);
 const end=new Uint8Array(22);
 const e=new DataView(end.buffer);
 e.setUint32(0,0x06054b50,true);e.setUint16(8,entries.length,true);e.setUint16(10,entries.length,true);
 e.setUint32(12,directory.length,true);e.setUint32(16,offset,true);
 return join([...localParts,directory,end]);
}

const run=(value,marks={})=>{
 if(!value)return "";
 const properties=[marks.bold&&"<w:b/>",marks.italic&&"<w:i/>",marks.underline&&'<w:u w:val="single"/>',marks.link&&'<w:color w:val="0563C1"/>',marks.strike&&"<w:strike/>",marks.highlight&&'<w:highlight w:val="yellow"/>'].filter(Boolean).join("");
 return `<w:r>${properties?`<w:rPr>${properties}</w:rPr>`:""}<w:t xml:space="preserve">${xml(value)}</w:t></w:r>`;
};
const inline=(node,marks,relationships)=>{
 if(node.nodeType===Node.TEXT_NODE)return run(node.nodeValue,marks);
 if(node.nodeType!==Node.ELEMENT_NODE)return "";
 const tag=node.tagName.toLowerCase();
 if(tag==="br")return "<w:r><w:br/></w:r>";
 if(tag==="ul"||tag==="ol")return "";
 const next={...marks};
 if(tag==="b"||tag==="strong")next.bold=true;
 if(tag==="i"||tag==="em")next.italic=true;
 if(tag==="u")next.underline=true;
 if(tag==="s"||tag==="strike"||tag==="del")next.strike=true;
 if(tag==="mark")next.highlight=true;
 if(tag==="a"){next.underline=true;next.link=true;}
 const content=[...node.childNodes].map(child=>inline(child,next,relationships)).join("");
 if(tag!=="a"||!content)return content;
 const href=node.getAttribute("href")||"";
 let target;
 try{target=new URL(href,window.location.origin);}catch{return content;}
 if(!["http:","https:","mailto:"].includes(target.protocol))return content;
 const id=`rId${relationships.length+2}`;
 relationships.push({id,target:target.href});
 return `<w:hyperlink r:id="${id}" w:history="1">${content}</w:hyperlink>`;
};
const paragraph=(node,relationships,{style="",prefix=""}={})=>{
 const alignment=String(node.style?.textAlign||"").toLowerCase();
 const properties=[style&&`<w:pStyle w:val="${xml(style)}"/>`,["center","right","justify"].includes(alignment)&&`<w:jc w:val="${alignment}"/>`].filter(Boolean).join("");
 const content=prefix?run(prefix):"";
 return `<w:p>${properties?`<w:pPr>${properties}</w:pPr>`:""}${content}${[...node.childNodes].map(child=>inline(child,{},relationships)).join("")}</w:p>`;
};
const blocks=(parent,relationships)=>[...parent.childNodes].map(node=>{
 if(node.nodeType===Node.TEXT_NODE)return node.nodeValue.trim()?`<w:p>${run(node.nodeValue)}</w:p>`:"";
 if(node.nodeType!==Node.ELEMENT_NODE)return "";
 const tag=node.tagName.toLowerCase();
 if(tag==="ul"||tag==="ol"){
  return [...node.children].filter(child=>child.tagName.toLowerCase()==="li").map((item,index)=>
   paragraph(item,relationships,{prefix:tag==="ol"?`${index+Number(node.getAttribute("start")||1)}. `:"• "})+
   [...item.children].filter(child=>["ul","ol"].includes(child.tagName.toLowerCase())).map(child=>blocks({childNodes:[child]},relationships)).join("")
  ).join("");
 }
 const heading=/^h[1-6]$/.test(tag)?`Heading${Math.min(Number(tag[1]),3)}`:"";
 if(["p","div","blockquote","pre","h1","h2","h3","h4","h5","h6"].includes(tag))return paragraph(node,relationships,{style:heading||(tag==="blockquote"?"Quote":"")});
 return blocks(node,relationships);
}).join("");

export function createDocx(title,html){
 const safe=DOMPurify.sanitize(html||"",{USE_PROFILES:{html:true}});
 const document=new DOMParser().parseFromString(safe,"text/html");
 const relationships=[];
 const titleParagraph=`<w:p><w:pPr><w:pStyle w:val="Title"/></w:pPr>${run(title||"Untitled document")}</w:p>`;
 const content=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><w:body>${titleParagraph}${blocks(document.body,relationships)}<w:sectPr><w:pgSz w:w="12240" w:h="15840"/><w:pgMar w:top="1080" w:right="1080" w:bottom="1080" w:left="1080"/></w:sectPr></w:body></w:document>`;
 const types=`<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/></Types>`;
 const rootRels=`<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`;
 const documentRels=`<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>${relationships.map(item=>`<Relationship Id="${item.id}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink" Target="${xml(item.target)}" TargetMode="External"/>`).join("")}</Relationships>`;
 const styles=`<?xml version="1.0" encoding="UTF-8"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:rPr><w:sz w:val="22"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:rPr><w:b/><w:sz w:val="36"/></w:rPr></w:style>${[1,2,3].map((level)=>`<w:style w:type="paragraph" w:styleId="Heading${level}"><w:name w:val="heading ${level}"/><w:rPr><w:b/><w:sz w:val="${30-level*2}"/></w:rPr></w:style>`).join("")}<w:style w:type="paragraph" w:styleId="Quote"><w:name w:val="Quote"/><w:pPr><w:ind w:left="480"/></w:pPr><w:rPr><w:i/></w:rPr></w:style></w:styles>`;
 const bytes=zipEntries([
  ["[Content_Types].xml",types],
  ["_rels/.rels",rootRels],
  ["word/document.xml",content],
  ["word/styles.xml",styles],
  ["word/_rels/document.xml.rels",documentRels]
 ]);
 return new Blob([bytes],{type:"application/vnd.openxmlformats-officedocument.wordprocessingml.document"});
}
