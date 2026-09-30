import Review from "../../models/review/reviewModel.js";
import createCrudController from "../utils/createCrudController.js";

const reviewController=createCrudController({
 Model:Review,
 dataKey:"reviews",
 defaultSort:{periodStart:-1}
});

export default reviewController;