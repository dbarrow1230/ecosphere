import {websiteManagementAccess} from "../../../shared/backend/websiteManagementAccess.js";
import RoleAssignment from "../models/users/userRoleAssignmentModel.js";
import {createPublicWebsiteRoutes,publicMoney} from "../../../shared/backend/publicWebsiteRoutes.js";
import {protect} from "../middleware/authMiddleware.js";
import Product from "../models/products/productsModel.js";
import Status from "../models/reference/statusModel.js";
import Category from "../models/reference/categoryModel.js";
const catalog=async()=>{
 const statuses=await Status.find().select("name code").lean();
 const live=statuses.filter(row=>/^(active|available|published|in-stock)$/i.test(row.code||row.name));
 // Existing records can contain either the saved status reference or its legacy text code.
 const rows=await Product.collection.find({status:{$in:[...live.map(row=>row._id),...live.map(row=>String(row._id)),/^(active|available|published|in-stock)$/i]}}).project({name:1,description:1,shortDescription:1,category:1,price:1,quantity:1,image:1,gallery:1,featured:1,"details.introduction":1}).limit(500).toArray();
 const categories=await Category.find().select("name").lean();const names=new Map(categories.map(row=>[String(row._id),row.name]));
 return rows.map(row=>({id:String(row._id),name:row.name,description:row.shortDescription||row.description||row.details?.introduction||"",category:names.get(String(row.category))||(!/^[a-f0-9]{24}$/i.test(String(row.category||""))?row.category:"")||"Herbal products",price:publicMoney(row.price),stock:Number.isFinite(Number(row.quantity))?Number(row.quantity):null,image:Array.isArray(row.image)?row.image[0]||row.gallery?.[0]||"":row.image||row.gallery?.[0]||"",featured:row.featured}));
};
export default createPublicWebsiteRoutes({appKey:"natures-apothecary",catalog,protect,authorize:websiteManagementAccess(RoleAssignment)});
