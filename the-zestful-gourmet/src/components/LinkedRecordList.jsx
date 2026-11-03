import {Link} from "react-router-dom";

const getObjectId=value=>{
 if(!value)return "";
 if(typeof value==="string")return value;
 return value._id?.$oid||value.id?.$oid||value._id||value.id||value.$oid||"";
};

const getCode=value=>value?.zettelId||value?.sourceId||value?.outputId||value?.entityId||value?.structureNoteId||getObjectId(value);
const getTitle=value=>value?.title||value?.name||"";

function LinkedRecordList({records=[],type}){
 const values=Array.isArray(records)?records:[];
 if(!values.length)return "--";

 const getPath=record=>{
  const id=getObjectId(record);
  if(type==="zettel")return `/notes/${id}`;
  if(type==="source")return `/references/${id}`;
  if(type==="output")return `/outputs/${id}`;
  if(type==="entity")return `/entities/${id}`;
  if(type==="structure")return `/structures/${id}`;
  return "#";
 };

 return(
  <div className="record-detail-links">
   {values.map(record=>{
    const title=getTitle(record);

    return(
     <Link className="record-detail-link" key={getObjectId(record)} to={getPath(record)}>
      <code>{getCode(record)}</code>
      {title&&<span className="record-detail-link-title"><span aria-hidden="true"> — </span>{title}</span>}
     </Link>
    );
   })}
  </div>
 );
}

export default LinkedRecordList;
