export const splitList=value=>Array.isArray(value)
 ?value.map(item=>String(item||"").trim()).filter(Boolean)
 :String(value||"").split(",").map(item=>item.trim()).filter(Boolean);

export const textList=value=>Array.isArray(value)?value.join(", "):String(value||"");

export const displayValue=value=>{
 if(Array.isArray(value))return value.map(displayValue).filter(Boolean).join(", ")||"--";
 if(value&&typeof value==="object")return value.title||value.name||value.label||value.zettelId||value._id||"--";
 return String(value||"--");
};

export const authUserId=()=>{
 for(const storage of [localStorage,sessionStorage]){
  for(const key of ["userInfo","user","authUser","currentUser"]){
   try{
    const stored=JSON.parse(storage.getItem(key)||"null");
    const user=stored?.user||stored?.data||stored;
    if(user?._id||user?.id)return String(user._id||user.id);
   }catch{continue;}
  }
 }
 return "";
};
