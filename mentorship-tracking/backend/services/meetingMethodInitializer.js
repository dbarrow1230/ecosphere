import MeetingMethod from "../models/meetingMethodModel.js";

const defaultMeetingMethods=[
 {name:"In Person",description:"Meet together at an agreed physical location."},
 {name:"Phone Call",description:"Meet by telephone voice call."},
 {name:"Zoom",description:"Meet by Zoom video conference."},
 {name:"WhatsApp",description:"Meet using WhatsApp voice, video, or messaging."},
 {name:"Text Message",description:"Communicate by SMS or mobile text message."},
 {name:"Email",description:"Communicate by email."},
 {name:"School Portal",description:"Communicate through the school mentoring portal."},
 {name:"Microsoft Teams",description:"Meet by Microsoft Teams."},
 {name:"Google Meet",description:"Meet by Google Meet video conference."}
];

export const initializeMeetingMethods=async()=>{
 await MeetingMethod.bulkWrite(defaultMeetingMethods.map(method=>({
  updateOne:{
   filter:{name:method.name},
   update:{$setOnInsert:{...method,isActive:true,createdBy:null}},
   upsert:true
  }
 })));
};

export default initializeMeetingMethods;
