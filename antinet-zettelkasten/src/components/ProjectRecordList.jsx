import "../styles/ProjectRecordList.css";

const getObjectId=value=>{
 if(!value)return "";
 if(typeof value==="string")return value;
 return value._id?.$oid||value.id?.$oid||value._id||value.id||value.$oid||"";
};

export default function ProjectRecordList({projects=[],fallback=null}){
 const records=[...new Map(
  [...(Array.isArray(projects)?projects:[]),fallback]
   .filter(Boolean)
   .map(project=>[getObjectId(project),project])
 ).values()];

 if(!records.length)return "—";

 return(
  <span className="project-record-list">
   {records.map((project,index)=>(
    <span className="project-record-line" key={getObjectId(project)||index}>
     <code>{project?.projectId||project?.code||getObjectId(project)||"—"}</code>
     <span>{project?.title||"Untitled project"}</span>
    </span>
   ))}
  </span>
 );
}
