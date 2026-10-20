from pathlib import Path
Path('src/pages/gardens/GardenBedPlanner.jsx').write_text('''import {useMemo,useState} from "react";
import {Alert,Button,Card,Col,Form,Row} from "react-bootstrap";
import {Eraser,Grid2X2,Save,Sprout} from "lucide-react";
import {normalizeBedLayout,placeBedItem,resizeBedLayout} from "../../utils/growing/bedLayout.js";
import "./bedPlanner.css";

const dragType="application/x-garden-bed-item";
const getId=value=>typeof value==="string"?value:value?._id||value?.id||"";

export default function GardenBedPlanner({sections,seeds,plants,onSaved}){
 const [selectedId,setSelectedId]=useState("");
 const section=sections.find(item=>getId(item)===selectedId)||sections[0];
 return <Card className="bed-planner"><Card.Body>
  <div className="bed-planner-heading"><Grid2X2 size={24} aria-hidden="true"/><div><h2>Bed Planner</h2><p>Choose a garden section and arrange its crops.</p></div></div>
  {!section?<p>Add a garden section above to start planning a bed.</p>:<>
   <Form.Group controlId="bed-planner-section" className="mb-3"><Form.Label>Bed / section</Form.Label><Form.Select value={getId(section)} onChange={event=>setSelectedId(event.target.value)}>{sections.map(item=><option key={getId(item)} value={getId(item)}>{item.name}</option>)}</Form.Select></Form.Group>
   <BedPlanEditor key={getId(section)} section={section} seeds={seeds} plants={plants} onSaved={onSaved}/>
  </>}
 </Card.Body></Card>;
}

function BedPlanEditor({section,seeds,plants,onSaved}){
 const [layout,setLayout]=useState(()=>normalizeBedLayout(section.bedLayout));
 const [selected,setSelected]=useState(null);
 const [moving,setMoving]=useState(null);
 const [erasing,setErasing]=useState(false);
 const [search,setSearch]=useState("");
 const [customName,setCustomName]=useState("");
 const [saving,setSaving]=useState(false);
 const [dirty,setDirty]=useState(false);
 const [error,setError]=useState("");
 const [notice,setNotice]=useState("");
 const catalog=useMemo(()=>[
  ...plants.map(item=>({label:item.name||item.plantName||"Unnamed plant",sourceType:"plant",sourceId:getId(item)})),
  ...seeds.map(item=>({label:item.plantName||item.name||"Unnamed seed",sourceType:"seed",sourceId:getId(item)}))
 ].filter(item=>item.label.toLowerCase().includes(search.toLowerCase())).sort((a,b)=>a.label.localeCompare(b.label)),[plants,seeds,search]);
 const update=next=>{setLayout(next);setDirty(true);setNotice("");setError("");};
 const choose=item=>{setSelected(item);setMoving(null);setErasing(false);setError("");};
 const beginDrag=(event,item,from=null)=>{event.dataTransfer.setData(dragType,JSON.stringify({item,from}));event.dataTransfer.effectAllowed=from?"move":"copy";};
 const place=(item,row,column,from=null)=>{
  try{update(placeBedItem(layout,item,row,column,from));setMoving(null);}catch(error){setError(error.message);}
 };
 const clickCell=(row,column,cell)=>{
  if(erasing){update({...layout,cells:layout.cells.filter(item=>item.row!==row||item.column!==column)});return;}
  if(cell){setSelected(cell);setMoving({row,column});return;}
  if(selected)place(selected,row,column,moving);
  else setNotice("Choose a crop from the list, then choose an empty cell.");
 };
 const drop=(event,row,column)=>{
  event.preventDefault();
  try{const data=JSON.parse(event.dataTransfer.getData(dragType));place(data.item,row,column,data.from);}catch{setError("Drag a crop from this planner into an empty cell.");}
 };
 const resize=(rows,columns)=>{try{update(resizeBedLayout(layout,rows,columns));setMoving(null);}catch(error){setError(error.message);}};
 const save=async()=>{
  setSaving(true);setError("");setNotice("");
  try{
   const cellSize=Number(layout.cellSize);
   if(!Number.isFinite(cellSize)||cellSize<=0)throw new Error("Enter a positive cell size.");
   const response=await fetch(`/api/garden-sections/${getId(section)}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({bedLayout:{...layout,cellSize}})});
   const data=await response.json();
   if(!response.ok)throw new Error(data.message||"Unable to save bed plan");
   setLayout(normalizeBedLayout(data.bedLayout));setDirty(false);setNotice("Bed plan saved.");onSaved(data);
  }catch(error){setError(error.message);}finally{setSaving(false);}
 };
 return <>
  <fieldset disabled={saving}>
   <Row className="g-3 mb-3">
    <Col md={3}><Form.Group controlId="bed-rows"><Form.Label>Rows</Form.Label><Form.Select value={layout.rows} onChange={event=>resize(Number(event.target.value),layout.columns)}>{Array.from({length:20},(_,index)=><option key={index+1}>{index+1}</option>)}</Form.Select></Form.Group></Col>
    <Col md={3}><Form.Group controlId="bed-columns"><Form.Label>Columns</Form.Label><Form.Select value={layout.columns} onChange={event=>resize(layout.rows,Number(event.target.value))}>{Array.from({length:20},(_,index)=><option key={index+1}>{index+1}</option>)}</Form.Select></Form.Group></Col>
    <Col md={3}><Form.Group controlId="bed-cell-size"><Form.Label>Cell size</Form.Label><Form.Control type="number" min=".01" max="1000" step="any" value={layout.cellSize} onChange={event=>update({...layout,cellSize:event.target.value})}/></Form.Group></Col>
    <Col md={3}><Form.Group controlId="bed-cell-unit"><Form.Label>Unit</Form.Label><Form.Select value={layout.unit} onChange={event=>update({...layout,unit:event.target.value})}>{["ft","in","m","cm"].map(unit=><option key={unit}>{unit}</option>)}</Form.Select></Form.Group></Col>
   </Row>
   <p>Drag crops onto empty squares, or select a crop and click a square. Select a placed crop and then an empty square to move it.</p>
   <div className="bed-planner-workspace">
    <aside className="bed-crop-palette" aria-label="Crops to place">
     <Form.Group controlId="bed-crop-search"><Form.Label>Find crop</Form.Label><Form.Control type="search" value={search} onChange={event=>setSearch(event.target.value)}/></Form.Group>
     <div className="bed-crop-list">{catalog.map(item=><Button type="button" key={`${item.sourceType}-${item.sourceId}`} variant={selected?.sourceId===item.sourceId&&selected?.sourceType===item.sourceType?"primary":"outline-primary"} draggable onDragStart={event=>beginDrag(event,item)} onClick={()=>choose(item)}><Sprout size={14} aria-hidden="true"/>{item.label}<small>{item.sourceType}</small></Button>)}{!catalog.length&&<p>No matching crops. Add a crop name below.</p>}</div>
     <Form.Group controlId="bed-custom-crop"><Form.Label>Other crop</Form.Label><Form.Control value={customName} onChange={event=>setCustomName(event.target.value)} placeholder="Plant name"/></Form.Group>
     <Button type="button" variant="outline-primary" disabled={!customName.trim()} draggable={!!customName.trim()} onDragStart={event=>beginDrag(event,{label:customName,sourceType:"custom",sourceId:""})} onClick={()=>choose({label:customName,sourceType:"custom",sourceId:""})}>Use this crop</Button>
     <Button type="button" variant={erasing?"primary":"outline-secondary"} aria-pressed={erasing} onClick={()=>{setErasing(!erasing);setSelected(null);setMoving(null);}}><Eraser size={16} aria-hidden="true"/> Remove plants</Button>
    </aside>
    <div className="bed-grid-scroll"><table className="bed-layout-grid"><caption>{section.name}: {layout.columns} × {layout.rows} cells, each {layout.cellSize||"—"} {layout.unit} square</caption><tbody>{Array.from({length:layout.rows},(_,row)=><tr key={row}>{Array.from({length:layout.columns},(_,column)=>{
     const cell=layout.cells.find(item=>item.row===row&&item.column===column);
     return <td key={column} onDragOver={event=>{if(event.dataTransfer.types.includes(dragType))event.preventDefault();}} onDrop={event=>!saving&&drop(event,row,column)}><button type="button" className={`bed-layout-cell${cell?" is-planted":""}${moving?.row===row&&moving?.column===column?" is-selected":""}`} draggable={!!cell&&!saving} onDragStart={event=>cell&&beginDrag(event,cell,{row,column})} onClick={()=>clickCell(row,column,cell)} aria-label={`Row ${row+1}, column ${column+1}: ${cell?.label||"empty"}`}>{cell?<><Sprout size={18} aria-hidden="true"/><span>{cell.label}</span></>:<span aria-hidden="true">+</span>}</button></td>;
    })}</tr>)}</tbody></table></div>
   </div>
  </fieldset>
  <p role="status" className="bed-planner-status">{erasing?"Remove mode: choose a planted square.":selected?`${moving?"Moving":"Selected"}: ${selected.label}`:"Choose a crop to begin."} {dirty&&"Unsaved changes."}</p>
  {error&&<Alert variant="danger">{error}</Alert>}{notice&&<Alert variant="success">{notice}</Alert>}
  <Button type="button" onClick={save} disabled={saving||!dirty}><Save size={16} aria-hidden="true"/>{saving?"Saving...":"Save bed plan"}</Button>
 </>;
}
''',encoding='utf-8')
Path('src/pages/gardens/bedPlanner.css').write_text('''.bed-planner-heading{display:flex;align-items:center;gap:.75rem;margin-bottom:1rem;color:var(--primary)}
.bed-planner-heading h2{font-size:1.5rem;margin:0;color:var(--primary)}
.bed-planner-heading p{margin:.25rem 0 0}
.bed-planner-workspace{display:grid;grid-template-columns:minmax(13rem,18rem) minmax(0,1fr);gap:1rem;align-items:start}
.bed-crop-palette{display:grid;gap:.65rem;min-width:0}
.bed-crop-list{display:grid;gap:.35rem;max-height:20rem;overflow:auto;padding:.15rem}
.bed-crop-list .btn{justify-content:flex-start;text-align:left;cursor:grab}
.bed-crop-list small{font-size:.7rem;margin-left:auto;color:inherit}
.bed-grid-scroll{overflow:auto;max-height:42rem;border:1px solid var(--border);border-radius:var(--radius-sm)}
.bed-layout-grid{width:max-content;min-width:100%;box-shadow:none;border:0;border-spacing:.25rem;background:var(--bg-alt);margin:0}
.bed-layout-grid td{padding:0;border:0;background:transparent}
.bed-layout-grid caption{caption-side:top;background:var(--surface);padding:.5rem;color:var(--primary)}
.bed-layout-cell{display:flex;flex-direction:column;gap:.25rem;width:5.5rem;height:5.5rem;padding:.35rem;border:1px dashed var(--secondary);border-radius:var(--radius-sm);background:var(--surface);color:var(--primary);font-size:.75rem;overflow-wrap:anywhere}
.bed-layout-cell.is-planted{background:var(--primary);border-style:solid;color:var(--text-inverse);cursor:grab}
.bed-layout-cell.is-selected{outline:3px solid var(--accent);outline-offset:-3px}
.bed-planner-status{margin:.75rem 0;color:var(--primary);font-weight:600}
@media(max-width:760px){.bed-planner-workspace{grid-template-columns:1fr}.bed-crop-list{max-height:10rem;grid-template-columns:repeat(2,minmax(0,1fr))}}
''',encoding='utf-8')
p=Path('src/pages/gardens/GardenWorkspacePage.jsx');s=p.read_text(encoding='utf-8').replace('import SortedSelect from','import GardenBedPlanner from "./GardenBedPlanner.jsx";\nimport SortedSelect from')
s=s.replace('   <Card className="garden-runs-card">','   <GardenBedPlanner sections={sections} seeds={seeds} plants={plants} onSaved={updated=>setSections(previous=>previous.map(section=>getId(section)===getId(updated)?updated:section))}/>\n\n   <Card className="garden-runs-card">')
s=s.replace('<dd style={{whiteSpace:"pre-wrap"}}>','<dd className="garden-section-detail">');p.write_text(s,encoding='utf-8')
p=Path('src/pages/gardens/gardenWorkspace.css');s=p.read_text(encoding='utf-8')+'\n.garden-section-detail{white-space:pre-wrap}\n';p.write_text(s,encoding='utf-8')
