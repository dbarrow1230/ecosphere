import {websiteManagementAccess} from "../../../shared/backend/websiteManagementAccess.js";
import RoleAssignment from "../models/users/userRoleAssignmentModel.js";
import {createPublicWebsiteRoutes,publicMoney} from "../../../shared/backend/publicWebsiteRoutes.js";
import {protect} from "../middleware/authMiddleware.js";
import Donation from "../models/donnations/DonationModel.js";
import Donor from "../models/donnations/DonorContactModel.js";
const catalog=async()=>[];
const donation=async(payload)=>{const donor=await Donor.findOneAndUpdate({email:payload.email},{$set:{name:payload.name},$setOnInsert:{email:payload.email}},{upsert:true,returnDocument:"after",runValidators:true});return Donation.create({donor:donor._id,amount:payload.amount,frequency:payload.frequency,message:payload.message,status:"pending"});};
export default createPublicWebsiteRoutes({appKey:"from-the-ground-up",catalog,protect,authorize:websiteManagementAccess(RoleAssignment),donation});
