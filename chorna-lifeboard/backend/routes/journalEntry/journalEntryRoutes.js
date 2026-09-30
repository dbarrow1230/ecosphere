import createCrudRoutes from "../utils/createCrudRoutes.js";
import journalEntryController from "../../controllers/journalEntry/journalEntryController.js";

const router=createCrudRoutes(journalEntryController);

export default router;