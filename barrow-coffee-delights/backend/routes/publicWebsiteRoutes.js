import {websiteManagementAccess} from "../../../shared/backend/websiteManagementAccess.js";
import RoleAssignment from "../models/users/userRoleAssignmentModel.js";
import {createPublicWebsiteRoutes,publicMoney} from "../../../shared/backend/publicWebsiteRoutes.js";
import {protect} from "../middleware/authMiddleware.js";
import Product from "../models/menu/menuItemModel.js";
import "../models/menu/menuCategoryModel.js";
const catalog=async()=>{const now=new Date();const rows=await Product.find({active:true,showOnPrimaryMenu:true,$and:[{$or:[{startDate:null},{startDate:{$lte:now}}]},{$or:[{endDate:null},{endDate:{$gte:now}}]}]}).select("name description price image category featured").populate("category","name").limit(500).lean();return rows.map(row=>({id:String(row._id),name:row.name,description:row.description||"",category:row.category?.name||"Café menu",price:publicMoney(row.price),stock:null,image:row.image||"",featured:row.featured}));};
export default createPublicWebsiteRoutes({appKey:"barrow-coffee-delights",catalog,protect,authorize:websiteManagementAccess(RoleAssignment)});
