// Shared by the forms and Mongo schema so every editable field persists.
export const travelFields = [
 {name:"title",label:"Trip / entry title",required:true},
 {name:"location",label:"Location / destination"},
 {name:"date",label:"Date",type:"date",required:true},
 {name:"weather",label:"Weather"},
 {name:"moon",label:"Moon phase"},
 {name:"notes",label:"Travel notes",type:"textarea"}
];
export const hikingFields = [
 {name:"title",label:"Hike / trail name",required:true},
 {name:"location",label:"Location"},
 {name:"date",label:"Date",type:"date",required:true},
 {name:"startTime",label:"Start time",type:"time"},
 {name:"endTime",label:"End time",type:"time"},
 {name:"duration",label:"Duration (include units)"},
 {name:"terrain",label:"Terrain"},
 {name:"elevation",label:"Elevation gain / loss (include units)"},
 {name:"distance",label:"Distance (include units)"},
 {name:"gear",label:"Gear",type:"textarea"},
 {name:"foodWater",label:"Food / water",type:"textarea"},
 {name:"facilities",label:"Onsite facilities / water",type:"textarea"},
 {name:"companions",label:"Companions"},
 {name:"trailConditions",label:"Trail conditions",type:"textarea"},
 {name:"weather",label:"Weather"},
 {name:"phoneReception",label:"Phone reception / carrier"},
 {name:"difficulty",label:"Difficulty (1–5)",type:"number",min:1,max:5},
 {name:"rating",label:"Overall rating (1–5)",type:"number",min:1,max:5},
 {name:"notes",label:"Notes",type:"textarea"}
];
export const logFields = {travel:travelFields,hiking:hikingFields};
