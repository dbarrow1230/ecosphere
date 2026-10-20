import {useMemo,useState} from "react";
import {Alert,Button,Card,Col,Form,Row} from "react-bootstrap";
import {Eraser,Grid2X2,Save,Sprout} from "lucide-react";
import {normalizeBedLayout,placeBedItem,resizeBedLayout} from "../../utils/growing/bedLayout.js";
import "./bedPlanner.css";

const dragType="application/x-garden-bed-item";
const getId=value=>typeof value==="string"?value:value?._id||value?.id||"";

export default function GardenBedPlanner({sections,seeds,plants,onSaved}){
 const [selectedId,setSelectedId]=useState("");
 const [hasChanges,setHasChanges]=useState(false);
 const section=sections.find(item=>getId(item)===selectedId)||sections[0];
 return <Card className="bed-planner"><Card.Body>
  <div className="bed-planner-heading"><Grid2X2 size={24} aria-hidden="true"/><div><h2>Bed Planner</h2><p>Choose a garden section and arrange its crops.</p></div></div>
  {!section?<p>Add a garden section above to start planning a bed.</p>:<>
   <Form.Group controlId="bed-planner-section" className="mb-3"><Form.Label>Bed / section</Form.Label><Form.Select value={getId(section)} onChange={event=>{if(hasChanges&&!window.confirm("Discard unsaved bed plan changes and switch beds?"))return;setHasChanges(false);setSelectedId(event.target.value);}}>{sections.map(item=><option key={getId(item)} value={getId(item)}>{item.name}</option>)}</Form.Select></Form.Group>
   <BedPlanEditor key={getId(section)} section={section} seeds={seeds} plants={plants} onSaved={onSaved} onDirtyChange={setHasChanges}/>
  </>}
 </Card.Body></Card>;
}

function BedPlanEditor({section,seeds,plants,onSaved,onDirtyChange}){
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
 const update=next=>{setLayout(next);setDirty(true);onDirtyChange(true);setNotice("");setError("");};
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
   setLayout(normalizeBedLayout(data.bedLayout));setDirty(false);onDirtyChange(false);setNotice("Bed plan saved.");onSaved(data);
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
