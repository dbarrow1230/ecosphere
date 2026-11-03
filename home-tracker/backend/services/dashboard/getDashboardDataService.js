import HomeItem from "../../models/home/homeItemModel.js";
import HomeCategory from "../../models/home/homeCategoryModel.js";
import HomeLocation from "../../models/home/homeLocationModel.js";
import Task from "../../models/tasks/taskModel.js";

const getDashboardDataService=async({business_id=null,locationRef=null,period="today",reportDate=new Date()}={})=>{
 const filter=business_id?{business:business_id}:{};
 const itemFilter={...filter,...(locationRef?{location:locationRef}:{})};
 const [records,categories,locations,tasks]=await Promise.all([
  HomeItem.find(itemFilter).populate("category").populate("location").sort({name:1}).lean(),
  HomeCategory.find(filter).sort({name:1}).lean(),
  HomeLocation.find(filter).sort({name:1}).lean(),
  Task.find(filter).sort({dueDate:1,name:1}).lean()
 ]);
 // Keep reference IDs for updates while exposing display labels to the dashboard.
 const items=records.map(item=>({...item,
  categoryId:item.category?._id||null,locationId:item.location?._id||null,
  category:item.category?.name||"Uncategorized",location:item.location?.name||"Unassigned"
 }));
 const active=items.filter(item=>!["used","discarded"].includes(item.status));
 const lowStockItems=active.filter(item=>item.minimumQuantity>0&&item.quantity<=item.minimumQuantity);
 const start=new Date();
 start.setUTCHours(0,0,0,0);
 const end=new Date(start);
 end.setDate(end.getDate()+30);
 const expiringItems=active.filter(item=>item.expirationDate&&new Date(item.expirationDate)>=start&&new Date(item.expirationDate)<=end)
  .sort((a,b)=>new Date(a.expirationDate)-new Date(b.expirationDate));
 const missingItems=items.filter(item=>item.shoppingList||item.status==="needed"||item.quantity===0);
 const recentItems=[...items].sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)).slice(0,5);
 const completedTasks=tasks.filter(task=>["Done","Completed"].includes(task.status)).length;
 return {
  business_id,locationRef,period,reportDate,
  summary:{totalItems:items.length,totalCategories:categories.length,totalLocations:locations.length,
   totalTasks:tasks.length,completedTasks,pendingTasks:tasks.length-completedTasks},
  stats:[{label:"Total Items",value:items.length},{label:"Low Stock",value:lowStockItems.length},
   {label:"Expiring Soon",value:expiringItems.length},{label:"Categories",value:categories.length}],
  items,categories,locations,tasks,lowStockItems,expiringItems,missingItems,recentItems,
  categoryCosts:items.map(item=>({category:item.category,type:item.storageType==="household"?"household":"pantry",
   cost:item.cost,date:item.purchaseDate||item.createdAt}))
 };
};
export default getDashboardDataService;
