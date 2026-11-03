// New dependency: @hello-pangea/dnd
import {DragDropContext,Droppable,Draggable} from "@hello-pangea/dnd";
import {MusicDialog as Modal} from "../components/MusicDialog.jsx";
import {useState} from "react";
import {NotebookPen,Plus,Pencil,Trash2,GripVertical} from "lucide-react";
import {useMusicOptions,useMusicRecords,csv,recordId} from "../hooks/useMusicRecords.js";
import {ConnectionChecks,Field,SelectInput,TextArea,TextInput,toggleConnection} from "../components/MusicFormControls.jsx";
import "../styles/MusicPages.css";

const src=["/api/music-projects","/api/chord-ideas","/api/chord-progressions","/api/lyric-ideas"];

const SECTION_TYPES=[
 "Intro",
 "Verse",
 "Pre-Chorus",
 "Chorus",
 "Post-Chorus",
 "Refrain",
 "Riff",
 "Bridge",
 "Breakdown",
 "Interlude",
 "Instrumental",
 "Solo",
 "Outro",
 "Custom"
];

const NUMBERED_SECTION_TYPES=[
 "Verse",
 "Pre-Chorus",
 "Chorus",
 "Post-Chorus",
 "Refrain",
 "Riff",
 "Bridge",
 "Breakdown",
 "Interlude",
 "Instrumental",
 "Solo"
];

const empty=()=>({
 title:"",
 content:"",
 sections:[],
 notes:"",
 projectIds:[],
 chordIdeaIds:[],
 progressionIds:[],
 relatedLyricIds:[],
 tags:""
});

const formOf=x=>({
 ...x,
 sections:Array.isArray(x.sections)&&x.sections.length
  ?x.sections.map((section,index)=>({
   _dragId:section._id||section.id||`section-${Date.now()}-${index}`,
   sectionType:section.sectionType||section.type||"Verse",
   sectionNumber:section.sectionNumber||1,
   customLabel:section.customLabel||"",
   content:section.content||""
  }))
  :x.content
   ?[{
    _dragId:`section-${Date.now()}-0`,
    sectionType:"Verse",
    sectionNumber:1,
    customLabel:"",
    content:x.content
   }]
   :[],
 projectIds:(x.projectIds||[]).map(recordId),
 chordIdeaIds:(x.chordIdeaIds||[]).map(recordId),
 progressionIds:(x.progressionIds||[]).map(recordId),
 relatedLyricIds:(x.relatedLyricIds||[]).map(recordId),
 tags:(x.tags||[]).join(", ")
});

export default function LyricIdeasPage(){
 const p=useMusicRecords("/api/lyric-ideas",empty,formOf);
 const o=useMusicOptions(src);
 const [sectionTypeToAdd,setSectionTypeToAdd]=useState("Intro");

 const set=(name,value)=>p.setForm(x=>({...x,[name]:value}));

 const link=(name,id,checked)=>{
  set(name,toggleConnection(p.form[name],id,checked));
 };

 const getNextSectionNumber=sectionType=>{
  const existing=(p.form.sections||[])
   .filter(section=>section.sectionType===sectionType)
   .map(section=>Number(section.sectionNumber)||0);

  return existing.length?Math.max(...existing)+1:1;
 };

 const addSection=()=>{
  const numbered=NUMBERED_SECTION_TYPES.includes(sectionTypeToAdd);

  set("sections",[
   ...(p.form.sections||[]),
   {
    _dragId:`section-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    sectionType:sectionTypeToAdd,
    sectionNumber:numbered?getNextSectionNumber(sectionTypeToAdd):null,
    customLabel:"",
    content:""
   }
  ]);
 };

 const updateSection=(index,name,value)=>{
  set(
   "sections",
   (p.form.sections||[]).map((section,sectionIndex)=>
    sectionIndex===index?{...section,[name]:value}:section
   )
  );
 };

 const changeSectionType=(index,nextType)=>{
  set(
   "sections",
   (p.form.sections||[]).map((section,sectionIndex)=>{
    if(sectionIndex!==index)return section;

    return{
     ...section,
     sectionType:nextType,
     sectionNumber:NUMBERED_SECTION_TYPES.includes(nextType)
      ?NUMBERED_SECTION_TYPES.includes(section.sectionType)&&section.sectionNumber
       ?section.sectionNumber
       :getNextSectionNumber(nextType)
      :null,
     customLabel:nextType==="Custom"?section.customLabel:""
    };
   })
  );
 };

 const removeSection=index=>{
  set(
   "sections",
   (p.form.sections||[]).filter((section,sectionIndex)=>sectionIndex!==index)
  );
 };

 const handleSectionDragEnd=result=>{
  if(!result.destination)return;

  const sourceIndex=result.source.index;
  const destinationIndex=result.destination.index;

  if(sourceIndex===destinationIndex)return;

  const sections=[...(p.form.sections||[])];
  const [movedSection]=sections.splice(sourceIndex,1);

  sections.splice(destinationIndex,0,movedSection);

  set("sections",sections);
 };

 const getSectionLabel=section=>{
  if(section.sectionType==="Custom"){
   return section.customLabel||"Custom Section";
  }

  if(NUMBERED_SECTION_TYPES.includes(section.sectionType)){
   return `${section.sectionType} ${section.sectionNumber||1}`;
  }

  return section.sectionType||"Section";
 };

 const buildContent=sections=>{
  return (sections||[])
   .filter(section=>section.content?.trim())
   .map(section=>`[${getSectionLabel(section)}]\n${section.content.trim()}`)
   .join("\n\n");
 };

 const submit=e=>{
  e.preventDefault();

  const sections=(p.form.sections||[])
   .map(section=>({
    sectionType:section.sectionType||"Verse",
    sectionNumber:NUMBERED_SECTION_TYPES.includes(section.sectionType)
     ?Number(section.sectionNumber)||1
     :null,
    customLabel:section.sectionType==="Custom"
     ?(section.customLabel||"").trim()
     :"",
    content:(section.content||"").trim()
   }))
   .filter(section=>section.content);

  p.save({
   ...p.form,
   sections,
   content:buildContent(sections),
   tags:csv(p.form.tags)
  });
 };

 return(
  <section className="music-page lyrics-page">
   <header className="music-page-header">
    <div>
     <span>Lyric notebook</span>
     <h1>Lyric Ideas</h1>
     <p>Write lyrics by section and connect harmony and projects as they develop.</p>
    </div>

    <button onClick={p.openCreate}>
     <Plus size={18}/>
     Write lyric
    </button>
   </header>

   <div className="lyric-notebook">
    {p.items.map(x=>
     <article key={x._id}>
      <header>
       <h2>{x.title||"Untitled lyric"}</h2>

       <div>
        <button
         type="button"
         onClick={()=>p.openEdit(x)}
        >
         <Pencil size={15}/>
        </button>

        <button
         type="button"
         onClick={()=>p.remove(x)}
        >
         <Trash2 size={15}/>
        </button>
       </div>
      </header>

      {Array.isArray(x.sections)&&x.sections.length?(
       <div className="lyric-card-sections">
        {x.sections.map((section,index)=>
         <section key={`${x._id}-${index}`} className="lyric-card-section">
          <h3>{getSectionLabel(section)}</h3>
          <p>{section.content}</p>
         </section>
        )}
       </div>
      ):(
       <blockquote>{x.content}</blockquote>
      )}

      {x.tags?.length?(
       <footer>
        {x.tags.map(t=>
         <span key={t}>{t}</span>
        )}
       </footer>
      ):null}
     </article>
    )}
   </div>

   {!p.loading&&!p.items.length?(
    <div className="music-empty">
     <NotebookPen/>
     <h2>Your lyric notebook is empty</h2>
    </div>
   ):null}

   <Modal
    className="music-editor-modal lyric-editor"
    dialogClassName="music-editor-dialog is-wide"
    show={p.showForm}
    onHide={p.close}
    centered
    scrollable
   >
    <form onSubmit={submit}>
     <Modal.Header closeButton>
      <Modal.Title>{p.editingId?"Edit lyric":"New lyric idea"}</Modal.Title>
     </Modal.Header>

     <Modal.Body>
      <div className="lyric-form-layout">
       <section>
        <Field label="Title">
         <TextInput
          value={p.form.title}
          onChange={e=>set("title",e.target.value)}
         />
        </Field>

        <div className="lyric-section-editor">
         <header className="lyric-section-editor-header">
          <div>
           <h3>Lyric Sections</h3>
           <p>Add individual sections and drag them into the order you want.</p>
          </div>
         </header>

         <div className="lyric-section-add">
          <SelectInput
           value={sectionTypeToAdd}
           onChange={e=>setSectionTypeToAdd(e.target.value)}
          >
           {SECTION_TYPES.map(type=>
            <option value={type} key={type}>{type}</option>
           )}
          </SelectInput>

          <button
           type="button"
           className="lyric-add-section"
           onClick={addSection}
          >
           <Plus size={16}/>
           Add {sectionTypeToAdd}
          </button>
         </div>

         <DragDropContext onDragEnd={handleSectionDragEnd}>
          <Droppable droppableId="lyric-sections">
           {(provided,snapshot)=>(
            <div
             ref={provided.innerRef}
             {...provided.droppableProps}
             className={`lyric-section-sortable${snapshot.isDraggingOver?" is-dragging-over":""}`}
            >
             {(p.form.sections||[]).map((section,index)=>
              <Draggable
               key={section._dragId}
               draggableId={String(section._dragId)}
               index={index}
              >
               {(provided,snapshot)=>(
                <section
                 ref={provided.innerRef}
                 {...provided.draggableProps}
                 className={`lyric-section-row${snapshot.isDragging?" is-dragging":""}`}
                 style={provided.draggableProps.style}
                >
                 <header>
                  <div className="lyric-section-row-heading">
                   <span className="lyric-section-position">{index+1}</span>

                   <button
                    type="button"
                    className="lyric-drag-handle"
                    {...provided.dragHandleProps}
                    title={`Drag ${getSectionLabel(section)} to reorder`}
                    aria-label={`Drag ${getSectionLabel(section)} to reorder`}
                   >
                    <GripVertical size={20}/>
                   </button>

                   <strong>{getSectionLabel(section)}</strong>
                  </div>

                  <button
                   type="button"
                   className="lyric-remove-section"
                   onClick={()=>removeSection(index)}
                  >
                   <Trash2 size={15}/>
                  </button>
                 </header>

                 <Field label="Section">
                  <SelectInput
                   value={section.sectionType}
                   onChange={e=>changeSectionType(index,e.target.value)}
                  >
                   {SECTION_TYPES.map(type=>
                    <option value={type} key={type}>{type}</option>
                   )}
                  </SelectInput>
                 </Field>

                 {NUMBERED_SECTION_TYPES.includes(section.sectionType)?(
                  <Field label="Number">
                   <TextInput
                    type="number"
                    min="1"
                    value={section.sectionNumber||1}
                    onChange={e=>updateSection(index,"sectionNumber",e.target.value)}
                   />
                  </Field>
                 ):null}

                 {section.sectionType==="Custom"?(
                  <Field label="Section name">
                   <TextInput
                    value={section.customLabel}
                    onChange={e=>updateSection(index,"customLabel",e.target.value)}
                    placeholder="Section name"
                   />
                  </Field>
                 ):null}

                 <Field label="Lyrics" wide>
                  <TextArea
                   required
                   rows="7"
                   value={section.content}
                   onChange={e=>updateSection(index,"content",e.target.value)}
                  />
                 </Field>
                </section>
               )}
              </Draggable>
             )}

             {provided.placeholder}
            </div>
           )}
          </Droppable>
         </DragDropContext>

         {!p.form.sections?.length?(
          <div className="lyric-section-empty">
           <NotebookPen size={28}/>
           <p>No lyric sections yet.</p>
          </div>
         ):null}
        </div>

        <Field label="Private notes" wide>
         <TextArea
          rows="4"
          value={p.form.notes}
          onChange={e=>set("notes",e.target.value)}
         />
        </Field>

        <Field label="Tags">
         <TextInput
          value={p.form.tags}
          onChange={e=>set("tags",e.target.value)}
         />
        </Field>
       </section>

       <aside className="connection-ledger">
        <h3>Connect this lyric</h3>

        {[["Projects","projectIds",0],["Chord ideas","chordIdeaIds",1],["Progressions","progressionIds",2],["Related lyrics","relatedLyricIds",3]].map(([label,name,index])=>
         <div key={name}>
          <h4>{label}</h4>

          <ConnectionChecks
           items={o[src[index]]||[]}
           value={p.form[name]}
           excludeId={p.editingId}
           onChange={(id,checked)=>link(name,id,checked)}
          />
         </div>
        )}
       </aside>
      </div>
     </Modal.Body>

     <Modal.Footer>
      <button
       type="button"
       onClick={p.close}
      >
       Cancel
      </button>

      <button className="is-primary">
       Save lyric
      </button>
     </Modal.Footer>
    </form>
   </Modal>
  </section>
 );
}