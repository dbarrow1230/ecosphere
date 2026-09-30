// backend/services/dashboard/getDashboardDataService.js
import {
 BeverageItem,
 BeverageVendorItem,
 InventoryBalance,
 InventoryTransaction
} from "../../models/index.js";

const getDashboardDataService=async({business_id,locationRef,period="today",reportDate=new Date()})=>{

 const itemsRaw=await BeverageItem.find({business_id}).lean();

 const balances=await InventoryBalance.find({
  business_id,
  ...(locationRef?{locationRef}:{})
 }).lean();

 const balanceMap={};
 balances.forEach(b=>{
  balanceMap[`${b.beverageItemRef}_${b.locationRef}`]=b;
 });

 const items=itemsRaw.map(item=>{
  const balance=balances.find(b=>String(b.beverageItemRef)===String(item._id));

  return{
   id:item._id,
   name:item.name,
   type:item.type||"",
   stock:balance?.qtyOnHand||0,
   minStock:item.minStock||0,
   maxStock:item.maxStock||0,
   unitCost:balance?.avgCost||0,
   price:item.price||0,
   supplier:item.supplier||"",
   sales:{
    today:0,
    yesterday:0,
    week:0,
    lastWeek:0,
    month:0,
    lastMonth:0,
    trend:[0,0,0,0,0,0,0]
   },
   movement:{
    lastRestock:null,
    lastSale:null,
    avgDaily:0
   },
   reorder:{
    recommended:false,
    pending:false,
    incoming:0,
    leadTimeDays:0,
    nextSuggestedOrderDate:null
   },
   financials:{
    revenueToday:0,
    revenueWeek:0,
    revenueMonth:0,
    stockValue:(balance?.qtyOnHand||0)*(balance?.avgCost||0)
   }
  };
 });

 const summary={
  totalItems:items.length,
  totalStockValue:items.reduce((t,i)=>t+i.financials.stockValue,0),
  totalRevenueToday:0,
  totalRevenueWeek:0,
  totalRevenueMonth:0,
  sales:{
   today:0,
   yesterday:0,
   week:0,
   lastWeek:0,
   month:0,
   lastMonth:0
  },
  alerts:{
   lowStock:items.filter(i=>i.stock>0&&i.stock<i.minStock).length,
   outOfStock:items.filter(i=>i.stock===0).length,
   reorderRecommended:0,
   pendingOrders:0
  },
  performance:{
   topSeller:"",
   slowSeller:"",
   fastestMoving:""
  }
 };

 return{
  meta:{
   reportingDate:reportDate,
   currency:"USD"
  },
  items,
  suppliers:[],
  summary
 };
};

export default getDashboardDataService;