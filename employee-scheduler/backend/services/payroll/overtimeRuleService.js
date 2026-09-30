// backend/services/overtimeRuleService.js
import OvertimeRule from "../../models/time/overtimeRuleModel.js";

export const getActiveOvertimeRule=async({business,department=null,role=null})=>{
 const exactMatch=await OvertimeRule.findOne({
  business,
  isActive:true,
  ...(department?{department}:{}),
  ...(role?{role}:{})
 }).sort({createdAt:-1});

 if(exactMatch)return exactMatch;

 const businessWide=await OvertimeRule.findOne({
  business,
  isActive:true,
  department:null,
  role:null
 }).sort({createdAt:-1});

 return businessWide;
};

export const calculateOvertimeMinutes=({
 totalWorkedMinutes=0,
 dailyWorkedMinutes=0,
 employee=null,
 overtimeRule=null
})=>{
 const workedMinutes=Number(totalWorkedMinutes||0);
 const workedDailyMinutes=Number(dailyWorkedMinutes||workedMinutes);

 if(!employee){
  return {
   regularWorkedMinutes:workedMinutes,
   overtimeMinutes:0,
   approvedOvertimeMinutes:0,
   overtimeRateMultiplier:0,
   overtimeEligible:false
  };
 }

 if(employee.payType==="salary"||employee.overtimeEligible===false){
  return {
   regularWorkedMinutes:workedMinutes,
   overtimeMinutes:0,
   approvedOvertimeMinutes:0,
   overtimeRateMultiplier:0,
   overtimeEligible:false
  };
 }

 const dailyThreshold=Number(overtimeRule?.dailyOvertimeAfterMinutes||0);
 const weeklyThreshold=Number(overtimeRule?.weeklyOvertimeAfterMinutes||0);
 const multiplier=Number(overtimeRule?.overtimeMultiplier||1.5);

 let overtimeMinutes=0;

 if(dailyThreshold>0&&workedDailyMinutes>dailyThreshold){
  overtimeMinutes=Math.max(overtimeMinutes,workedDailyMinutes-dailyThreshold);
 }

 if(weeklyThreshold>0&&workedMinutes>weeklyThreshold){
  overtimeMinutes=Math.max(overtimeMinutes,workedMinutes-weeklyThreshold);
 }

 overtimeMinutes=Math.max(0,overtimeMinutes);

 return {
  regularWorkedMinutes:Math.max(0,workedMinutes-overtimeMinutes),
  overtimeMinutes,
  approvedOvertimeMinutes:overtimeMinutes,
  overtimeRateMultiplier:multiplier,
  overtimeEligible:true
 };
};

export default {
 getActiveOvertimeRule,
 calculateOvertimeMinutes
};