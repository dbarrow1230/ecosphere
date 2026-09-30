import dayjs from "dayjs";

export const toDateValue=value=>{
 if(!value)return "";
 const date=dayjs(value);
 return date.isValid()?date.format("YYYY-MM-DD"):"";
};

export const toDateObject=value=>{
 if(!value)return null;
 const date=dayjs(value);
 return date.isValid()?date:null;
};

export const muiDatePickerSlotProps={
 textField:{
  fullWidth:true,
  size:"small",
  placeholder:"MM/DD/YYYY",
  className:"app-mui-date-picker-field"
 },
 actionBar:{
  actions:["today","clear","accept"]
 }
};

export const requiredMuiDatePickerSlotProps={
 ...muiDatePickerSlotProps,
 textField:{
  ...muiDatePickerSlotProps.textField,
  required:true
 }
};
