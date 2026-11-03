import DOMPurify from "dompurify";

const objectId=value=>typeof value==="string"?value:value?._id?.$oid||value?._id||value?.id||"";
const escapeHtml=value=>String(value||"").replace(/[&<>"']/g,character=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"})[character]);
const richBlocks=value=>{
 const source=String(value||"").trim();
 if(!source)return "<p></p>";
 if(/<\/?[a-z][\s\S]*>/i.test(source))return DOMPurify.sanitize(source);
 return source.split(/\r?\n/).map(line=>`<p>${escapeHtml(line)}</p>`).join("");
};

export function getOrderedZettels(structure){
 const notes=structure.zettelIds||[];
 const orderedIds=(structure.orderEntries||[]).filter(entry=>entry.recordType==="zettel").map(entry=>objectId(entry.recordId));
 const ordered=orderedIds.length?orderedIds.map(id=>notes.find(note=>objectId(note)===id)).filter(Boolean):notes;
 return [...ordered,...notes.filter(note=>!ordered.some(item=>objectId(item)===objectId(note)))].filter(note=>objectId(note));
}

export function createStructureDraft(structure){
 const fields={zettel:structure.zettelIds||[],source:structure.sourceIds||[],entity:structure.entityIds||[]};
 const entries=structure.orderEntries?.length?structure.orderEntries:[...fields.zettel.map(record=>({recordType:"zettel",recordId:record})),...fields.source.map(record=>({recordType:"source",recordId:record})),...fields.entity.map(record=>({recordType:"entity",recordId:record}))];
 const ordered=entries.map(entry=>{
  const record=fields[entry.recordType]?.find(item=>objectId(item)===objectId(entry.recordId));
  if(!record)return null;
  const annotation=entry.recordType==="zettel"?(structure.pathEntries||[]).find(item=>objectId(item.zettelId)===objectId(record))?.annotation:"";
  return `<li><strong>${escapeHtml(record.title||record.name||record.zettelId||record.sourceId||record.entityId||"Untitled")}</strong>${annotation?` — ${escapeHtml(annotation)}`:""}</li>`;
 }).filter(Boolean);
 const outline=String(structure.outline||"").trim();
 return `<h2>Outline</h2>${outline?richBlocks(outline):""}${ordered.length?`<ol>${ordered.join("")}</ol>`:!outline?"<p></p>":""}`;
}

export function createStructureDocument(structure,body){
 const noteLinks=getOrderedZettels(structure).map(note=>`<li><a href="/notes/${encodeURIComponent(objectId(note))}">${escapeHtml(note.title||note.zettelId||"Untitled note")}</a></li>`).join("");
 return [
  `<h2>Purpose</h2>${richBlocks(structure.purpose)}`,
  `<h2>Summary</h2>${richBlocks(structure.summary)}`,
  `<h2>Note links</h2>${noteLinks?`<ul>${noteLinks}</ul>`:"<p></p>"}`,
  /^\s*<h2[^>]*>\s*Outline\s*<\/h2>/i.test(body||"")?DOMPurify.sanitize(body):`<h2>Outline</h2>${DOMPurify.sanitize(body||"<p></p>")}`
 ].join("");
}

export function extractSavedOutline(value){
 const parsed=new DOMParser().parseFromString(DOMPurify.sanitize(value||""),"text/html");
 const heading=[...parsed.body.querySelectorAll("h2")].find(item=>item.textContent.trim().toLowerCase()==="outline");
 if(!heading)return value||"<p></p>";
 const parts=[];
 for(let item=heading.nextElementSibling;item;item=item.nextElementSibling)parts.push(item.outerHTML);
 return heading.outerHTML+(parts.join("")||"<p></p>");
}
