import {websiteManagementAccess} from "../../../shared/backend/websiteManagementAccess.js";
import RoleAssignment from "../models/users/userRoleAssignmentModel.js";
import {createPublicWebsiteRoutes,publicMoney} from "../../../shared/backend/publicWebsiteRoutes.js";
import {protect} from "../middleware/authMiddleware.js";
import Product from "../models/inventoryModel.js";
const catalog=async()=>{const rows=await Product.find({clientRef:null,status:"in-stock",quantityOnHand:{$gt:0}}).select("name category manufacturer modelNumber quantityOnHand").limit(500).lean();return rows.map(row=>({id:String(row._id),name:row.name,description:[row.manufacturer,row.modelNumber].filter(Boolean).join(" · "),category:row.category,price:null,stock:row.quantityOnHand,image:""}));};
export default createPublicWebsiteRoutes({appKey:"itm-fire-protection",catalog,protect,authorize:websiteManagementAccess(RoleAssignment)});
