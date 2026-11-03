// src/pages/tag/TagForm.jsx
import LifeboardFormPage from "../../components/lifeboard/LifeboardFormPage.jsx";

function TagForm({
 record=null,
 embedded=false,
 onCancel,
 onSaved
}){

 const normalizeId=value=>{
  if(!value)return "";
  if(typeof value==="object"&&value?.$oid)return String(value.$oid);
  if(typeof value==="object"&&value?._id)return normalizeId(value._id);
  if(typeof value==="object"&&value?.id)return normalizeId(value.id);
  return String(value).trim();
 };

 const getStoredUser=()=>{
  const keys=["user","userInfo","authUser","currentUser"];

  for(const key of keys){
   try{
    const raw=localStorage.getItem(key)||sessionStorage.getItem(key);
    if(!raw)continue;

    const parsed=JSON.parse(raw);

    if(parsed?._id||parsed?.id||parsed?.username||parsed?.email)return parsed;
    if(parsed?.user?._id||parsed?.user?.id||parsed?.user?.username||parsed?.user?.email)return parsed.user;
    if(parsed?.data?._id||parsed?.data?.id||parsed?.data?.username||parsed?.data?.email)return parsed.data;
   }catch(err){
    console.error(`Failed to parse stored user from ${key}`,err);
   }
  }

  return null;
 };

 const currentUser=getStoredUser();
 const userId=normalizeId(currentUser?._id)||normalizeId(currentUser?.id);
 const recordId=normalizeId(record?._id)||normalizeId(record?.id);

 return(
  <LifeboardFormPage
   title={record?"Edit Tag":"New Tag"}
   eyebrow="Tags"
   text="Create a reusable label for organizing lifeboard records."
   endpoint={recordId?`/api/tags/${recordId}`:"/api/tags"}
   method={recordId?"PUT":"POST"}
   redirectPath="/tags"
   submitLabel={recordId?"Update Tag":"Save Tag"}
   embedded={embedded}
   inlineLabels={true}
   onCancel={onCancel}
   onSaved={onSaved}
   initialValues={{
    user:normalizeId(record?.user)||userId,
    name:record?.name||"",
    color:record?.color||"",
    icon:record?.icon||"",
    isActive:record?.isActive!==false
   }}
   transformPayload={payload=>({
    ...payload,
    user:payload.user||userId,
    isActive:payload.isActive!==false
   })}
   fields={[
    {name:"user",label:"User",type:"hidden"},
    {name:"name",label:"Name",required:true},
    {name:"color",label:"Color",type:"color"},
    {name:"icon",label:"Icon",placeholder:"Example: tag, heart, flame, book-open"},
    {name:"isActive",label:"Active",type:"checkbox",checkboxLabel:"Active"}
   ]}
  />
 );
}

export default TagForm;