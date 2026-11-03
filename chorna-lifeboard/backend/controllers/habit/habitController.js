// backend/controllers/habit/habitController.js
import Habit from "../../models/habit/habitModel.js";
import createCrudController from "../utils/createCrudController.js";

const habitController=createCrudController({
 Model:Habit,
 dataKey:"habits",
 defaultSort:{title:1},
 populate:[
  {path:"lifeArea",select:"name description color icon sortOrder isActive"},
  {path:"category",select:"name description categoryType color icon isActive"},
  {path:"tags",select:"name color icon isActive"}
 ]
});

export default habitController;