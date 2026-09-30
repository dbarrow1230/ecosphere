import Donation from "../../models/donnations/DonationModel.js";
import DonorContact from "../../models/donnations/DonorContactModel.js";
import CommunityResource from "../../models/reference/communityResourceModel.js";
import Business from "../../models/reference/businessModel.js";
import InventoryBalance from "../../models/inventory/inventoryBalanceModel.js";
import InventoryLot from "../../models/inventory/inventoryLotModel.js";

const toDateRange=(reportDate,period)=>{
 const date=reportDate instanceof Date&&!Number.isNaN(reportDate.getTime())?reportDate:new Date();
 const start=new Date(date);
 const end=new Date(date);

 if(period==="month"){
  start.setDate(1);
  start.setHours(0,0,0,0);
  end.setMonth(start.getMonth()+1,1);
  end.setHours(0,0,0,0);
  return{start,end};
 }

 if(period==="year"){
  start.setMonth(0,1);
  start.setHours(0,0,0,0);
  end.setFullYear(start.getFullYear()+1,0,1);
  end.setMonth(0,1);
  end.setHours(0,0,0,0);
  return{start,end};
 }

 start.setHours(0,0,0,0);
 end.setDate(start.getDate()+1);
 end.setHours(0,0,0,0);
 return{start,end};
};

const safeQuery=async(fn,fallback)=>{
 try{
  return await fn();
 }catch{
  return fallback;
 }
};

const getDashboardDataService=async({business_id=null,locationRef=null,period="today",reportDate=new Date()}={})=>{
 const {start,end}=toDateRange(reportDate,period);
 const businessFilter=business_id?{business_id}:{};
 const referenceBusinessFilter=business_id?{business:business_id}:{};
 const locationFilter=locationRef?{locationRef}:{};

 const [
  businesses,
  resources,
  donations,
  donorContacts,
  inventoryBalances,
  inventoryLots
 ]=await Promise.all([
  safeQuery(()=>Business.find({}).sort({name:1}).limit(25),[]),
  safeQuery(()=>CommunityResource.find(referenceBusinessFilter).sort({name:1}).limit(25),[]),
  safeQuery(()=>Donation.find({
   ...referenceBusinessFilter,
   createdAt:{$gte:start,$lt:end}
  }).sort({createdAt:-1}).limit(25),[]),
  safeQuery(()=>DonorContact.find(referenceBusinessFilter).sort({createdAt:-1}).limit(25),[]),
  safeQuery(()=>InventoryBalance.find({...businessFilter,...locationFilter})
   .populate("beverageItemRef")
   .populate("locationRef")
   .sort({updatedAt:-1})
   .limit(25),[]),
  safeQuery(()=>InventoryLot.find({...businessFilter,...locationFilter})
   .populate("beverageItemRef")
   .populate("locationRef")
   .sort({expiryDate:1,updatedAt:-1})
   .limit(25),[])
 ]);

 const donationTotal=donations.reduce((sum,donation)=>{
  const amount=Number(donation?.amount?.$numberDecimal??donation?.amount??0);
  return Number.isNaN(amount)?sum:sum+amount;
 },0);

 return{
  success:true,
  period,
  reportDate,
  range:{start,end},
  counts:{
   businesses:businesses.length,
   communityResources:resources.length,
   donations:donations.length,
   donorContacts:donorContacts.length,
   inventoryBalances:inventoryBalances.length,
   inventoryLots:inventoryLots.length
  },
  summaries:{
   donationTotal
  },
  businesses,
  communityResources:resources,
  donations,
  donorContacts,
  inventoryBalances,
  inventoryLots
 };
};

export default getDashboardDataService;
