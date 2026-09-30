import {useEffect,useState} from "react";
import {Link,useNavigate,useParams} from "react-router-dom";
import {Alert,Button,Container,Spinner,Tab,Tabs} from "react-bootstrap";
import RichTextContent from "../components/RichTextContent.jsx";
import "../styles/NoteDetails.css";
import "../styles/ZettelSections.css";

const getStoredUserId=()=>{
 for(const key of ["userInfo","user","authUser","currentUser"]){
  try{
   const value=JSON.parse(
    localStorage.getItem(key)||
    sessionStorage.getItem(key)||
    "null"
   );

   const user=value?.user||value?.data||value;

   return typeof user==="string"
    ?user
    :user?._id||user?.id||"";
  }catch{
   continue;
  }
 }

 return "";
};

const displayValue=value=>{
 if(value===null||value===undefined||value==="")return "";

 if(typeof value==="object"){
  return String(
   value.name||
   value.title||
   value.code||
   value.label||
   value.recordType||
   value._id||
   value.id||
   ""
  ).trim();
 }

 return String(value).trim();
};

const asTextList=value=>{
 if(Array.isArray(value)){
  return value
   .flatMap(item=>typeof item==="string"
    ?item.split(/[,;\r\n]+/).map(entry=>entry.trim())
    :[displayValue(item)])
   .filter(Boolean);
 }

 const text=displayValue(value);

 return text?text.split(/[,;\r\n]+/).map(item=>item.trim()).filter(Boolean):[];
};

const getRecordObjectId=value=>{
 if(!value||typeof value!=="object")return "";
 const candidate=value._id||value.id;
 return typeof candidate==="object"?candidate?.$oid||candidate?.toString?.()||"":String(candidate||"");
};

const TextListSection=({title,values,basePath=""})=>{
 const items=asTextList(values);

 if(!items.length)return null;

 return(
  <section className={`zettel-development-section zettel-development-${title.toLowerCase().replace(/\s+/g,"-")}`}>
   <h3>{title}</h3>

   <ul className="zettel-detail-list">
    {items.map((item,index)=>{
     const source=Array.isArray(values)?values[index]:null;
     const recordId=getRecordObjectId(source);
     return(
      <li key={`${title}-${index}`}>
       {basePath&&recordId?<Link to={`${basePath}/${recordId}`}>{item}</Link>:item}
      </li>
     );
    })}
   </ul>
  </section>
 );
};

export default function NoteDetails(){
 const {id}=useParams();
 const navigate=useNavigate();

 const [zettel,setZettel]=useState(null);
 const [error,setError]=useState("");

 const userId=getStoredUserId();

 useEffect(()=>{
  let active=true;

  const load=async()=>{
   try{
    const response=await fetch(
     `/api/zettels/${id}?userId=${encodeURIComponent(userId)}`
    );

    const data=await response.json().catch(()=>null);

    if(!response.ok){
     throw new Error(
      data?.message||
      "Unable to load zettel"
     );
    }

    if(active){
     setZettel(data.data);
    }
   }catch(loadError){
    if(active){
     setError(loadError.message);
    }
   }
  };

  load();

  return()=>{
   active=false;
  };
 },[id,userId]);

 if(error){
  return(
   <Container className="py-5">
    <Alert variant="danger">
     {error}
    </Alert>

    <Link to="/notes">
     Back to zettels
    </Link>
   </Container>
  );
 }

 if(!zettel){
  return(
   <Container className="py-5 text-center">
    <Spinner animation="border"/>
   </Container>
  );
 }

 const subtype=asTextList(zettel.subtype).join(", ");
 const status=displayValue(zettel.status);
 const project=displayValue(zettel.projectId);

 return(
  <Container className="zettel-detail-page py-5">
   <article className="zettel-detail-card">
    <div className="zettel-detail-header">
     <div className="zettel-detail-heading">
      <p className="zettel-detail-id mb-1">
       <code>{zettel.zettelId}</code>
      </p>

      <h1>{zettel.title}</h1>

     </div>

     <Button size="sm" onClick={()=>navigate(`/notes?edit=${zettel._id}`)}>
      Edit
     </Button>
    </div>

    <Tabs className="zettel-detail-tabs" defaultActiveKey="overview">
     <Tab eventKey="overview" title="Overview">
      <section className="zettel-detail-tab-panel">
       <RichTextContent className="lead" value={zettel.mainIdea} empty="No main idea."/>

       <dl className="zettel-detail-meta">
        <div><dt>Subtype</dt><dd>{subtype||"—"}</dd></div>
        <div><dt>Status</dt><dd>{status||"—"}</dd></div>
        <div><dt>Project</dt><dd>{project||"—"}</dd></div>
       </dl>
      </section>
     </Tab>

     <Tab eventKey="body" title="Body">
      <div className="zettel-detail-tab-panel zettel-detail-body">
       <RichTextContent value={zettel.body} empty="No body content."/>
      </div>
     </Tab>

     <Tab eventKey="development" title="Development">
      <div className="zettel-detail-tab-panel zettels-development-tab">
       <TextListSection title="Future use" values={zettel.futureUse}/>
       <TextListSection title="Questions" values={zettel.questions}/>
       <TextListSection title="Tags" values={zettel.tags}/>
      </div>
     </Tab>

     <Tab eventKey="related" title="Related Records">
      <div className="zettel-detail-tab-panel zettel-detail-related">
       <TextListSection title="Sources" values={zettel.sourceIds} basePath="/references"/>
       <TextListSection title="Entities" values={zettel.entityIds} basePath="/entities"/>
      </div>
     </Tab>
    </Tabs>

    <Link className="zettel-detail-back" to="/notes">
     ← Back to zettels
    </Link>
   </article>
  </Container>
 );
}