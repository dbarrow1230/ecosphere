import {websiteManagementAccess} from "../../../shared/backend/websiteManagementAccess.js";
import RoleAssignment from "../models/users/userRoleAssignmentModel.js";
import {createPublicWebsiteRoutes,publicMoney} from "../../../shared/backend/publicWebsiteRoutes.js";
import {protect} from "../middleware/authMiddleware.js";
import Product from "../models/menu/menuItemsModel.js";
const catalog=async()=>{const now=new Date();const rows=await Product.find({isActive:true}).select("name description price image tags isFeatured availableDays availableMonths availableFrom availableTo").limit(500).lean();return rows.filter(row=>(!row.availableFrom||new Date(row.availableFrom)<=now)&&(!row.availableTo||new Date(row.availableTo)>=now)&&(!row.availableDays?.length||row.availableDays.includes(now.getDay()))&&(!row.availableMonths?.length||row.availableMonths.includes(now.getMonth()+1))).map(row=>({id:String(row._id),name:row.name,description:row.description||"",category:row.tags?.[0]||"Doughnuts",price:publicMoney(row.price),stock:null,image:row.image||"",featured:row.isFeatured}));};
export default createPublicWebsiteRoutes({appKey:"crazy-cravings-alchemy-delight-doughnuts",catalog,protect,authorize:websiteManagementAccess(RoleAssignment)});
