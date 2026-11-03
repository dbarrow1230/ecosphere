import {useState} from "react";
import {Alert,Button,Card,Form,Spinner} from "react-bootstrap";

const wordQueueKey="recipe-management-word-parser-queue";
const savedWordQueue=()=>{
 try{return JSON.parse(localStorage.getItem(wordQueueKey)||"null")||{recipes:[],fileName:""};}
 catch{return{recipes:[],fileName:""};}
};

export default function RecipeParserModule({type,onParsed,business,onImportedAll}){
 const [text,setText]=useState("");
 const [file,setFile]=useState(null);
 const [parsing,setParsing]=useState(false);
 const [error,setError]=useState("");
 const [recipes,setRecipes]=useState(()=>type==="word"?savedWordQueue().recipes:[]);
 const [fileName,setFileName]=useState(()=>type==="word"?savedWordQueue().fileName:"");
 const [importingAll,setImportingAll]=useState(false);
 const [importSummary,setImportSummary]=useState(null);

 const parse=async()=>{
  if(type==="text"&&!text.trim()){setError("Paste GPT recipe output first.");return;}
  if(type==="word"&&!file){setError("Choose a Word .docx recipe first.");return;}

  try{
   setParsing(true);setError("");
   let response;

   if(type==="text"){
    response=await fetch("/api/recipe-import/parse-text",{
     method:"POST",
     headers:{"Content-Type":"application/json"},
     body:JSON.stringify({text})
    });
   }else{
    const body=new FormData();
    body.append("file",file);
    response=await fetch("/api/recipe-import/parse",{method:"POST",body});
   }

   const payload=await response.json().catch(()=>null);
   if(!response.ok)throw new Error(payload?.message||"Failed to parse recipe.");

   const parsedRecipes=payload?.recipes||[];
   if(!parsedRecipes.length)throw new Error("No recipe was detected.");
   setRecipes(parsedRecipes);
   const parsedFileName=payload?.fileName||file?.name||"";
   setFileName(parsedFileName);
   if(type==="word")localStorage.setItem(wordQueueKey,JSON.stringify({recipes:parsedRecipes,fileName:parsedFileName}));
   if(parsedRecipes.length===1)onParsed(parsedRecipes[0]);
  }catch(err){
   setError(err.message||"Failed to parse recipe.");
  }finally{
   setParsing(false);
  }
 };

 const importAll=async()=>{
  if(!business||!recipes.length)return;
  try{
   setImportingAll(true);setError("");setImportSummary(null);
   const response=await fetch("/api/recipe-import/import",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({business,recipes})});
   const payload=await response.json().catch(()=>null);
   if(!response.ok)throw new Error(payload?.message||"Failed to import recipe book.");
   setImportSummary(payload);
   localStorage.removeItem(wordQueueKey);
   setRecipes([]);setFileName("");
   await onImportedAll?.(payload);
  }catch(err){setError(err.message||"Failed to import recipe book.");}
  finally{setImportingAll(false);}
 };

 return(
  <Card>
   <Card.Body>
    {error?<Alert variant="danger">{error}</Alert>:null}
    {type==="text"?(
     <Form.Group>
      <Form.Label>GPT Recipe Output</Form.Label>
      <Form.Control as="textarea" rows={14} value={text} onChange={event=>setText(event.target.value)} placeholder="Paste the complete GPT recipe output here..."/>
     </Form.Group>
    ):(
     <Form.Group>
      <Form.Label>Word Recipe File</Form.Label>
      <Form.Control type="file" accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={event=>{setFile(event.target.files?.[0]||null);setRecipes([]);setFileName("");setImportSummary(null);localStorage.removeItem(wordQueueKey);setError("");}}/>
     </Form.Group>
    )}
    <div className="d-flex justify-content-end mt-3">
     <Button type="button" onClick={parse} disabled={parsing||(type==="text"?!text.trim():!file)}>
      {parsing?<><Spinner size="sm"/> Parsing...</>:"Parse Into This Recipe"}
     </Button>
    </div>
    {type==="word"&&recipes.length>1?(
     <div className="recipe-parser-results mt-4">
      <div className="d-flex align-items-center justify-content-between gap-3 mb-2"><h3 className="h6 mb-0">{recipes.length} recipes ready</h3><div className="d-flex align-items-center gap-2"><small className="text-muted">{fileName}</small><Button type="button" size="sm" variant="outline-secondary" onClick={()=>{setRecipes([]);setFileName("");localStorage.removeItem(wordQueueKey);}}>Clear Book</Button></div></div>
      <div className="recipe-parser-mode-actions"><div><strong>Add Individually</strong><p className="text-muted small mb-0">Load one recipe, review or edit it, save it, then return for the next recipe.</p></div><div><strong>Import All Recipes</strong><p className="text-muted small mb-2">Create every detected recipe now. Missing cuisines, courses, categories, and ingredients are created automatically.</p><Button type="button" size="sm" onClick={importAll} disabled={importingAll||!business}>{importingAll?"Importing All...":"Import All Recipes"}</Button></div></div>
      {importSummary?<Alert variant={importSummary.summary?.errors?"warning":"success"} className="mt-3 mb-3">Imported {importSummary.summary?.imported||0}; updated {importSummary.summary?.updated||0}; skipped {importSummary.summary?.skipped||0}; errors {importSummary.summary?.errors||0}.</Alert>:null}
      <div className="recipe-parser-result-list">
       {recipes.map((recipe,index)=><div className="recipe-parser-result" key={`${recipe.name}-${index}`}><div><strong>{recipe.name||`Recipe ${index+1}`}</strong><small>{recipe.ingredients?.length||0} ingredients · {recipe.instructions?.length||0} instructions</small></div><Button type="button" size="sm" variant="outline-primary" onClick={()=>onParsed(recipe)}>Load Recipe</Button></div>)}
      </div>
     </div>
    ):null}
   </Card.Body>
  </Card>
 );
}
