// backend/services/payroll/payrollTaxService.js
export const calculatePayrollTaxes=({grossPay=0,federalRate=0,stateRate=0,localRate=0})=>{
 const gross=Number(grossPay||0);
 const federalTax=gross*Number(federalRate||0);
 const stateTax=gross*Number(stateRate||0);
 const localTax=gross*Number(localRate||0);
 const totalTaxes=federalTax+stateTax+localTax;

 return {
  federalTax,
  stateTax,
  localTax,
  totalTaxes,
  netPay:gross-totalTaxes
 };
};

export default {
 calculatePayrollTaxes
};