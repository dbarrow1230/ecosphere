// backend/services/dashboard/getDashboardDataService.js

const getDashboardDataService=async({
 business_id=null,
 locationRef=null,
 period="today",
 reportDate=new Date()
}={})=>{
 return{
  business_id,
  locationRef,
  period,
  reportDate,
  summary:{
   totalItems:0,
   totalCategories:0,
   totalLocations:0,
   totalTasks:0,
   completedTasks:0,
   pendingTasks:0
  },
  items:[],
  categories:[],
  locations:[],
  tasks:[]
 };
};

export default getDashboardDataService;