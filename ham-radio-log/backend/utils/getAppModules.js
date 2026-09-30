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

const APP_PAGE_MODULES={
 "ham-radio-log":[
  {value:"dashboard",label:"Station Dashboard",path:"/dashboard",group:"Station"},
  {value:"qso",label:"QSO Logbook",path:"/logbook",group:"Station"},
  {value:"morse_practice",label:"Morse Practice",path:"/morse/practice",group:"Station"},
  {value:"antenna_reference",label:"Antenna Reference",path:"/references/antennas",group:"References"},
  {value:"cw_reference",label:"CW Reference",path:"/references/cw",group:"References"},
  {value:"radio_terms",label:"Ham & CB Radio Terms",path:"/references/radio-terms",group:"References"},
  {value:"marine_codes",label:"Marine Codes",path:"/references/marine-codes",group:"References"},
  {value:"nyc_police_codes",label:"NYC Police Ten-Codes",path:"/references/nyc-police-ten-codes",group:"References"},
  {value:"phonetic_alphabet_reference",label:"Phonetic Alphabet Reference",path:"/references/phonetic-alphabet",group:"References"},
  {value:"reference_organizations",label:"Reference Organizations",path:"/references/organizations",group:"References"},
  {value:"technical_reference",label:"Technical Reference",path:"/references/technical",group:"References"},
  {value:"profile",label:"User Profile",path:"/profile",group:"Account"},
  {value:"admin_dashboard",label:"Admin Dashboard",path:"/admin/dashboard",group:"Administration"},
  {value:"users",label:"Users",path:"/admin/users",group:"Administration"},
  {value:"roles_permissions",label:"Roles & Permissions",path:"/admin/business-roles-permissions",group:"Administration"},
  {value:"permission_matrix",label:"Permission Matrix",path:"/permissions",group:"Administration"},
  {value:"businesses",label:"Businesses",path:"/admin/businesses",group:"Settings"},
  {value:"business_types",label:"Business Types",path:"/admin/business-types",group:"Settings"},
  {value:"app_keys",label:"App Keys",path:"/admin/app-keys",group:"Settings"},
  {value:"footers",label:"Footers",path:"/admin/footers",group:"Settings"},
  {value:"seasons",label:"Seasons",path:"/admin/seasons",group:"Reference"},
  {value:"holidays",label:"Holidays",path:"/admin/holidays",group:"Reference"},
  {value:"occasions",label:"Occasions",path:"/admin/occasions",group:"Reference"},
  {value:"taglines",label:"Taglines",path:"/admin/taglines",group:"Reference"},
  {value:"vendors",label:"Vendors",path:"/admin/vendors",group:"Reference"},
  {value:"tax_rates",label:"Tax Rates",path:"/admin/tax-rates",group:"Reference"}
 ]
};

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
 const normalizedAppKey=String(appKey||"").trim().toLowerCase();
 if(APP_PAGE_MODULES[normalizedAppKey])return APP_PAGE_MODULES[normalizedAppKey];

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
