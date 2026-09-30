import {Link} from "react-router-dom";
import {sortItems} from "../utils/sortItems.js";
import RecordPreviewPopover from "./RecordPreviewPopover.jsx";

const getObjectId=value=>{
 if(!value)return "";
 if(typeof value==="string")return value;
 return value._id?.$oid||value.id?.$oid||value._id||value.id||value.$oid||"";
};

const getCode=value=>value?.zettelId||value?.sourceId||value?.outputId||value?.entityId||value?.structureNoteId||getObjectId(value);
const getTitle=value=>value?.title||value?.name||"";

function LinkedRecordList({records=[],type,linkIdOnly=false,previewOnly=false}){
 const values=sortItems(
  [...new Map((Array.isArray(records)?records:[]).map(record=>[String(getObjectId(record)),record])).values()],
  record=>getTitle(record)||getCode(record)
 );
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
     previewOnly?(
      <div className="record-detail-link record-detail-id-only" key={getObjectId(record)}>
       <RecordPreviewPopover record={record} code={getCode(record)} title={title}/>
       {title&&<span className="record-detail-link-title"><span aria-hidden="true"> — </span>{title}</span>}
      </div>
     ):linkIdOnly?(
      <div className="record-detail-link record-detail-id-only" key={getObjectId(record)}>
       <Link to={getPath(record)}><code>{getCode(record)}</code></Link>
       {title&&<span className="record-detail-link-title"><span aria-hidden="true"> — </span>{title}</span>}
      </div>
     ):(
      <Link className="record-detail-link" key={getObjectId(record)} to={getPath(record)}>
       <code>{getCode(record)}</code>
       {title&&<span className="record-detail-link-title"><span aria-hidden="true"> — </span>{title}</span>}
      </Link>
     )
    );
   })}
  </div>
 );
}

export default LinkedRecordList;
