import {useEffect,useState} from "react";
import {Alert,Button,Spinner,Table} from "react-bootstrap";
import {useNavigate} from "react-router-dom";
import "./Recipes.css";

const label=value=>typeof value==="object"?(value?.name||value?.title||"—"):(value||"—");

export default function Recipes(){
 const navigate=useNavigate();
 const [rows,setRows]=useState([]);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");

 useEffect(()=>{
  let active=true;
  fetch("/api/recipes").then(async res=>{
   const data=await res.json();
   if(!res.ok)throw new Error(data.message||"Failed to load recipes");
   if(active)setRows((Array.isArray(data)?data:[]).sort((left,right)=>String(left.name||"").localeCompare(String(right.name||""),undefined,{sensitivity:"base"})));
  }).catch(err=>active&&setError(err.message)).finally(()=>active&&setLoading(false));
  return()=>{active=false;};
 },[]);

 const costRecipe=recipe=>{
  navigate(`/recipe-costings?recipe=${encodeURIComponent(recipe._id)}`);
 };

 return(
  <main className="recipes-page">
   <header className="recipes-page-header">
    <div>
     <h1>Recipes</h1>
     <p>Recipes loaded from the connected recipe management database.</p>
    </div>
    <Button onClick={()=>navigate("/recipe-costings")}>View Recipe Costings</Button>
   </header>

   {error?<Alert variant="danger">{error}</Alert>:null}

   {loading?(
    <div className="recipes-loading"><Spinner animation="border"/> Loading recipes…</div>
   ):(
    <section className="recipes-table-panel">
     <div className="recipes-table-scroll">
      <Table striped hover bordered className="recipes-table">
       <thead>
        <tr>
         <th>Recipe</th>
         <th>Recipe Number</th>
         <th>Category</th>
         <th>Course</th>
         <th>Cuisine</th>
         <th>Active</th>
         <th>Action</th>
        </tr>
       </thead>
       <tbody>
        {rows.length===0?(
         <tr><td colSpan="7" className="recipes-empty">No recipes found in the connected database.</td></tr>
        ):rows.map(row=>(
         <tr key={row._id}>
          <td>{row.name}</td>
          <td>{row.recipeNumber||"—"}</td>
          <td>{label(row.category)}</td>
          <td>{label(row.course)}</td>
          <td>{label(row.cuisine)}</td>
          <td>{row.isActive===false?"No":"Yes"}</td>
          <td><Button size="sm" onClick={()=>costRecipe(row)}>Cost Recipe</Button></td>
         </tr>
        ))}
       </tbody>
      </Table>
     </div>
    </section>
   )}
  </main>
 );
}
