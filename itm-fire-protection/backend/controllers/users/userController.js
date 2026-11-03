import mongoose from "mongoose";
import User from "../../models/users/userModel.js";
import Role from "../../models/users/userRolesModel.js";
import UserRoleAssignment from "../../models/users/userRoleAssignmentModel.js";
import UserDepartmentAssignment from "../../models/users/userDepartmentAssignmentModel.js";
import State from "../../models/locations/stateModel.js";
import County from "../../models/locations/countyModel.js";
import Country from "../../models/locations/countryModel.js";

const userDetailsPopulate={
 path:"details",
 populate:[
  {path:"state",select:"name abbreviation",model:State,skipInvalidIds:true},
  {path:"county",select:"name",model:County,skipInvalidIds:true},
  {path:"country",select:"name iso2 iso3 phoneCode",model:Country,skipInvalidIds:true}
 ]
};

export const createUser=async(req,res)=>{
 try{
  const {username,email,password,role=null,details=null,isActive=true,lastLogin=null,business=null}=req.body;

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

  if(role)
  {
   const existingRole=await Role.findById(role);

   if(!existingRole)
   {
    return res.status(404).json({success:false,message:"Role not found"});
   }
  }

  const existing=await User.findOne({$or:[{username},{email}]})
   .populate({path:"role",model:Role})
   .populate(userDetailsPopulate);

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
   isActive,
   lastLogin:lastLogin||null
  });

  const createdUser=await User.findById(user._id)
   .populate({path:"role",model:Role})
   .populate(userDetailsPopulate);

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

   const assignments=await UserRoleAssignment.find({business:businessId,isActive:true})
    .populate({path:"role",model:Role})
    .lean();
   const departmentAssignments=await UserDepartmentAssignment.find({business:businessId,isActive:true})
    .populate({path:"role",model:Role})
    .populate({path:"department",populate:{path:"defaultRole",model:Role}})
    .lean();
   const userIds=[...new Set([
    ...assignments.map(assignment=>String(assignment.user)).filter(Boolean),
    ...departmentAssignments.map(assignment=>String(assignment.user)).filter(Boolean)
   ])];

   assignmentByUser=new Map(assignments.map(assignment=>[String(assignment.user),assignment]));
   const departmentAssignmentsByUser=departmentAssignments.reduce((map,assignment)=>{
    const userId=String(assignment.user);
    const current=map.get(userId)||[];
    current.push(assignment);
    map.set(userId,current);
    return map;
   },new Map());
   query={_id:{$in:userIds}};

   const users=await User.find(query)
    .populate({path:"role",model:Role})
    .populate(userDetailsPopulate)
    .sort({createdAt:-1})
    .lean();

   const scopedUsers=users.map(user=>{
    const assignment=assignmentByUser.get(String(user._id));
    const userDepartmentAssignments=departmentAssignmentsByUser.get(String(user._id))||[];
    const departmentAssignment=userDepartmentAssignments.find(item=>item.isPrimary)||userDepartmentAssignments[0]||null;
    return{
     ...user,
     role:assignment?.role||departmentAssignment?.role||departmentAssignment?.department?.defaultRole||user.role||null,
     businessRoleAssignment:assignment||null,
     businessDepartmentAssignment:departmentAssignment,
     businessDepartmentAssignments:userDepartmentAssignments
    };
   });

   return res.status(200).json({
    success:true,
    count:scopedUsers.length,
    data:scopedUsers
   });
  }

  const users=await User.find(query)
   .populate({path:"role",model:Role})
   .populate(userDetailsPopulate)
   .sort({createdAt:-1})
   .lean();

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
   .populate({path:"role",model:Role})
   .populate(userDetailsPopulate);

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
  const {username,email,password,role,details,isActive,lastLogin}=req.body;

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
   .populate({path:"role",model:Role})
   .populate(userDetailsPopulate);

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
