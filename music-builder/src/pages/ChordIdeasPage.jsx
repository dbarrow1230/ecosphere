import {MusicDialog as Modal} from "../components/MusicDialog.jsx";
import {useEffect,useState} from "react";
import {Music2,Plus,Search,Pencil,Trash2,X} from "lucide-react";
import ChordDetailDialog from "../components/ChordDetailDialog.jsx";
import {useMusicOptions,useMusicRecords,csv,recordId} from "../hooks/useMusicRecords.js";
import {ConnectionChecks,Field,SelectInput,TextInput,toggleConnection} from "../components/MusicFormControls.jsx";
import {MUSIC_KEYS} from "../utils/musicTheoryOptions.js";
import "../styles/MusicPages.css";

const sources=["/api/music-instruments","/api/chord-inversions","/api/music-notes","/api/music-projects","/api/chord-ideas","/api/chord-progressions"];
const empty=()=>({title:"",chord:"",key:"",voicing:"",instrumentId:"",inversionId:"",musicNoteIds:[],projectIds:[],relatedChordIds:[],relatedProgressionIds:[],tags:""});
const toForm=item=>({...item,instrumentId:recordId(item.instrumentId),inversionId:recordId(item.inversionId),musicNoteIds:(item.musicNoteIds||[]).map(recordId),projectIds:(item.projectIds||[]).map(recordId),relatedChordIds:(item.relatedChordIds||[]).map(recordId),relatedProgressionIds:(item.relatedProgressionIds||[]).map(recordId),tags:(item.tags||[]).join(", ")});

export default function ChordIdeasPage(){
 const page=useMusicRecords("/api/chord-ideas",empty,toForm);
 const [selectedChord,setSelectedChord]=useState(null);
 const [chordKeys,setChordKeys]=useState([]);
 const options=useMusicOptions(sources);

 const set=(name,value)=>page.setForm(current=>({...current,[name]:value}));
 const connect=(name,id,checked)=>set(name,toggleConnection(page.form[name],id,checked));

 useEffect(()=>{
  const keys=page.items.map(item=>item.key).filter(Boolean);

  if(!keys.length)return;

  setChordKeys(current=>{
   return [...new Set([...current,...keys])];
  });
 },[page.items]);

 const filterByKey=key=>{
  page.setQuery(page.query===key?"":key);
 };

 const clearFilter=()=>{
  page.setQuery("");
 };

 const submit=async e=>{
  e.preventDefault();

  const savedKey=page.form.key;

  await page.save({
   ...page.form,
   instrumentId:page.form.instrumentId||null,
   inversionId:page.form.inversionId||null,
   musicNoteIds:page.form.musicNoteIds||[],
   projectIds:page.form.projectIds||[],
   relatedChordIds:page.form.relatedChordIds||[],
   relatedProgressionIds:page.form.relatedProgressionIds||[],
   tags:csv(page.form.tags)
  });

  if(savedKey){
   setChordKeys(current=>{
    return [...new Set([...current,savedKey])];
   });
  }
 };

 return(
  <section className="music-page chords-page">
   <header className="music-page-header">
    <div>
     <span>Harmony slips</span>
     <h1>Chord Ideas</h1>
     <p>Capture a chord, its sound, and every idea connected to it.</p>
    </div>

    <button onClick={page.openCreate}>
     <Plus size={18}/>
     Capture chord
    </button>
   </header>

   <div className="chord-index-bar">
    <label className="app-search-control">
     <Search size={17}/>
     <input
      value={page.query}
      onChange={e=>page.setQuery(e.target.value)}
      placeholder="Chord, key, voicing, instrument"
     />
    </label>

    <div className="chord-key-filters">
     {chordKeys.map(key=>
      <button
       type="button"
       key={key}
       className={`chord-key-filter${page.query===key?" is-active":""}`}
       onClick={()=>filterByKey(key)}
      >
       {key}
      </button>
     )}

     <button
      type="button"
      className="chord-filter-clear"
      onClick={clearFilter}
      disabled={!page.query}
     >
      <X size={14}/>
      Clear
     </button>
    </div>
   </div>

   <div className="chord-slip-grid">
    {page.items.map(item=>
     <article
      className="is-clickable"
      key={item._id}
      role="button"
      tabIndex="0"
      onClick={()=>setSelectedChord(item)}
      onKeyDown={event=>{
       if(event.key==="Enter"||event.key===" "){
        event.preventDefault();
        setSelectedChord(item);
       }
      }}
     >
      <strong>{item.chord}</strong>

      <div>
       <h2>{item.title||"Untitled chord"}</h2>
       <p>{[item.key,item.inversionId?.name].filter(Boolean).join(" · ")}</p>
       {item.voicing?<p className="chord-voicing">{item.voicing}</p>:null}
       {item.instrumentId?.name?<p className="chord-instrument">{item.instrumentId.name}</p>:null}
      </div>

      <aside>
       <button
        type="button"
        onClick={event=>{
         event.stopPropagation();
         page.openEdit(item);
        }}
       >
        <Pencil size={15}/>
       </button>

       <button
        type="button"
        onClick={event=>{
         event.stopPropagation();
         page.remove(item);
        }}
       >
        <Trash2 size={15}/>
       </button>
      </aside>
     </article>
    )}
   </div>

   {!page.loading&&!page.items.length?(
    <div className="music-empty">
     <Music2/>
     <h2>No chord ideas</h2>
     <p>Capture a chord you want to remember or reuse.</p>
    </div>
   ):null}

   <ChordDetailDialog
    chord={selectedChord}
    onClose={()=>setSelectedChord(null)}
    onEdit={item=>{
     setSelectedChord(null);
     page.openEdit(item);
    }}
   />

   <Modal
    className="music-editor-modal"
    dialogClassName="music-editor-dialog is-wide"
    show={page.showForm}
    onHide={page.close}
    backdrop="static"
    centered
    scrollable
   >
    <form onSubmit={submit}>
     <Modal.Header closeButton={!page.saving}>
      <Modal.Title>{page.editingId?"Edit chord idea":"Capture chord idea"}</Modal.Title>
     </Modal.Header>

     <Modal.Body>
      <div className="chord-form-layout">
       <section>
        <h3>Chord identity</h3>

        <Field label="Chord">
         <TextInput
          required
          value={page.form.chord}
          onChange={e=>set("chord",e.target.value)}
         />
        </Field>

        <Field label="Working title">
         <TextInput
          value={page.form.title}
          onChange={e=>set("title",e.target.value)}
         />
        </Field>

        <Field label="Key">
         <SelectInput
          value={page.form.key}
          onChange={e=>set("key",e.target.value)}
         >
          <option value="">Select key</option>
          {MUSIC_KEYS.map(key=>
           <option key={key}>{key}</option>
          )}
         </SelectInput>
        </Field>

        <Field label="Voicing">
         <TextInput
          value={page.form.voicing}
          onChange={e=>set("voicing",e.target.value)}
         />
        </Field>

        <Field label="Instrument">
         <SelectInput
          value={page.form.instrumentId}
          onChange={e=>set("instrumentId",e.target.value)}
         >
          <option value="">Select instrument</option>
          {(options[sources[0]]||[]).map(x=>
           <option value={x._id} key={x._id}>{x.name}</option>
          )}
         </SelectInput>
        </Field>

        <Field label="Inversion">
         <SelectInput
          value={page.form.inversionId}
          onChange={e=>set("inversionId",e.target.value)}
         >
          <option value="">Select inversion</option>
          {(options[sources[1]]||[]).map(x=>
           <option value={x._id} key={x._id}>{x.name}</option>
          )}
         </SelectInput>
        </Field>

        <Field label="Tags">
         <TextInput
          value={page.form.tags}
          onChange={e=>set("tags",e.target.value)}
         />
        </Field>
       </section>

       <section className="connection-ledger">
        <h3>Connections</h3>

        {[["My notes","musicNoteIds",2],["Projects","projectIds",3],["Related chords","relatedChordIds",4],["Related progressions","relatedProgressionIds",5]].map(([label,name,index])=>
         <div key={name}>
          <h4>{label}{name==="relatedChordIds"||name==="relatedProgressionIds"?" (optional)":""}</h4>

          <ConnectionChecks
           items={options[sources[index]]||[]}
           value={page.form[name]}
           excludeId={page.editingId}
           onChange={(id,checked)=>connect(name,id,checked)}
          />
         </div>
        )}
       </section>
      </div>
     </Modal.Body>

     <Modal.Footer>
      <button type="button" onClick={page.close}>
       Cancel
      </button>

      <button className="is-primary">
       Save chord
      </button>
     </Modal.Footer>
    </form>
   </Modal>
  </section>
 );
}