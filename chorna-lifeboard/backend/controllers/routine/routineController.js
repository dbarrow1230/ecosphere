import Routine from "../../models/routine/routineModel.js";
import createCrudController from "../utils/createCrudController.js";

const routineController=createCrudController({
 Model:Routine,
 dataKey:"routines",
 defaultSort:{title:1}
});

export default routineController;