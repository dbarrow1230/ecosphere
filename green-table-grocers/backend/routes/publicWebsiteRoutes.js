import {websiteManagementAccess} from "../../../shared/backend/websiteManagementAccess.js";
import RoleAssignment from "../models/users/userRoleAssignmentModel.js";
import {createPublicWebsiteRoutes,publicMoney} from "../../../shared/backend/publicWebsiteRoutes.js";
import {protect} from "../middleware/authMiddleware.js";
import Product from "../models/master/productModel.js";
const catalog=async()=>{const rows=await Product.find({status:{$nin:["inactive","draft","archived","discontinued"]}}).select("name category sku price").limit(500).lean();return rows.map(row=>({id:String(row._id),name:row.name,description:"",category:row.category||"Groceries",price:publicMoney(row.price),stock:null,image:"",sku:row.sku}));};
export default createPublicWebsiteRoutes({appKey:"green-table-grocers",catalog,protect,authorize:websiteManagementAccess(RoleAssignment)});
