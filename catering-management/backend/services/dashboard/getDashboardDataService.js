import Event from "../../models/eventModel.js";
import Inventory from "../../models/inventoryModel.js";
import Menu from "../../models/menuModel.js";
import Order from "../../models/orderModel.js";

const toNumber=value=>{
 if(value===null||value===undefined)return 0;
 if(typeof value==="object"&&value.$numberDecimal!==undefined)return Number(value.$numberDecimal)||0;
 return Number(value)||0;
};

const startOfDay=date=>{
 const next=new Date(date);
 next.setHours(0,0,0,0);
 return next;
};

const endOfDay=date=>{
 const next=new Date(date);
 next.setHours(23,59,59,999);
 return next;
};

const getPeriodRange=(period,reportDate)=>{
 const base=new Date(reportDate);
 const end=endOfDay(base);

 if(period==="month"){
  return {
   start:new Date(base.getFullYear(),base.getMonth(),1),
   end
  };
 }

 if(period==="year"){
  return {
   start:new Date(base.getFullYear(),0,1),
   end
  };
 }

 if(period==="week"){
  const start=startOfDay(base);
  start.setDate(base.getDate()-base.getDay());
  return {start,end};
 }

 return {start:startOfDay(base),end};
};

const getDashboardDataService=async({period="month",reportDate=new Date()}={})=>{
 const {start,end}=getPeriodRange(period,reportDate);
 const now=new Date();
 const soon=new Date(now);
 soon.setDate(now.getDate()+14);

 const [
  inventoryItems,
  menus,
  upcomingEvents,
  periodEvents,
  periodOrders,
  recentOrders
 ]=await Promise.all([
  Inventory.find().sort({name:1}).lean(),
  Menu.find().sort({name:1}).lean(),
  Event.find({eventDate:{$gte:startOfDay(now)}}).sort({eventDate:1}).limit(8).lean(),
  Event.find({eventDate:{$gte:start,$lte:end}}).lean(),
  Order.find({createdAt:{$gte:start,$lte:end}}).populate("client event").sort({createdAt:-1}).lean(),
  Order.find().populate("client event").sort({createdAt:-1}).limit(8).lean()
 ]);

 const lowStockItems=inventoryItems.filter(item=>toNumber(item.quantityOnHand)<=toNumber(item.reorderLevel));
 const upcomingSoon=upcomingEvents.filter(event=>event.eventDate&&new Date(event.eventDate)<=soon);
 const revenue=periodOrders.reduce((sum,order)=>sum+toNumber(order.total),0);
 const activeMenus=menus.filter(menu=>menu.status==="active");

 const ordersByCategory=periodOrders.reduce((acc,order)=>{
  const key=order.serviceType||"orders";
  acc[key]=(acc[key]||0)+toNumber(order.total);
  return acc;
 },{});

 const categoryCosts=[
  ...inventoryItems.map(item=>({
   type:"inventory",
   category:item.category||"Uncategorized",
   cost:toNumber(item.quantityOnHand)*toNumber(item.costPerUnit),
   date:item.updatedAt||item.createdAt||new Date()
  })),
  ...Object.entries(ordersByCategory).map(([category,cost])=>({
   type:"orders",
   category,
   cost,
   date:end
  }))
 ];

 return {
  period,
  reportDate,
  stats:[
   {label:"Total Items",value:inventoryItems.length},
   {label:"Low Stock",value:lowStockItems.length},
   {label:"Upcoming Events",value:upcomingSoon.length},
   {label:"Categories",value:new Set(inventoryItems.map(item=>item.category).filter(Boolean)).size}
  ],
  summary:{
   inventoryCount:inventoryItems.length,
   lowStockCount:lowStockItems.length,
   menuCount:menus.length,
   activeMenuCount:activeMenus.length,
   eventCount:periodEvents.length,
   orderCount:periodOrders.length,
   revenue
  },
  lowStockItems,
  expiringItems:upcomingSoon,
  recentItems:recentOrders,
  missingItems:lowStockItems,
  categoryCosts
 };
};

export default getDashboardDataService;
