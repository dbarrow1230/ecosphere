const ownerUsers=new Set(["69af088d21b4580a8cb6614b"]);
const allowedRoleIds=new Set(["69edf92e1e6593dd5369f718","69edf92e1e6593dd5369f719","69d389f609a4ebea1c3f634e","69d46bce86ec944e3cab4566"]);
const roleNames=new Set(["owner","business owner","app owner","super admin","admin","administrator"]);
const objectId=value=>typeof value==="string"?value.toLowerCase():String(value?._id?.$oid||value?._id||value?.id?.$oid||value?.id||value?.$oid||"").toLowerCase();
export function canManagePublicWebsites(user){
 if(!user)return false;
 if(ownerUsers.has(objectId(user)))return true;
 const rows=value=>Array.isArray(value)?value:[];
 const assignments=[...rows(user.roleAssignments),...rows(user.userRoleAssignments),...rows(user.assignments)].filter(row=>row.isActive!==false);
 const roles=[user.role,user.roleId,user.currentRole,user.activeRole,...assignments.map(row=>row.role||row.userRole||row.assignedRole)].filter(Boolean);
 return roles.some(role=>allowedRoleIds.has(objectId(role))||roleNames.has(String(typeof role==="string"?role:role.name||role.title||role.label||role.code||"").toLowerCase().trim()));
}
export function storedSession(){
 for(const storage of [localStorage,sessionStorage]){
  for(const key of ["userInfo","user","authUser","currentUser"]){try{const value=JSON.parse(storage.getItem(key)||"null");const user=value?.user||value?.data||value;if(user?._id||user?.id||user?.username)return user;}catch{/* Try the next stored session. */}}
 }
 return null;
}
export function sessionToken(){
 for(const storage of [localStorage,sessionStorage]){
  const token=storage.getItem("token");if(token)return token.replace(/^"|"$/g,"");
  for(const key of ["userInfo","user","authUser","currentUser"]){try{const value=JSON.parse(storage.getItem(key)||"null");if(value?.token)return value.token;}catch{/* Try the next stored session. */}}
 }
 return "";
}
