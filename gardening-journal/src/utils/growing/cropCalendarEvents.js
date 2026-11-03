export const cropActivities=[
 {key:"sowMonths",label:"Sow",className:"crop-event-sow"},
 {key:"plantMonths",label:"Plant",className:"crop-event-plant"},
 {key:"harvestMonths",label:"Harvest",className:"crop-event-harvest"}
];

// These worksheets record recurring monthly windows, not exact sowing dates.
export function buildCropCalendarEvents(rows,year){
 return rows.flatMap(row=>cropActivities.flatMap(activity=>
  [...new Set(row[activity.key]||[])].filter(month=>Number.isInteger(month)&&month>=1&&month<=12).map(month=>({
   id:`${row._id}-${activity.key}-${year}-${month}`,
   title:`${activity.label}: ${row.name}${row.variety?` (${row.variety})`:""}`,
   start:new Date(year,month-1,1),
   end:new Date(year,month,1),
   allDay:true,
   resource:{record:row,activity:activity.key,className:activity.className}
  }))
 ));
}

export function dateForSavedCrop(row,currentDate){
 const months=cropActivities.flatMap(activity=>row[activity.key]||[]).filter(month=>Number.isInteger(month)&&month>=1&&month<=12);
 if(months.includes(currentDate.getMonth()+1)||!months.length)return currentDate;
 return new Date(currentDate.getFullYear(),Math.min(...months)-1,1);
}
