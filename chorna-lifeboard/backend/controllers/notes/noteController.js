import Note from "../../models/notes/noteModel.js";
import createCrudController from "../utils/createCrudController.js";

const noteController=createCrudController({
 Model:Note,
 dataKey:"notes",
 defaultSort:{noteDate:-1}
});

export default noteController;