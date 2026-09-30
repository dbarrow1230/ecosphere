// backend/services/availabilityService.js
import Availability from "../../models/scheduling/availabilityModel.js";

export const setAvailability=async({business,employee,weekly=[],overrides=[]})=>{
 let availability=await Availability.findOne({business,employee});

 if(!availability){
  availability=await Availability.create({
   business,
   employee,
   weekly,
   overrides
  });
 }else{
  availability.weekly=weekly;
  availability.overrides=overrides;
  await availability.save();
 }

 return availability;
};

export const getAvailability=async({business,employee})=>{
 return Availability.findOne({business,employee});
};

export default {
 setAvailability,
 getAvailability
};