import useDomainIdPreview from "../../hooks/useDomainIdPreview.js";
// src/pages/forms/FleetingNoteForm.jsx

import {useEffect,useRef,useState} from "react";
import {Button,ButtonGroup,Form} from "react-bootstrap";
import RichTextEditor from "../../components/RichTextEditor.jsx";
import RelationshipSelector from "../../components/RelationshipSelector.jsx";
import DomainSelect from "../../components/DomainSelect.jsx";
import useRecordSubtypes from "../../hooks/useRecordSubtypes.js";

const getStoredUserId=()=>{
 for(const key of ["userInfo","user","authUser","currentUser"]){
  try{
   const parsed=JSON.parse(localStorage.getItem(key)||sessionStorage.getItem(key)||"null");
   const value=parsed?.user||parsed?.data||parsed;
   const id=value?._id||value?.id||value?.$oid||value?._id?.$oid||value?.id?.$oid;
   if(id)return String(id);
  }catch{
   continue;
  }
 }
 return "";
};

const getDateCode=()=>{
 const date=new Date();
 return `${date.getFullYear()}${String(date.getMonth()+1).padStart(2,"0")}${String(date.getDate()).padStart(2,"0")}`;
};

const normalizeRows=value=>{
 if(Array.isArray(value)){
  return value.length?value.map(item=>String(item||"")):[""];
 }

 const text=String(value||"").trim();
 return text?[text]:[""];
};

function FleetingNoteForm({
 form,
 setForm,
 editing=null,
 projects=[],
 subtypes=[],
 onSubtypeCreated,
 saving=false,
 onSubmit
}){
 const domainIdPreview=useDomainIdPreview({form,editing,recordType:"FLT",idField:"fleetingNoteId",subtype:form.captureType,subject:form.subjectCode});
 const [loadingId,setLoadingId]=useState(false);
 const [idError,setIdError]=useState("");

 const [addingSubtype,setAddingSubtype]=useState(false);
 const [newSubtypeName,setNewSubtypeName]=useState("");
 const [newSubtypeCode,setNewSubtypeCode]=useState("");
 const [newSubtypeDescription,setNewSubtypeDescription]=useState("");
 const [newSubtypeStatus,setNewSubtypeStatus]=useState("active");
 const [savingSubtype,setSavingSubtype]=useState(false);
 const [subtypeError,setSubtypeError]=useState("");

 const previewPendingRef=useRef(false);
 const mountedRef=useRef(false);

 const completeSubtypes=useRecordSubtypes("FLT",subtypes);

 useEffect(()=>{
  mountedRef.current=true;

  return()=>{
   mountedRef.current=false;
  };
 },[]);

 const updateField=(field,value)=>{
  setForm(current=>({...current,[field]:value}));
 };

 const updateIdField=(field,value)=>{
  setForm(current=>({...current,[field]:value,fleetingNoteId:""}));
 };

 const normalizeCode=value=>
  String(value||"")
   .toUpperCase()
   .replace(/[^A-Z0-9]+/g,"-")
   .replace(/^-+|-+$/g,"");

 const normalizeTopicCode=value=>
  String(value||"")
   .toUpperCase()
   .replace(/[^A-Z0-9]+/g,"");

 const saveSubtype=async()=>{
  const userId=getStoredUserId();
  const name=String(newSubtypeName||"").trim();
  const code=normalizeCode(newSubtypeCode||newSubtypeName);

  if(!name||!code){
   setSubtypeError("Subtype name and code are required.");
   return;
  }

  setSavingSubtype(true);
  setSubtypeError("");

  try{
   const response=await fetch("/api/record-subtypes",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    credentials:"include",
    body:JSON.stringify({
     userId,
     recordType:"FLT",
     name,
     code,
     description:newSubtypeDescription,
     status:newSubtypeStatus
    })
   });

   const data=await response.json().catch(()=>null);

   if(!response.ok){
    throw new Error(data?.message||"Unable to add subtype");
   }

   onSubtypeCreated?.(data.data);
   setAddingSubtype(false);
   setNewSubtypeName("");
   setNewSubtypeCode("");
   setNewSubtypeDescription("");
   setNewSubtypeStatus("active");
  }catch(error){
   setSubtypeError(error.message);
  }finally{
   setSavingSubtype(false);
  }
 };

 const updatePossibleProject=(index,value)=>{
  setForm(current=>({
   ...current,
   possibleProject:normalizeRows(current.possibleProject).map(
    (project,projectIndex)=>projectIndex===index?value:project
   )
  }));
 };

 const addPossibleProject=()=>{
  setForm(current=>({
   ...current,
   possibleProject:[...normalizeRows(current.possibleProject),""]
  }));
 };

 const removePossibleProject=index=>{
  setForm(current=>{
   const possibleProject=normalizeRows(current.possibleProject).filter(
    (project,projectIndex)=>projectIndex!==index
   );

   return{
    ...current,
    possibleProject:possibleProject.length?possibleProject:[""]
   };
  });
 };

 const updateNote=(index,value)=>{
  setForm(current=>({
   ...current,
   notes:normalizeRows(current.notes).map(
    (note,noteIndex)=>noteIndex===index?value:note
   )
  }));
 };

 const addNote=()=>{
  setForm(current=>({
   ...current,
   notes:[...normalizeRows(current.notes),""]
  }));
 };

 const removeNote=index=>{
  setForm(current=>{
   const notes=normalizeRows(current.notes).filter(
    (note,noteIndex)=>noteIndex!==index
   );

   return{
    ...current,
    notes:notes.length?notes:[""]
   };
  });
 };

 useEffect(()=>{
  queueMicrotask(()=>{
   if(!mountedRef.current)return;

   if(editing?._id){
    const existingId=editing.fleetingNoteId||form.fleetingNoteId||"";

    if(form.fleetingNoteId!==existingId){
     setForm(current=>({
      ...current,
      fleetingNoteId:existingId
     }));
    }

    setLoadingId(false);
    setIdError("");
    return;
   }

   const userId=getStoredUserId();

   if(!userId){
    setLoadingId(false);
    setIdError("A valid user is required to generate the Fleeting Note ID.");
    return;
   }

   if(form.fleetingNoteId){
    setLoadingId(false);
    setIdError("");
    return;
   }

   const selectedProject=projects.find(
    project=>String(project._id)===String(form.projectId)
   );

   const contextCode=normalizeTopicCode(
    form.domainCode||
    selectedProject?.code||
    form.topic||
    "GENERAL"
   );

   const subtypeCode=normalizeCode(form.captureType||"");
   const subjectCode=normalizeCode(form.subjectCode||getDateCode());
   const generatedDate=getDateCode();
   const sequenceSubjectCode=`${subjectCode}-${generatedDate}`;

   if(!contextCode||!subtypeCode){
    setForm(current=>
     current.fleetingNoteId
      ?{...current,fleetingNoteId:""}
      :current
    );

    setLoadingId(false);
    setIdError("");
    return;
   }

   if(previewPendingRef.current)return;

   previewPendingRef.current=true;
   setLoadingId(true);
   setIdError("");

   const previewId=async()=>{
    try{
     const query=new URLSearchParams({
      userId,
      recordType:"FLT",
      projectCode:contextCode,
      subtypeCode,
      subjectCode:sequenceSubjectCode
     });

     const response=await fetch(
      `/api/id-sequences?${query.toString()}`,
      {credentials:"include"}
     );

     const data=await response.json().catch(()=>null);

     if(!response.ok){
      throw new Error(
       data?.message||
       "Unable to load the next Fleeting Note ID"
      );
     }

     const sequence=Array.isArray(data?.data)
      ?data.data[0]
      :null;

     const nextNumber=sequence?.nextNumber||1;

     const generatedId=[
      "FLT",
      contextCode,
      subtypeCode,
      subjectCode,
      generatedDate,
      String(nextNumber).padStart(3,"0")
     ]
      .filter(Boolean)
      .join("-");

     if(!generatedId){
      throw new Error(
       "The ID sequence did not return a Fleeting Note ID"
      );
     }

     if(mountedRef.current){
      setForm(current=>{
       const currentProject=projects.find(
        project=>String(project._id)===String(current.projectId)
       );

       const currentContextCode=normalizeTopicCode(
        current.domainCode||
        currentProject?.code||
        current.topic||
        "GENERAL"
       );

       const currentSubtypeCode=normalizeCode(
        current.captureType||""
       );

       const currentSubjectCode=normalizeCode(
        current.subjectCode||getDateCode()
       );

       if(
        currentContextCode!==contextCode||
        currentSubtypeCode!==subtypeCode||
        currentSubjectCode!==subjectCode
       ){
        return current;
       }

       return{
        ...current,
        fleetingNoteId:generatedId
       };
      });
     }
    }catch(error){
     if(mountedRef.current){
      setIdError(error.message);
     }
    }finally{
     previewPendingRef.current=false;

     if(mountedRef.current){
      setLoadingId(false);
     }
    }
   };

   previewId();
  });
 },[
  editing?._id,
  editing?.fleetingNoteId,
  form.projectId,
  form.topic,
  form.captureType,
  form.subjectCode,
  form.fleetingNoteId,
  form.domainCode,
  projects,
  setForm
 ]);

 const possibleProjects=normalizeRows(form.possibleProject);
 const notes=normalizeRows(form.notes);

 return(
  <Form
   className="fleeting-capture-form"
   onSubmit={onSubmit}
  >
   <DomainSelect
    value={form.domainId}
    onChange={(domainId,domain)=>
     setForm(current=>({
      ...current,
      domainId,
      domainCode:domain?.code||"",
      fleetingNoteId:""
     }))
    }
   />

   <Form.Group
    className="fleeting-paper-field fleeting-id-preview"
    controlId="fleeting-note-id-preview"
   >
    <Form.Label>
     Projected Fleeting Note ID
    </Form.Label>

    <div
     className={
      idError
       ?"fleeting-id-preview-text is-invalid"
       :"fleeting-id-preview-text"
     }
    >
     <code>
      {
       loadingId
        ?"Previewing ID..."
        :(editing?._id?domainIdPreview:form.fleetingNoteId)||
         "Choose domain/project/topic and subtype"
      }
     </code>
    </div>

    {idError&&(
     <div className="invalid-feedback d-block">
      {idError}
     </div>
    )}
   </Form.Group>

   <div className="fleeting-paper-row fleeting-paper-row-two">
    <RelationshipSelector
     label="Projects (optional)"
     value={form.projectIds||[]}
     records={projects.filter(
      project=>project.status!=="archived"
     )}
     idField="projectId"
     titleField="title"
     onChange={projectIds=>
      setForm(current=>({
       ...current,
       projectIds,
       projectId:projectIds[0]||"",
       fleetingNoteId:""
      }))
     }
    />

    <Form.Group
     className="fleeting-paper-field"
     controlId="fleeting-topic"
    >
     <Form.Label>Topic</Form.Label>

     <Form.Control
      value={form.topic||""}
      onChange={event=>
       updateIdField(
        "topic",
        event.target.value
       )
      }
      placeholder="Readable topic, for example: Perfume on the Wind"
     />
    </Form.Group>
   </div>

   <div className="fleeting-paper-row fleeting-paper-row-two">
    <Form.Group
     className="fleeting-paper-field"
     controlId="fleeting-subtype"
    >
     <Form.Label>
      Fleeting Subtype
     </Form.Label>

     <div className="fleeting-subtype-control">
      <Form.Select
       required
       value={form.captureType||""}
       onChange={event=>
        updateIdField(
         "captureType",
         event.target.value
        )
       }
      >
       <option value="">
        Choose subtype
       </option>

       {completeSubtypes.map(subtype=>(
        <option
         key={subtype._id}
         value={subtype.code}
        >
         {subtype.name||subtype.code}
        </option>
       ))}
      </Form.Select>

      <Button
       type="button"
       size="sm"
       variant="outline-primary"
       onClick={()=>
        setAddingSubtype(
         current=>!current
        )
       }
      >
       Add Subtype
      </Button>
     </div>
    </Form.Group>

    <Form.Group
     className="fleeting-paper-field"
     controlId="fleeting-subject-code"
    >
     <Form.Label>
      Subject Code
     </Form.Label>

     <Form.Control
      value={form.subjectCode||""}
      onChange={event=>
       updateIdField(
        "subjectCode",
        event.target.value
         .toUpperCase()
         .replace(/[^A-Z0-9]+/g,"-")
         .replace(/^-+|-+$/g,"")
       )
      }
      placeholder={`Optional; defaults to ${getDateCode()}`}
     />
    </Form.Group>
   </div>

   {addingSubtype&&(
    <Form.Group
     className="fleeting-paper-field"
     controlId="fleeting-new-subtype"
    >
     <Form.Label>
      New Subtype
     </Form.Label>

     <div className="fleeting-new-subtype-row">
      <Form.Control
       value="FLT"
       readOnly
       aria-label="Record type"
      />

      <Form.Control
       value={newSubtypeName}
       onChange={event=>{
        setNewSubtypeName(
         event.target.value
        );

        setNewSubtypeCode(
         normalizeCode(
          event.target.value
         )
        );
       }}
       placeholder="Name"
      />

      <Form.Control
       value={newSubtypeCode}
       onChange={event=>
        setNewSubtypeCode(
         normalizeCode(
          event.target.value
         )
        )
       }
       placeholder="Code"
      />

      <Form.Control
       value={newSubtypeDescription}
       onChange={event=>
        setNewSubtypeDescription(
         event.target.value
        )
       }
       placeholder="Description"
      />

      <Form.Select
       value={newSubtypeStatus}
       onChange={event=>
        setNewSubtypeStatus(
         event.target.value
        )
       }
       aria-label="Status"
      >
       <option value="active">
        Active
       </option>

       <option value="archived">
        Archived
       </option>
      </Form.Select>

      <ButtonGroup className="fleeting-repeat-buttons">
       <Button
        type="button"
        size="sm"
        variant="outline-primary"
        disabled={savingSubtype}
        onClick={saveSubtype}
       >
        {
         savingSubtype
          ?"Saving..."
          :"Save"
        }
       </Button>

       <Button
        type="button"
        size="sm"
        variant="outline-secondary"
        disabled={savingSubtype}
        onClick={()=>{
         setAddingSubtype(false);
         setSubtypeError("");
         setNewSubtypeDescription("");
         setNewSubtypeStatus("active");
        }}
       >
        Cancel
       </Button>
      </ButtonGroup>

      {subtypeError&&(
       <div className="invalid-feedback d-block">
        {subtypeError}
       </div>
      )}
     </div>
    </Form.Group>
   )}

   <Form.Group
    className="fleeting-paper-field fleeting-paper-field-top"
    controlId="fleeting-raw-capture"
   >
    <Form.Label>
     Raw Capture
    </Form.Label>

    <RichTextEditor
     value={form.rawCapture||""}
     onChange={value=>
      updateField(
       "rawCapture",
       value
      )
     }
     placeholder="Capture the thought without processing it."
     minHeight="10rem"
    />
   </Form.Group>

   <Form.Group
    className="fleeting-paper-field fleeting-paper-field-top"
    controlId="fleeting-possible-projects"
   >
    <Form.Label>
     Possible Projects
    </Form.Label>

    <div className="fleeting-repeat-list">
     {possibleProjects.map(
      (project,index)=>(
       <div
        key={`possible-project-${index}`}
        className="fleeting-repeat-row"
       >
        <Form.Control
         value={project}
         onChange={event=>
          updatePossibleProject(
           index,
           event.target.value
          )
         }
         placeholder="Enter one possible project"
        />

        <ButtonGroup className="fleeting-repeat-buttons">
         <Button
          type="button"
          size="sm"
          variant="outline-primary"
          onClick={addPossibleProject}
         >
          Add Project
         </Button>

         <Button
          type="button"
          size="sm"
          variant="outline-danger"
          onClick={()=>
           removePossibleProject(
            index
           )
          }
          disabled={
           possibleProjects.length===1&&
           !project
          }
         >
          Remove
         </Button>
        </ButtonGroup>
       </div>
      )
     )}
    </div>
   </Form.Group>

   <Form.Group
    className="fleeting-paper-field"
    controlId="fleeting-process-later-as"
   >
    <Form.Label>
     Process Later As
    </Form.Label>

    <Form.Select
     value={form.processLaterAs||""}
     onChange={event=>
      updateField(
       "processLaterAs",
       event.target.value
      )
     }
    >
     <option value="">
      Not Decided
     </option>

     <option value="ZTL">
      Zettel
     </option>

     <option value="SRC">
      Source
     </option>

     <option value="ENT">
      Entity
     </option>

     <option value="STR">
      Structure Note
     </option>

     <option value="OUT">
      Output
     </option>
    </Form.Select>
   </Form.Group>

   <Form.Group
    className="fleeting-paper-field fleeting-paper-field-top"
    controlId="fleeting-notes"
   >
    <Form.Label>
     Notes
    </Form.Label>

    <div className="fleeting-repeat-list">
     {notes.map((note,index)=>(
      <div
       key={`note-${index}`}
       className="fleeting-repeat-row"
      >
       <Form.Control
        as="textarea"
        rows={2}
        value={note}
        onChange={event=>
         updateNote(
          index,
          event.target.value
         )
        }
        placeholder="Add context or instructions for processing later"
       />

       <ButtonGroup className="fleeting-repeat-buttons">
        <Button
         type="button"
         size="sm"
         variant="outline-primary"
         onClick={addNote}
        >
         Add Note
        </Button>

        <Button
         type="button"
         size="sm"
         variant="outline-danger"
         onClick={()=>
          removeNote(index)
         }
         disabled={
          notes.length===1&&!note
         }
        >
         Remove
        </Button>
       </ButtonGroup>
      </div>
     ))}
    </div>
   </Form.Group>

   {editing?._id&&(
    <>
     <Form.Group
      className="fleeting-paper-field"
      controlId="fleeting-status"
     >
      <Form.Label>
       Status
      </Form.Label>

      <Form.Select
       value={form.status||"active"}
       onChange={event=>
        updateField(
         "status",
         event.target.value
        )
       }
      >
       <option value="active">
        Active
       </option>

       <option value="processed">
        Processed
       </option>

       <option value="archived">
        Archived
       </option>

       <option value="discarded">
        Discarded
       </option>
      </Form.Select>
     </Form.Group>

     <Form.Group
      className="fleeting-paper-field"
      controlId="fleeting-processed-into"
     >
      <Form.Label>
       Processed Into
      </Form.Label>

      <Form.Control
       value={form.processedInto||""}
       onChange={event=>
        updateField(
         "processedInto",
         event.target.value
        )
       }
       placeholder="Example: OUT-POEM-RAIN-001"
      />
     </Form.Group>

     <Form.Group
      className="fleeting-paper-field"
      controlId="fleeting-note-hide-from-inbox"
     >
      <span/>

      <Form.Check
       type="checkbox"
       label="Hide from inbox"
       checked={Boolean(form.hideFromInbox)}
       onChange={event=>
        updateField(
         "hideFromInbox",
         event.target.checked
        )
       }
      />
     </Form.Group>
    </>
   )}

   <div className="fleeting-paper-actions">
    <Button
     type="submit"
     disabled={
      saving||
      loadingId||
      Boolean(idError)||
      !form.fleetingNoteId
     }
    >
     {
      saving
       ?"Saving..."
       :editing?._id
        ?"Save Fleeting Note"
        :"Add Fleeting Note"
     }
    </Button>
   </div>
  </Form>
 );
}

export default FleetingNoteForm;