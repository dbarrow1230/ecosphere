import mongoose from "mongoose";
import Inventory from "../../models/operations/inventoryModel.js";
import Order from "../../models/operations/orderModel.js";

const getCollectionCount=async(name,filter={})=>{
 const collections=await mongoose.connection.db.listCollections({name},{nameOnly:true}).toArray();
 if(!collections.length)return 0;
 return mongoose.connection.db.collection(name).countDocuments(filter);
};

const getDashboardDataService=async({business_id=null}={})=>{
 const businessFilter=business_id&&mongoose.Types.ObjectId.isValid(business_id)
  ?{$or:[{business:new mongoose.Types.ObjectId(business_id)},{business_id:new mongoose.Types.ObjectId(business_id)}]}
  :{};

 const [orders,inventoryItems,users,recipes,activeOrders,recentOrders,inventoryAlerts]=await Promise.all([
  getCollectionCount("orders",businessFilter),
  getCollectionCount("inventory",businessFilter),
  getCollectionCount("users"),
  getCollectionCount("recipes",businessFilter),
  Order.find({...businessFilter,status:{$in:["pending","confirmed","in-prep"]}})
   .populate("client","name company")
   .sort({createdAt:-1})
   .limit(6)
   .lean(),
  Order.find({...businessFilter,status:"completed"})
   .sort({updatedAt:-1})
   .limit(6)
   .lean(),
  Inventory.find({...businessFilter,status:{$in:["low","out-of-stock"]}})
   .sort({quantityOnHand:1,name:1})
   .limit(6)
   .lean()
 ]);

 return{
  summary:{orders,inventoryItems,users,recipes},
  orders:activeOrders.map(order=>({
    ...order,
    customerName:order.client?.name||order.client?.company||"Kitchen Service"
  })),
  recentOrders,
  inventoryAlerts:inventoryAlerts.map(item=>({
   ...item,
   stockStatus:item.status==="out-of-stock"?"Out of Stock":"Low"
  })),
  users:[],
  recipes:[]
 };
};

export default getDashboardDataService;
