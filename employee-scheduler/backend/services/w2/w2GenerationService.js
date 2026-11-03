// backend/services/w2/w2GenerationService.js
import W2 from "../../models/payroll/w2Model.js";
import Payroll from "../../models/payroll/payrollModel.js";

export const generateW2=async({business,employee,taxYear})=>{
 const existing=await W2.findOne({business,employee,taxYear});
 if(existing)return existing;

 const yearStart=new Date(taxYear,0,1);
 const yearEnd=new Date(taxYear,11,31,23,59,59,999);

 const payrolls=await Payroll.find({
  business,
  employee,
  payDate:{$gte:yearStart,$lte:yearEnd},
  status:{$in:["processed","paid"]}
 });

 const totalWages=payrolls.reduce((sum,item)=>sum+Number(item.grossPay||0),0);

 return W2.create({
  business,
  employee,
  taxYear,
  payrolls:payrolls.map((item)=>item._id),
  boxes:{
   box1_wages:totalWages,
   box2_federalTax:0,
   box3_socialSecurityWages:totalWages,
   box4_socialSecurityTax:0,
   box5_medicareWages:totalWages,
   box6_medicareTax:0,
   box12_codes:[],
   box14_other:[]
  },
  totalWages,
  totalFederalTax:0,
  totalSocialSecurityTax:0,
  totalMedicareTax:0,
  status:"draft",
  generatedAt:new Date()
 });
};

export default {
 generateW2
};