export const albumFields=[
 {name:"name",label:"Album name",required:true,maxLength:200},
 {name:"location",label:"Location",maxLength:500},
 {name:"date",label:"Album date",type:"date"},
 {name:"description",label:"Description",type:"textarea"}
];
export const shootFields=[
 {name:"name",label:"Shoot name",required:true,maxLength:200},
 {name:"client",label:"Client / subject",maxLength:200},
 {name:"startsAt",label:"Starts",type:"datetime-local",required:true},
 {name:"endsAt",label:"Ends",type:"datetime-local"},
 {name:"location",label:"Location",maxLength:500},
 {name:"status",label:"Status",type:"select",options:["planned","completed","cancelled"],default:"planned",required:true},
 {name:"equipmentRefs",label:"Equipment",type:"select",multiple:true},
 {name:"description",label:"Shot list / notes",type:"textarea"}
];
export const equipmentFields=[
 {name:"name",label:"Equipment name",required:true,maxLength:200},
 {name:"type",label:"Type",type:"select",options:["camera","lens","lighting","tripod","accessory"],required:true},
 {name:"brand",label:"Brand",maxLength:200},
 {name:"model",label:"Model",maxLength:200},
 {name:"serialNumber",label:"Serial number",maxLength:200},
 {name:"purchaseDate",label:"Purchase date",type:"date"},
 {name:"purchasePrice",label:"Purchase price",type:"number",min:0,step:"0.01"},
 {name:"description",label:"Notes",type:"textarea"}
];
export const tagFields=[
 {name:"name",label:"Tag name",required:true,maxLength:100},
 {name:"description",label:"Description",type:"textarea"}
];
export const reminderFields=[
 {name:"title",label:"Reminder title",required:true,maxLength:200},
 {name:"dueAt",label:"Due",type:"datetime-local",required:true},
 {name:"shootRef",label:"Related shoot",type:"select"},
 {name:"completed",label:"Completed",type:"checkbox"},
 {name:"description",label:"Notes",type:"textarea"}
];
export const photoFields=[
 {name:"title",label:"Photo title",required:true,maxLength:200},
 {name:"fileUrl",label:"Image URL or uploaded path",required:true,maxLength:2000},
 {name:"takenAt",label:"Taken at",type:"datetime-local"},
 {name:"location",label:"Location",maxLength:500},
 {name:"albumRefs",label:"Albums",type:"select",multiple:true},
 {name:"tagRefs",label:"Tags",type:"select",multiple:true},
 {name:"shootRef",label:"Shoot",type:"select"},
 {name:"cameraRef",label:"Camera",type:"select"},
 {name:"lensRef",label:"Lens",type:"select"},
 {name:"aperture",label:"Aperture",maxLength:40},
 {name:"shutterSpeed",label:"Shutter speed",maxLength:40},
 {name:"iso",label:"ISO",type:"number",min:0,step:1},
 {name:"focalLength",label:"Focal length (mm)",type:"number",min:0,step:"any"},
 {name:"rating",label:"Rating (0–5)",type:"number",min:0,max:5,step:1,default:0,required:true},
 {name:"favorite",label:"Favorite",type:"checkbox"},
 {name:"description",label:"Caption / notes",type:"textarea"}
];
