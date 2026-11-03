import {useCallback,useEffect,useState} from "react";
import {Alert,Button,Spinner} from "react-bootstrap";
import {Link} from "react-router-dom";
import {richTextToPlainText} from "../utils/richText.js";
import "../styles/Favorites.css";

const getObjectId=value=>{
 if(!value)return "";
 if(typeof value==="string")return value;
 return value._id||value.id||value.$oid||value._id?.$oid||value.id?.$oid||"";
};

const displayValue=value=>{
 if(!value)return "";
 if(typeof value==="string")return value;
 return value.title||value.name||value.code||value.label||"";
};

const getStoredUserId=()=>{
 for(const key of ["userInfo","user","authUser","currentUser"]){
  try{
   const parsed=JSON.parse(localStorage.getItem(key)||sessionStorage.getItem(key)||"null");
   const userId=getObjectId(parsed?.user||parsed?.data||parsed);
   if(userId)return userId;
  }catch{
   continue;
  }
 }
 return "";
};

function FavoritesPage(){
 const userId=getStoredUserId();
 const [favorites,setFavorites]=useState([]);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");

 const load=useCallback(async()=>{
  if(!userId){setLoading(false);return;}
  try{
   setLoading(true);
   setError("");
   const response=await fetch(`/api/zettels?userId=${encodeURIComponent(userId)}&isFavorite=true`);
   const data=await response.json().catch(()=>null);
   if(!response.ok)throw new Error(data?.message||"Unable to load favorites");
   setFavorites(Array.isArray(data?.data)?data.data:[]);
  }catch(loadError){
   setError(loadError.message);
  }finally{
   setLoading(false);
  }
 },[userId]);

 useEffect(()=>{queueMicrotask(load);},[load]);

 const removeFavorite=async zettel=>{
  try{
   const response=await fetch(`/api/zettels/${zettel._id}/favorite`,{
    method:"PATCH",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({userId})
   });
   const data=await response.json().catch(()=>null);
   if(!response.ok)throw new Error(data?.message||"Unable to update favorite");
   setFavorites(current=>current.filter(item=>item._id!==zettel._id));
  }catch(updateError){
   setError(updateError.message);
  }
 };

 if(!userId)return <main className="favorites-page"><Alert variant="info">Log in to view favorite zettels.</Alert></main>;
 if(loading)return <main className="favorites-page favorites-loading"><Spinner animation="border"/></main>;

 return(
  <main className="favorites-page">
   <header className="favorites-header">
    <div><p className="dashboard-section-kicker">Review</p><h1>Favorite Ideas</h1><p>A reading list of ideas you marked to revisit.</p></div>
    <span className="favorites-count">{favorites.length} saved</span>
   </header>

   {error&&<Alert variant="danger">{error}</Alert>}
   {!error&&!favorites.length&&<Alert variant="light">No favorite ideas yet. Mark a zettel as a favorite to keep it here.</Alert>}

   {!error&&favorites.length>0&&(
    <ol className="favorite-ideas" aria-label="Favorite ideas">
     {favorites.map(zettel=>{
      const project=displayValue(zettel.projectId)||displayValue(zettel.projectIds?.[0]);
      const subtype=displayValue(zettel.subtype);
      const mainIdea=richTextToPlainText(zettel.mainIdea)||"No main idea has been written.";
      return(
       <li className="favorite-idea" key={zettel._id}>
        <article className="favorite-idea-content">
         <h2><Link to={`/notes/${zettel._id}?returnTo=/favorites`}>{zettel.title||"Untitled zettel"}</Link></h2>
         <p>{mainIdea}</p>
         {(subtype||project)&&<p className="favorite-idea-context">{[subtype,project].filter(Boolean).join(" · ")}</p>}
        </article>
        <Button className="favorite-remove" variant="link" onClick={()=>removeFavorite(zettel)}>Unfavorite</Button>
       </li>
      );
     })}
    </ol>
   )}
  </main>
 );
}

export default FavoritesPage;
