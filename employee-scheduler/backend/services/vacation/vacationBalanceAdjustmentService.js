// backend/services/vacation/vacationBalanceAdjustmentService.js
import VacationBalance from "../../models/employee/vacationBalanceModel.js";

export const adjustVacationBalance=async({business,employee,timeOffType,year,hours,note=""})=>{
 let balance=await VacationBalance.findOne({
  business,
  employee,
  timeOffType,
  year
 });

 if(!balance){
  balance=await VacationBalance.create({
    business,
    employee,
    timeOffType,
    year
  });
 }

 const amount=Number(hours||0);

 balance.adjustedHours=Number(balance.adjustedHours||0)+amount;
 balance.availableHours=Number(balance.availableHours||0)+amount;
 balance.entries.push({
  date:new Date(),
  type:"adjustment",
  hours:amount,
  referenceType:"manual",
  note
 });

 await balance.save();

 return balance;
};

export default {
 adjustVacationBalance
};