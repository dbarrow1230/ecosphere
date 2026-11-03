// backend/services/shiftService.js
import Shift from "../../models/scheduling/shiftModel.js";
import {applyShiftStatus} from "../shiftStatusService.js";

export const createShift=async(payload)=>{
 const shift=await Shift.create(payload);
 applyShiftStatus(shift);
 await shift.save();
 return shift;
};

export const updateShift=async({shiftId,updates})=>{
 const shift=await Shift.findById(shiftId);
 if(!shift)throw new Error("Shift not found.");

 Object.assign(shift,updates);
 applyShiftStatus(shift);

 await shift.save();
 return shift;
};

export const deleteShift=async({shiftId})=>{
 const shift=await Shift.findByIdAndDelete(shiftId);
 if(!shift)throw new Error("Shift not found.");
 return shift;
};

export default {
 createShift,
 updateShift,
 deleteShift
};