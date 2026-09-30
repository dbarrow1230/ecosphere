export const authorizePermissions=(...permissions)=>{
 return(req,res,next)=>{

  if(!req.user)
  {
   return res.status(401).json({message:"Not authenticated"});
  }

  const userPermissions=Array.isArray(req.user.permissions)?req.user.permissions:[];
  const hasPermission=permissions.some(permission=>userPermissions.includes(permission));

  if(!hasPermission)
  {
   return res.status(403).json({message:"Access denied: insufficient permissions"});
  }

  next();
 };
};
