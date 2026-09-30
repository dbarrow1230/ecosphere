// backend/services/payStubService.js
import PayStub from "../../models/payroll/payStubModel.js";

export const getPayStubByEmployee=async({business,employee})=>{
 return PayStub.find({business,employee}).sort({payDate:-1});
};

export default {
 getPayStubByEmployee
};