//backend/jobs/noaa.js
import cron from 'node-cron';
import WeatherDaily from '../models/weather/WeatherDailyModel.js';
import FrostSeason from '../models/weather/FrostSeasonModel.js';
import User from '../models/users/userModel.js';

const getZips=async()=>{
	const zips=await User.distinct('zip');
	return zips.filter(Boolean);
};

const fetchNOAA=async(zip)=>{
	const res=await fetch(`https://api.weather.gov/points/39.9526,-75.1652`);
	if(!res.ok)throw new Error('NOAA fetch failed');

	const data=await res.json();

	return{
		date:new Date().toISOString().split('T')[0],
		tempMin:0,
		tempMax:0,
		precip:0,
		conditions:data?.properties?.forecast||''
	};
};

const isFrost=tempMin=>tempMin<=32;

export const runDailyWeather=async()=>{
	const zips=await getZips();

	for(const zip of zips){
		try{
			const weather=await fetchNOAA(zip);

			await WeatherDaily.findOneAndUpdate(
				{zip,date:weather.date},
				{
					zip,
					date:weather.date,
					tempMin:weather.tempMin,
					tempMax:weather.tempMax,
					precip:weather.precip,
					conditions:weather.conditions,
					isFrost:isFrost(weather.tempMin)
				},
				{upsert:true,returnDocument:"after"}
			);
		}catch(err){
			console.error('NOAA daily error',zip,err.message);
		}
	}
};

export const runYearlyFrost=async(year=new Date().getFullYear())=>{
	const zips=await getZips();

	for(const zip of zips){
		try{
			const records=await WeatherDaily.find({
				zip,
				date:{
					$gte:`${year}-01-01`,
					$lte:`${year}-12-31`
				}
			}).sort({date:1});

			let lastFrost=null;
			let firstFrost=null;

			for(const r of records){
				if(r.isFrost){
					const month=parseInt(r.date.split('-')[1]);
					if(month<=6)lastFrost=r.date;
					if(month>=7&&!firstFrost)firstFrost=r.date;
				}
			}

			await FrostSeason.findOneAndUpdate(
				{zip,year},
				{zip,year,lastFrost,firstFrost},
				{upsert:true,returnDocument:"after"}
			);
		}catch(err){
			console.error('Frost calc error',zip,err.message);
		}
	}
};

export const startNOAAJobs=()=>{
	cron.schedule('0 2 * * *',async()=>{
		console.log('Running NOAA daily weather job');
		await runDailyWeather();
	});

	cron.schedule('0 3 2 1 *',async()=>{
		console.log('Running NOAA yearly frost job');
		await runYearlyFrost();
	});
};