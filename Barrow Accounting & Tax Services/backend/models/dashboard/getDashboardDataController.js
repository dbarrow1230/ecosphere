import getDashboardDataService from "../../services/dashboard/getDashboardDataService.js";

const getDashboardDataController=async(req,res,next)=>{
 try{
  const data=await getDashboardDataService({
   business_id:req.user?.business_id||req.query.business_id,
   locationRef:req.query.locationRef||null,
   period:req.query.period||"today",
   reportDate:req.query.reportDate?new Date(req.query.reportDate):new Date()
  });

  res.json(data);
 }catch(error){
  next(error);
 }
};

export default getDashboardDataController;