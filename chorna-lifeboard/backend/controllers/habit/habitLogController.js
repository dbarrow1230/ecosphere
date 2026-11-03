// backend/controllers/habit/habitLogController.js
import HabitLog from "../../models/habit/habitLogModel.js";
import createCrudController from "../utils/createCrudController.js";

const habitLogController=createCrudController({
 Model:HabitLog,
 dataKey:"habitLogs",
 defaultSort:{logDate:-1,createdAt:-1},
 populate:[
  {path:"habit",select:"title frequency targetCount unit lifeArea category status"}
 ]
});

export default habitLogController;