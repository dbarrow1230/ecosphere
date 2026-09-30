const roleName=value=>{
 if(!value||typeof value==="string")return "";
 return String(value.name||value.title||value.label||"").trim().toLowerCase();
};

export const getUserRoleNames=user=>{
 const direct=[user?.role,user?.roleId,user?.currentRole,user?.activeRole];
 const assignments=[
  ...(Array.isArray(user?.roleAssignments)?user.roleAssignments:[]),
  ...(Array.isArray(user?.userRoleAssignments)?user.userRoleAssignments:[]),
  ...(Array.isArray(user?.assignments)?user.assignments:[])
 ].filter(assignment=>assignment?.isActive!==false).map(assignment=>assignment.role||assignment.userRole||assignment.assignedRole);
 return [...new Set([...direct,...assignments].map(roleName).filter(Boolean))];
};

export const isTimeClockOnlyUser=user=>getUserRoleNames(user).some(name=>name==="timeclock"||name==="time clock");
