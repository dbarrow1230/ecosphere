import LifeArea from "../../models/lifeArea/lifeAreaModel.js";
import createCrudController from "../utils/createCrudController.js";

const lifeAreaController=createCrudController({
 Model:LifeArea,
 dataKey:"lifeAreas",
 defaultSort:{sortOrder:1,name:1}
});

export default lifeAreaController;