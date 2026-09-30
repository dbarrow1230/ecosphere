import {useEffect,useMemo,useState} from "react";
import {Alert,Spinner} from "react-bootstrap";
import {Navigate} from "react-router-dom";

const getId=value=>String(value?._id?.$oid||value?._id||value?.$oid||value||"");
const getRoleName=value=>typeof value==="string"?value.trim().toLowerCase():String(value?.name||value?.title||value?.label||"").trim().toLowerCase();

export default function PermissionRoute({user,module,children}){
 const [allowed,setAllowed]=useState(null);
 const roles=useMemo(()=>{
  const assignments=[...(user?.roleAssignments||[]),...(user?.userRoleAssignments||[]),...(user?.assignments||[])].filter(item=>item?.isActive!==false);
  return [user?.role,user?.roleId,...assignments.map(item=>item.role||item.userRole||item.assignedRole)].filter(Boolean);
 },[user]);
 const privileged=roles.map(getRoleName).some(name=>["owner","business owner","app owner","super admin","admin","administrator"].includes(name));

 useEffect(()=>{
  if(!user){setAllowed(false);return;}
  if(privileged){setAllowed(true);return;}
  const userId=getId(user);
  const businessId=getId(user.currentBusiness||user.business||user.businessRef);
  if(!userId||!businessId){setAllowed(false);return;}
  let ignore=false;
  const check=async()=>{
   try{
    const response=await fetch(`/api/users/effective-permissions?user=${encodeURIComponent(userId)}&business=${encodeURIComponent(businessId)}`);
    const data=await response.json();
    const permission=(data.data||[]).find(item=>item.module===module);
    if(!ignore)setAllowed(response.ok&&!!(permission?.read||permission?.admin));
   }catch{if(!ignore)setAllowed(false);}
  };
  check();
  return()=>{ignore=true;};
 },[user,module,privileged]);

 if(!user)return <Navigate to="/login" replace/>;
 if(allowed===null)return <div className="text-center py-5"><Spinner animation="border"/></div>;
 if(!allowed)return <Alert variant="danger" className="m-4">You do not have permission to view this page.</Alert>;
 return children;
}
