import mongoose from "mongoose";
import User from "../../models/users/userModel.js";
import Role from "../../models/users/userRolesModel.js";
import UserRoleAssignment from "../../models/users/userRoleAssignmentModel.js";
import UserDepartmentAssignment from "../../models/users/userDepartmentAssignmentModel.js";
import USDAZones from "../../models/reference/usdaZonesModel.js";
import State from "../../models/locations/stateModel.js";
import County from "../../models/locations/countyModel.js";
import Country from "../../models/locations/countryModel.js";

const detailsPopulate={
 path:"details",
 populate:[
  {path:"state",select:"name abbreviation",model:State},
  {path:"county",select:"name",model:County},
  {path:"country",select:"name iso2 iso3",model:Country}
 ]
};

const buildRoleMap=async roleIds=>{
 const ids=[...new Set(roleIds.map(id=>String(id||"")).filter(id=>mongoose.Types.ObjectId.isValid(id)))];

 if(!ids.length)
 {
  return new Map();
 }

 const roles=await Role.find({_id:{$in:ids}}).lean();
 return new Map(roles.map(role=>[String(role._id),role]));
};

const applyRoleMap=(roleId,roleMap)=>{
 const id=String(roleId||"");
 return roleMap.get(id)||roleId||null;
};

const hydrateAssignmentRoles=(assignment,roleMap)=>{
 if(!assignment)
 {
  return null;
 }

 return{
  ...assignment,
  role:applyRoleMap(assignment.role,roleMap)
 };
};

const hydrateDepartmentAssignmentRoles=(assignment,roleMap)=>{
 if(!assignment)
 {
  return null;
 }

 return{
  ...assignment,
  role:applyRoleMap(assignment.role,roleMap),
  department:assignment.department?{
   ...assignment.department,
   defaultRole:applyRoleMap(assignment.department.defaultRole,roleMap)
  }:assignment.department
 };
};

const loadUsersForList=async query=>{
 try
 {
  return await User.find(query)
   .populate(detailsPopulate)
   .populate({path:"hardinessZone",model:USDAZones})
   .sort({createdAt:-1})
   .lean();
 }
 catch(error)
 {
  console.error("loadUsersForList populate error",error);
  return await User.find(query)
   .select("-details -hardinessZone")
   .sort({createdAt:-1})
   .lean();
 }
};

export const createUser=async(req,res)=>{
 try{
  const {username,email,password,role=null,details=null,hardinessZone=null,isActive=true,lastLogin=null,business=null}=req.body;

  if(!username||!email||!password)
  {
   return res.status(400).json({success:false,message:"Username, email and password are required"});
  }

  if(role!==null&&role!==undefined&&role!==""&&!mongoose.Types.ObjectId.isValid(role))
  {
   return res.status(400).json({success:false,message:"Invalid role id"});
  }

  if(details!==null&&details!==undefined&&details!==""&&!mongoose.Types.ObjectId.isValid(details))
  {
   return res.status(400).json({success:false,message:"Invalid details id"});
  }

  if(hardinessZone!==null&&hardinessZone!==undefined&&hardinessZone!==""&&!mongoose.Types.ObjectId.isValid(hardinessZone))
  {
   return res.status(400).json({success:false,message:"Invalid USDA hardiness zone id"});
  }

  if(role)
  {
   const existingRole=await Role.findById(role);

   if(!existingRole)
   {
    return res.status(404).json({success:false,message:"Role not found"});
   }
  }

  if(hardinessZone)
  {
   const existingZone=await USDAZones.findById(hardinessZone);

   if(!existingZone)
   {
    return res.status(404).json({success:false,message:"USDA hardiness zone not found"});
   }
  }

  const existing=await User.findOne({$or:[{username},{email}]})
   .populate(detailsPopulate)
   .populate({path:"hardinessZone",model:USDAZones});

  if(existing)
  {
   if(!business||!mongoose.Types.ObjectId.isValid(business))
   {
    return res.status(409).json({success:false,message:"Username or email already exists"});
   }

   const [roleAssignment,departmentAssignment]=await Promise.all([
    UserRoleAssignment.findOne({user:existing._id,business,isActive:true}).lean(),
    UserDepartmentAssignment.findOne({user:existing._id,business,isActive:true}).lean()
   ]);

   if(roleAssignment||departmentAssignment)
   {
    return res.status(409).json({success:false,message:"Username or email already exists for this business"});
   }

   return res.status(200).json({
    success:true,
    message:"Existing user found. Add a business assignment to attach this user to the selected business.",
    data:existing
   });
  }

  const user=await User.create({
   username,
   email,
   password,
   role:role||null,
   details:details||null,
   hardinessZone:hardinessZone||null,
   isActive,
   lastLogin:lastLogin||null
  });

  const createdUser=await User.findById(user._id)
   .populate(detailsPopulate)
   .populate({path:"hardinessZone",model:USDAZones});

  return res.status(201).json({
   success:true,
   message:"User created successfully",
   data:createdUser
  });
 }
 catch(error)
 {
  console.error("createUser error",error);
  return res.status(500).json({
   success:false,
   message:"Failed to create user",
   error:error.message
  });
 }
};

export const getUsers=async(req,res)=>{
 try
 {
  const businessId=String(req.query.business||"").trim();
  let query={};
  let assignmentByUser=new Map();

  if(businessId)
  {
   if(!mongoose.Types.ObjectId.isValid(businessId))
   {
    return res.status(400).json({success:false,message:"Invalid business id"});
   }

   const assignments=await UserRoleAssignment.find({business:businessId,isActive:true}).lean();
   const departmentAssignments=await UserDepartmentAssignment.find({business:businessId,isActive:true})
    .populate({path:"department"})
    .lean();

   const roleMap=await buildRoleMap([
    ...assignments.map(assignment=>assignment.role),
    ...departmentAssignments.map(assignment=>assignment.role),
    ...departmentAssignments.map(assignment=>assignment.department?.defaultRole)
   ]);

   assignmentByUser=new Map(assignments.map(assignment=>[String(assignment.user),hydrateAssignmentRoles(assignment,roleMap)]));
   const departmentAssignmentByUser=new Map(departmentAssignments.map(assignment=>[String(assignment.user),hydrateDepartmentAssignmentRoles(assignment,roleMap)]));
   const assignedUserIds=[
    ...new Set([
     ...assignments.map(assignment=>String(assignment.user)),
     ...departmentAssignments.map(assignment=>String(assignment.user))
    ])
   ];

   if(!assignedUserIds.length)
   {
    return res.status(200).json({
     success:true,
     count:0,
     data:[]
    });
   }

   query={_id:{$in:assignedUserIds}};

   const users=await loadUsersForList(query);

   const scopedUsers=users.map(user=>{
    const assignment=assignmentByUser.get(String(user._id));
    const departmentAssignment=departmentAssignmentByUser.get(String(user._id));
    return{
     ...user,
     role:assignment?.role||departmentAssignment?.role||departmentAssignment?.department?.defaultRole||user.role||null,
     businessRoleAssignment:assignment||null,
     businessDepartmentAssignment:departmentAssignment||null
    };
   });

   return res.status(200).json({
    success:true,
    count:scopedUsers.length,
    data:scopedUsers
   });
  }

  const users=await loadUsersForList(query);

  return res.status(200).json({
   success:true,
   count:users.length,
   data:users
  });
 }
 catch(error)
 {
  console.error("getUsers error",error);
  return res.status(500).json({
   success:false,
   message:"Failed to fetch users",
   error:error.message
  });
 }
};

export const getUserById=async(req,res)=>{
 try
 {
  const {id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id))
  {
   return res.status(400).json({success:false,message:"Invalid user id"});
  }

  const user=await User.findOne({_id:id})
   .populate(detailsPopulate)
   .populate({path:"hardinessZone",model:USDAZones});

  if(!user)
  {
   return res.status(404).json({success:false,message:"User not found"});
  }

  return res.status(200).json({
   success:true,
   data:user
  });
 }
 catch(error)
 {
  console.error("getUserById error",error);
  return res.status(500).json({
   success:false,
   message:"Failed to fetch user",
   error:error.message
  });
 }
};

export const updateUser=async(req,res)=>{
 try
 {
  const {id}=req.params;
  const {username,email,password,role,details,hardinessZone,isActive,lastLogin}=req.body;

  if(!mongoose.Types.ObjectId.isValid(id))
  {
   return res.status(400).json({success:false,message:"Invalid user id"});
  }

  if(role!==undefined&&role!==null&&role!==""&&!mongoose.Types.ObjectId.isValid(role))
  {
   return res.status(400).json({success:false,message:"Invalid role id"});
  }

  if(details!==undefined&&details!==null&&details!==""&&!mongoose.Types.ObjectId.isValid(details))
  {
   return res.status(400).json({success:false,message:"Invalid details id"});
  }

  if(hardinessZone!==undefined&&hardinessZone!==null&&hardinessZone!==""&&!mongoose.Types.ObjectId.isValid(hardinessZone))
  {
   return res.status(400).json({success:false,message:"Invalid USDA hardiness zone id"});
  }

  const user=await User.findById(id).select("+password");

  if(!user)
  {
   return res.status(404).json({success:false,message:"User not found"});
  }

  if(username!==undefined&&username!==user.username)
  {
   const existingUsername=await User.findOne({username,_id:{$ne:id}});

   if(existingUsername)
   {
    return res.status(409).json({success:false,message:"Username already exists"});
   }

   user.username=username;
  }

  if(email!==undefined&&email!==user.email)
  {
   const existingEmail=await User.findOne({email,_id:{$ne:id}});

   if(existingEmail)
   {
    return res.status(409).json({success:false,message:"Email already exists"});
   }

   user.email=email;
  }

  if(typeof password==="string"&&password.trim())
  {
   user.password=password;
  }

  if(role!==undefined)
  {
   if(role===null||role==="")
   {
    user.role=null;
   }
   else
   {
    const existingRole=await Role.findById(role);

    if(!existingRole)
    {
     return res.status(404).json({success:false,message:"Role not found"});
    }

    user.role=role;
   }
  }

  if(details!==undefined)
  {
   user.details=details||null;
  }

  if(hardinessZone!==undefined)
  {
   if(hardinessZone===null||hardinessZone==="")
   {
    user.hardinessZone=null;
   }
   else
   {
    const existingZone=await USDAZones.findById(hardinessZone);

    if(!existingZone)
    {
     return res.status(404).json({success:false,message:"USDA hardiness zone not found"});
    }

    user.hardinessZone=hardinessZone;
   }
  }

  if(isActive!==undefined)
  {
   user.isActive=isActive;
  }

  if(lastLogin!==undefined)
  {
   user.lastLogin=lastLogin||null;
  }

  await user.save({validateModifiedOnly:true});

  const updatedUser=await User.findById(id)
   .populate(detailsPopulate)
   .populate({path:"hardinessZone",model:USDAZones});

  return res.status(200).json({
   success:true,
   message:"User updated successfully",
   data:updatedUser
  });
 }
 catch(error)
 {
  console.error("updateUser error",{
   message:error.message,
   name:error.name,
   code:error.code,
   errors:error.errors,
   stack:error.stack,
   body:req.body,
   params:req.params
  });

  return res.status(500).json({
   success:false,
   message:"Failed to update user",
   error:error.message
  });
 }
};

export const deleteUser=async(req,res)=>{
 try
 {
  const {id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id))
  {
   return res.status(400).json({success:false,message:"Invalid user id"});
  }

  const user=await User.findByIdAndDelete(id);

  if(!user)
  {
   return res.status(404).json({success:false,message:"User not found"});
  }

  return res.status(200).json({
   success:true,
   message:"User deleted successfully"
  });
 }
 catch(error)
 {
  console.error("deleteUser error",error);
  return res.status(500).json({
   success:false,
   message:"Failed to delete user",
   error:error.message
  });
 }
};
