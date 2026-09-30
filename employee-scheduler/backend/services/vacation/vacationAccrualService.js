// backend/services/vacationAccrualService.js
import VacationBalance from "../../models/employee/vacationBalanceModel.js";

export const accrueVacation=async({business,employee,timeOffType,hours,year})=>{
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

 balance.accruedHours+=Number(hours||0);
 balance.availableHours+=Number(hours||0);

 balance.entries.push({
  type:"accrual",
  hours,
  referenceType:"system"
 });

 await balance.save();

 return balance;
};

export default {
 accrueVacation
};