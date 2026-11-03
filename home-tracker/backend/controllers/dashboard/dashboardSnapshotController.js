import DashboardSnapshot from "../../models/dashboard/dashboardSnapshotModel.js";

export const getDashboardSnapshot=async(req,res)=>{
 try{
  const year=parseInt(req.query.year)||new Date().getFullYear();

  const snapshot=await DashboardSnapshot.findOne({year});

  if(!snapshot){
   return res.json({
    year,
    months:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
    progress:new Array(12).fill(0),
    items:[],
    calendar:[],
    photos:[]
   });
  }

  res.json({
   year:snapshot.year,
   months:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
   progress:snapshot.progress||new Array(12).fill(0),
   items:snapshot.items||[],
   calendar:snapshot.calendar||[],
   photos:(snapshot.photos||[]).map(url=>({url}))
  });
 }catch(err){
  console.error(err);
  res.status(500).json({error:err.message});
 }
};

export const createOrUpdateDashboardSnapshot=async(req,res)=>{
 try{
  const {user,location,year,progress,items,calendar,photos}=req.body;

  const snapshot=await DashboardSnapshot.findOneAndUpdate(
   {user,location,year},
   {
    user,
    location,
    year,
    progress,
    items,
    calendar,
    photos,
    lastUpdated:new Date()
   },
   {new:true,upsert:true}
  );

  res.json(snapshot);
 }catch(err){
  console.error(err);
  res.status(500).json({error:err.message});
 }
};

export const deleteDashboardSnapshot=async(req,res)=>{
 try{
  const year=parseInt(req.params.year);

  await DashboardSnapshot.deleteOne({year});

  res.json({message:"Dashboard snapshot deleted"});
 }catch(err){
  console.error(err);
  res.status(500).json({error:err.message});
 }
};