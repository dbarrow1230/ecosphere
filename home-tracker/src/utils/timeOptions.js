export const hourlyTimeOptions=Array.from({length:24},(_,hour)=>{
 const period=hour>=12?"PM":"AM";
 const hour12=hour%12||12;
 return {
  value:`${String(hour).padStart(2,"0")}:00`,
  label:`${hour12}:00 ${period}`
 };
});

export const hourlyTimeLabelOptions=hourlyTimeOptions.map(option=>({
 value:option.label,
 label:option.label
}));
