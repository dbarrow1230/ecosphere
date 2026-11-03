import Reminder from "../../models/photography/reminderModel.js";
import Shoot from "../../models/photography/shootModel.js";
import {resourceController} from "./resourceController.js";
const controller=resourceController({Model:Reminder,fields:["title","description","dueAt","shootRef","completed"],populate:["shootRef"],references:{shootRef:{model:Shoot}}});
export const {list:getReminders,get:getReminder,create:createReminder,update:updateReminder,remove:deleteReminder}=controller;
