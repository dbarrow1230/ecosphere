// backend/utils/getAppModules.js
import fs from "fs";
import path from "path";

const EXCLUDED_FILES=["index.js"];
const EXCLUDED_MODULES=[
 "user",
 "role",
 "permission",
 "business",
 "business_type",
 "businesstype",
 "user_role_assignment",
 "user_permission_override",
 "role_permission"
];

const APPS_ROOT=path.resolve(process.cwd(),"..");

const toModuleLabel=name=>{
 return name
  .replace(/Model$/i,"")
  .replace(/([a-z])([A-Z])/g,"$1 $2")
  .replace(/\b\w/g,char=>char.toUpperCase());
};

const toModuleValue=name=>{
 return name
  .replace(/Model$/i,"")
  .replace(/([a-z])([A-Z])/g,"$1_$2")
  .replace(/[\s\-]+/g,"_")
  .toLowerCase();
};

export const getAppModules=appKey=>{
 const appModelsDir=path.join(APPS_ROOT,appKey,"backend","models");
 const localModelsDir=path.resolve(process.cwd(),"backend","models");
 const modelsDir=fs.existsSync(appModelsDir)?appModelsDir:localModelsDir;

 if(!fs.existsSync(modelsDir))
  throw new Error(`Models directory not found for appKey: ${appKey}`);

 const modules=[];

 const walk=dir=>{
  const entries=fs.readdirSync(dir,{withFileTypes:true});

  for(const entry of entries){
   const fullPath=path.join(dir,entry.name);

   if(entry.isDirectory()){
    walk(fullPath);
    continue;
   }

   if(!entry.name.endsWith(".js"))continue;
   if(EXCLUDED_FILES.includes(entry.name))continue;

   const baseName=entry.name.replace(/\.js$/,"");
   const value=toModuleValue(baseName);

   if(EXCLUDED_MODULES.includes(value))continue;

   modules.push({
    value,
    label:toModuleLabel(baseName)
   });
  }
 };

 walk(modelsDir);

 return [...new Map(modules.map(module=>[module.value,module])).values()]
  .sort((a,b)=>a.label.localeCompare(b.label));
};
