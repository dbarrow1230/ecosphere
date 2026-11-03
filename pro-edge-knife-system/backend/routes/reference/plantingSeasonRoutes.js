import express from 'express';
import {getPlantingSeasons,getPlantingSeasonById,createPlantingSeason,updatePlantingSeason,deletePlantingSeason} from '../../controllers/reference/plantingSeasonController.js';

const router=express.Router();

router.route('/').get(getPlantingSeasons).post(createPlantingSeason);
router.route('/:id').get(getPlantingSeasonById).put(updatePlantingSeason).delete(deletePlantingSeason);

export default router;