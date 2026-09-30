// backend/services/breakRuleService.js

const MINUTES_IN_HOUR=60;

export const applyBreakRule=({scheduledMinutes=0})=>{
 const hours=Number(scheduledMinutes||0)/MINUTES_IN_HOUR;

 if(hours>=8){
  return {
   breaks:[
    {type:"break",minutes:15,paid:true},
    {type:"break",minutes:15,paid:true}
   ],
   totalBreakMinutes:30
  };
 }

 if(hours>0){
  return {
   breaks:[
    {type:"break",minutes:15,paid:true}
   ],
   totalBreakMinutes:15
  };
 }

 return {
  breaks:[],
  totalBreakMinutes:0
 };
};

export default {
 applyBreakRule
};