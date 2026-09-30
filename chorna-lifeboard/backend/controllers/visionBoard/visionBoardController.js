import VisionBoard from "../../models/visionBoard/visionBoardModel.js";
import createCrudController from "../utils/createCrudController.js";

const visionBoardController=createCrudController({
 Model:VisionBoard,
 dataKey:"visionBoards",
 defaultSort:{updatedAt:-1}
});

export default visionBoardController;