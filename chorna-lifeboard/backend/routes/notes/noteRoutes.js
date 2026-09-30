import createCrudRoutes from "../utils/createCrudRoutes.js";
import noteController from "../../controllers/notes/noteController.js";

const router=createCrudRoutes(noteController);

export default router;