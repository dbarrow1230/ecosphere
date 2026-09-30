import {createContactHandler} from "../../../shared/backend/contactHandler.js";
import {sendContactEmail} from "../services/contactEmailService.js";
export const submitContact=createContactHandler(sendContactEmail);
