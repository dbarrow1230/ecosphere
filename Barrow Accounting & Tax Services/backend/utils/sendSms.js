// backend/utils/sendSms.js
import twilio from "twilio";

const client=twilio(process.env.TWILIO_SID,process.env.TWILIO_AUTH_TOKEN);

export const sendSms=async({to,body})=>{
	await client.messages.create({
		body,
		from:process.env.TWILIO_PHONE,
		to
	});
};