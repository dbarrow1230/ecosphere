import Milestone from "../../models/goal/milestoneModel.js";
import createCrudController from "../utils/createCrudController.js";

const milestoneController=createCrudController({
 Model:Milestone,
 dataKey:"milestones",
 defaultSort:{milestoneDate:-1}
});

export default milestoneController;