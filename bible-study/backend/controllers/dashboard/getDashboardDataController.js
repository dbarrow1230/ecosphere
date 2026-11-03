import getDashboardDataService from "../../services/dashboard/getDashboardDataService.js";

const parseDashboardDate=value=>{
 if(!value)return new Date();

 const text=String(value);
 const match=text.match(/^(\d{4})-(\d{2})-(\d{2})$/);

 if(match){
  return new Date(Number(match[1]),Number(match[2])-1,Number(match[3]));
 }

 const parsed=new Date(value);
 return Number.isNaN(parsed.getTime())?new Date():parsed;
};

const getDashboardUser=req=>{
 const userId=req.user?._id||req.query.user||null;
 if(!userId)return null;

 const text=String(userId);
 return /^[a-f\d]{24}$/i.test(text)?text:null;
};

const getDashboardDataController=async(req,res,next)=>{
 try{
  const data=await getDashboardDataService({
   user:getDashboardUser(req),
   period:req.query.period||"month",
   reportDate:parseDashboardDate(req.query.reportDate)
  });

  res.json(data);
 }catch(error){
  next(error);
 }
};

export default getDashboardDataController;
