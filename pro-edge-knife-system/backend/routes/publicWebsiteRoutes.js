import {websiteManagementAccess} from "../../../shared/backend/websiteManagementAccess.js";
import RoleAssignment from "../models/users/userRoleAssignmentModel.js";
import {createPublicWebsiteRoutes,publicMoney} from "../../../shared/backend/publicWebsiteRoutes.js";
import {protect} from "../middleware/authMiddleware.js";
import Product from "../models/tierModel.js";
import Knife from "../models/knifeTypeModel.js";
const catalog=async()=>{const rows=await Product.find({isActive:true}).select("name code level shortDescription description basePrice includedItems builtInSharpener allowCustomization").populate("includedItems.knifeTypeRef","name").sort({level:1}).lean();return rows.map(row=>({id:String(row._id),name:row.name,description:row.description||row.shortDescription,category:row.allowCustomization?"Custom collection":"Knife collections",price:publicMoney(row.basePrice),stock:null,image:"",code:row.code,customizable:row.allowCustomization,includedItems:row.includedItems.map(item=>({name:item.knifeTypeRef?.name,quantity:item.quantity})),sharpener:row.builtInSharpener?.mechanism||"",knifeOptions:[]}));};
const options=async()=>{const rows=await Knife.find({isActive:true}).select("name category").lean();return rows.map(row=>({id:String(row._id),name:row.name,category:row.category}));};
export default createPublicWebsiteRoutes({appKey:"pro-edge-knife-system",catalog,protect,authorize:websiteManagementAccess(RoleAssignment),options});
