import {Link} from "react-router-dom";

export const renderDate=value=>value?new Date(value).toLocaleString():"—";

export const renderNoteLink=note=>{
 if(!note)return "—";
 const id=typeof note==="object"?note._id||note.id:note;
 const label=typeof note==="object"?note.title||note.name||note.zettelId||id:id;
 return id?<Link to={`/notes/${id}`}>{label}</Link>:"—";
};
