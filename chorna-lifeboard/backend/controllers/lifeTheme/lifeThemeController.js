import LifeTheme from "../../models/lifeTheme/lifeThemeModel.js";
import createCrudController from "../utils/createCrudController.js";

const lifeThemeController=createCrudController({
 Model:LifeTheme,
 dataKey:"lifeThemes",
 defaultSort:{startDate:-1}
});

export default lifeThemeController;