// Keep catalog controls consistent with the existing navigation role rules.
export function getAdminAccess(user){
 const ADMIN_USER_IDS=["69af088d21b4580a8cb6614b"];
 const OWNER_ROLE_IDS=["69edf92e1e6593dd5369f718"];
 const ADMIN_ROLE_IDS=["69edf92e1e6593dd5369f719","69d389f609a4ebea1c3f634e","69d46bce86ec944e3cab4566"];

 const getObjectId=value=>{
  if(!value)return "";

  if(typeof value==="string")return value.toLowerCase().trim();

  if(typeof value==="object"){
   if(typeof value.$oid==="string")return value.$oid.toLowerCase().trim();
   if(typeof value._id==="string")return value._id.toLowerCase().trim();
   if(typeof value.id==="string")return value.id.toLowerCase().trim();
   if(typeof value._id?.$oid==="string")return value._id.$oid.toLowerCase().trim();
   if(typeof value.id?.$oid==="string")return value.id.$oid.toLowerCase().trim();
  }

  return "";
 };

 const getUserId=()=>getObjectId(user?._id||user?.id||user);

 const getDirectRoleIds=()=>[
  getObjectId(user?.role),
  getObjectId(user?.roleId),
  getObjectId(user?.currentRole),
  getObjectId(user?.activeRole)
 ].filter(Boolean);

 const getAssignmentRoles=()=>{
  const assignments=[
   ...(Array.isArray(user?.roleAssignments)?user.roleAssignments:[]),
   ...(Array.isArray(user?.userRoleAssignments)?user.userRoleAssignments:[]),
   ...(Array.isArray(user?.assignments)?user.assignments:[])
  ];

  return assignments
   .filter(assignment=>assignment?.isActive!==false)
   .map(assignment=>assignment.role||assignment.userRole||assignment.assignedRole)
   .filter(Boolean);
 };

 const getAssignmentRoleIds=()=>getAssignmentRoles().map(role=>getObjectId(role)).filter(Boolean);

 const getRoleName=value=>{
  if(!value)return "";
  if(typeof value==="string")return value.toLowerCase().trim();
  if(typeof value==="object")return String(value.name||value.title||value.label||value.code||value.role||"").trim().toLowerCase();
  return "";
 };

 const getRoleNames=()=>[
  user?.role,
  user?.roleId,
  user?.currentRole,
  user?.activeRole,
  ...getAssignmentRoles()
 ].map(getRoleName).filter(Boolean);

 const userId=getUserId();
 const allRoleIds=[...getDirectRoleIds(),...getAssignmentRoleIds()];
 const roleNames=getRoleNames();

 const hasRoleId=ids=>allRoleIds.some(id=>ids.includes(id));
 const hasRoleName=names=>roleNames.some(name=>names.includes(name));

 const isKnownAdminUser=ADMIN_USER_IDS.includes(userId);
 const isOwner=isKnownAdminUser||hasRoleId(OWNER_ROLE_IDS)||hasRoleName(["owner","business owner","app owner","super admin"]);
 const isAdmin=isOwner||hasRoleId(ADMIN_ROLE_IDS)||hasRoleName(["admin","administrator"]);
 return {isOwner:!!user&&isOwner,isAdmin:!!user&&isAdmin};

}
