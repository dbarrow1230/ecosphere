import express from 'express';
import {createHourlyWeather, getHourlyWeather,	updateHourlyWeather,	deleteHourlyWeather,	createDailyWeather,	getDailyWeather,	updateDailyWeather,	deleteDailyWeather,	createFrostSeason,	getFrostSeason,	updateFrostSeason,	deleteFrostSeason,	createWeatherOutlook,	getWeatherOutlooks,	updateWeatherOutlook,
	deleteWeatherOutlook} from '../../controllers/weather/weatherController.js';

const router=express.Router();

router.route('/hourly').post(createHourlyWeather).get(getHourlyWeather);
router.route('/hourly/:id').put(updateHourlyWeather).delete(deleteHourlyWeather);

router.route('/daily').post(createDailyWeather).get(getDailyWeather);
router.route('/daily/:id').put(updateDailyWeather).delete(deleteDailyWeather);

router.route('/frost').post(createFrostSeason).get(getFrostSeason);
router.route('/frost/:id').put(updateFrostSeason).delete(deleteFrostSeason);

router.route('/outlooks').post(createWeatherOutlook).get(getWeatherOutlooks);
router.route('/outlooks/:id').put(updateWeatherOutlook).delete(deleteWeatherOutlook);

export default router;