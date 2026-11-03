//backend/controllers/weather/weatherController.js
import WeatherHourly from '../../models/weather/WeatherHourlyModel.js';
import WeatherDaily from '../../models/weather/WeatherDailyModel.js';
import FrostSeason from '../../models/weather/FrostSeasonModel.js';
import WeatherOutlook from '../../models/weather/WeatherOutlookModel.js';

export const getHourlyWeather=async(req,res,next)=>{
	try{
		const {zip,date}=req.query;
		const filter={};
		if(zip)filter.zip=zip;
		if(date)filter.date=date;
		const data=await WeatherHourly.find(filter).sort({date:1,hour:1});
		res.json({success:true,data});
	}catch(err){next(err);}
};

export const getDailyWeather=async(req,res,next)=>{
	try{
		const {zip,start,end}=req.query;
		const filter={};
		if(zip)filter.zip=zip;
		if(start||end)filter.date={};
		if(start)filter.date.$gte=start;
		if(end)filter.date.$lte=end;
		const data=await WeatherDaily.find(filter).sort({date:1});
		res.json({success:true,data});
	}catch(err){next(err);}
};

export const getFrostSeason=async(req,res,next)=>{
	try{
		const {zip,year}=req.query;
		const filter={};
		if(zip)filter.zip=zip;
		if(year)filter.year=Number(year);
		const data=await FrostSeason.find(filter).sort({year:-1});
		res.json({success:true,data});
	}catch(err){next(err);}
};

export const getWeatherOutlooks=async(req,res,next)=>{
	try{
		const {type,source}=req.query;
		const filter={};
		if(type)filter.type=type;
		if(source)filter.source=source;
		const data=await WeatherOutlook.find(filter).sort({issuedAt:-1});
		res.json({success:true,data});
	}catch(err){next(err);}
};