const headingNames=new Set([
 "name","sku","scientific name(s)","category","type","form","size","yield (imperial/metric)",
 "prep time","mix time","cook time","total time","introduction","description",
 "suggested price","formula focus","origins","region","ancient uses","history",
 "cultural significance","symptoms supported","herbs","carrier oil for infusion",
 "formula","equipment","instructions","texture profile","benefits","side effects",
 "contraindications","interactions","safety guidance","dosage","storage","shelf life",
 "customizations","allergens","faq","resources","regulatory notes"
]);

const parseTable=line=>{
 if(line.includes("\t"))return line.split("\t").map(cell=>cell.trim());
 if(/^\s*\|.*\|\s*$/.test(line))return line.trim().replace(/^\||\|$/g,"").split("|").map(cell=>cell.trim());
 return null;
};

const extractTables=content=>{
 const lines=content.split("\n");
 const tables=[];
 for(let index=0;index<lines.length;index++){
  const headers=parseTable(lines[index]);
  if(!headers||headers.length<2)continue;
  const rows=[];
  let next=index+1;
  while(next<lines.length){
   const cells=parseTable(lines[next]);
   if(!cells||cells.length!==headers.length)break;
   if(!cells.every(cell=>/^:?-{3,}:?$/.test(cell)))rows.push(cells);
   next++;
  }
  if(rows.length){tables.push({headers,rows});index=next-1;}
 }
 return tables;
};

export const parseProductDetails=rawText=>{
 const original=String(rawText||"");
 const lines=original.replace(/\r\n?/g,"\n").split("\n");
 const sections=[];
 let current=null;
 const finish=()=>{
  if(!current)return;
  current.content=current.content.join("\n").trim();
  current.tables=extractTables(current.content);
  if(current.title||current.content)sections.push(current);
 };

 for(let index=0;index<lines.length;index++){
  const line=lines[index];
  const trimmed=line.trim();
  const markdown=trimmed.match(/^#{1,6}\s+(.+)$/);
  const pair=trimmed.split("\t");
  const tableField=pair.length===2&&headingNames.has(pair[0].trim().toLowerCase())?pair:null;
  const labeled=trimmed.match(/^([^:\t]{2,80}):(?:\s*(.*))?$/)||(tableField?[null,tableField[0].trim(),tableField[1].trim()]:null);
  const known=labeled&&headingNames.has(labeled[1].trim().toLowerCase());
  const genericHeading=labeled&&!labeled[2]&&!lines[index-1]?.trim()&&/^[A-Z][A-Za-z]*(?: [A-Z][A-Za-z]*)*$/.test(labeled[1].trim());
  const newHeading=markdown?.[1]||(
   labeled&&trimmed!=="Q:"&&trimmed!=="A:"&&
   (known||genericHeading)
    ?labeled[1].trim():null
  )||((trimmed==="Formula"||trimmed==="Instructions")?trimmed:null);

  if(newHeading){
   finish();
   current={title:newHeading,content:[]};
   if(labeled?.[2])current.content.push(labeled[2]);
  }else{
   if(!current)current={title:"Overview",content:[]};
   current.content.push(line);
  }
 }
 finish();

 const find=title=>sections.find(section=>section.title.toLowerCase()===title.toLowerCase())?.content||"";
 const suggestedPriceText=find("Suggested Price");
 const currency=suggestedPriceText.match(/\$\s*(\d+(?:\.\d{1,2})?)(?:\s*[-–—]\s*\$?\s*(\d+(?:\.\d{1,2})?))?/);
 const plain=!currency&&suggestedPriceText.match(/^(\d+(?:\.\d{1,2})?)(?:\s*[-–—]\s*(\d+(?:\.\d{1,2})?))?/);
 const priceMatch=currency||plain;
 const suggestedPrice=priceMatch?((Number(priceMatch[1])+Number(priceMatch[2]||priceMatch[1]))/2).toFixed(2):"";
 return {
  rawText:original,sections,
  name:find("Name")||sections.find(section=>section.title==="Overview")?.content.split("\n")[0]||"",
  description:find("Description"),introduction:find("Introduction"),
  suggestedPriceText,suggestedPrice,sku:find("SKU")
 };
};

export const applyProductDetailsEdits=(rawText,edits)=>{
 const base=parseProductDetails(rawText);
 const invalid=()=>{const error=new Error("Parsed sections do not match the pasted product data");error.name="ValidationError";throw error;};
 if(!Array.isArray(edits)||edits.length!==base.sections.length)invalid();
 const sections=base.sections.map((section,index)=>{
  const edit=edits[index];
  if(edit?.title!==section.title||typeof edit.content!=="string")invalid();
  return {...section,content:edit.content,tables:extractTables(edit.content)};
 });
 const find=title=>sections.find(section=>section.title.toLowerCase()===title.toLowerCase())?.content||"";
 const suggestedPriceText=find("Suggested Price");
 const currency=suggestedPriceText.match(/\$\s*(\d+(?:\.\d{1,2})?)(?:\s*[-–—]\s*\$?\s*(\d+(?:\.\d{1,2})?))?/);
 const plain=!currency&&suggestedPriceText.match(/^(\d+(?:\.\d{1,2})?)(?:\s*[-–—]\s*(\d+(?:\.\d{1,2})?))?/);
 const match=currency||plain;
 return {
  ...base,sections,
  name:find("Name")||base.name,
  description:find("Description"),
  introduction:find("Introduction"),
  suggestedPriceText,
  suggestedPrice:match?((Number(match[1])+Number(match[2]||match[1]))/2).toFixed(2):"",
  sku:find("SKU")
 };
};
