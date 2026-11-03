import Goal from "../../models/goal/goalModel.js";
import createCrudController from "../utils/createCrudController.js";

const goalController=createCrudController({
 Model:Goal,
 dataKey:"goals",
 defaultSort:{targetDate:1,createdAt:-1}
});

export default goalController;