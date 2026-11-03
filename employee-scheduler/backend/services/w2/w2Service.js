// backend/services/w2Service.js
import W2 from "../../models/payroll/w2Model.js";

export const getW2ByYear=async({business,employee,taxYear})=>{
 return W2.findOne({business,employee,taxYear});
};

export default {
 getW2ByYear
};