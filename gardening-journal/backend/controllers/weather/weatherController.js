import WeatherHourly from '../../models/weather/WeatherHourlyModel.js';
import WeatherDaily from '../../models/weather/WeatherDailyModel.js';
import FrostSeason from '../../models/weather/FrostSeasonModel.js';
import WeatherOutlook from '../../models/weather/WeatherOutlookModel.js';

export const createHourlyWeather=async(req,res,next)=>{
	try{
		const data=await WeatherHourly.create(req.body);
		res.status(201).json({success:true,data});
	}catch(err){next(err);}
};

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

export const updateHourlyWeather=async(req,res,next)=>{
	try{
		const data=await WeatherHourly.findByIdAndUpdate(req.params.id,req.body,{returnDocument:"after",runValidators:true});
		if(!data)return res.status(404).json({success:false,message:'Hourly weather not found'});
		res.json({success:true,data});
	}catch(err){next(err);}
};

export const deleteHourlyWeather=async(req,res,next)=>{
	try{
		const data=await WeatherHourly.findByIdAndDelete(req.params.id);
		if(!data)return res.status(404).json({success:false,message:'Hourly weather not found'});
		res.json({success:true,message:'Hourly weather deleted'});
	}catch(err){next(err);}
};

export const createDailyWeather=async(req,res,next)=>{
	try{
		const data=await WeatherDaily.create(req.body);
		res.status(201).json({success:true,data});
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

export const updateDailyWeather=async(req,res,next)=>{
	try{
		const data=await WeatherDaily.findByIdAndUpdate(req.params.id,req.body,{returnDocument:"after",runValidators:true});
		if(!data)return res.status(404).json({success:false,message:'Daily weather not found'});
		res.json({success:true,data});
	}catch(err){next(err);}
};

export const deleteDailyWeather=async(req,res,next)=>{
	try{
		const data=await WeatherDaily.findByIdAndDelete(req.params.id);
		if(!data)return res.status(404).json({success:false,message:'Daily weather deleted'});
		res.json({success:true,message:'Daily weather deleted'});
	}catch(err){next(err);}
};

export const createFrostSeason=async(req,res,next)=>{
	try{
		const data=await FrostSeason.create(req.body);
		res.status(201).json({success:true,data});
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

export const updateFrostSeason=async(req,res,next)=>{
	try{
		const data=await FrostSeason.findByIdAndUpdate(req.params.id,req.body,{returnDocument:"after",runValidators:true});
		if(!data)return res.status(404).json({success:false,message:'Frost season not found'});
		res.json({success:true,data});
	}catch(err){next(err);}
};

export const deleteFrostSeason=async(req,res,next)=>{
	try{
		const data=await FrostSeason.findByIdAndDelete(req.params.id);
		if(!data)return res.status(404).json({success:false,message:'Frost season not found'});
		res.json({success:true,message:'Frost season deleted'});
	}catch(err){next(err);}
};

export const createWeatherOutlook=async(req,res,next)=>{
	try{
		const data=await WeatherOutlook.create(req.body);
		res.status(201).json({success:true,data});
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

export const updateWeatherOutlook=async(req,res,next)=>{
	try{
		const data=await WeatherOutlook.findByIdAndUpdate(req.params.id,req.body,{returnDocument:"after",runValidators:true});
		if(!data)return res.status(404).json({success:false,message:'Weather outlook not found'});
		res.json({success:true,data});
	}catch(err){next(err);}
};

export const deleteWeatherOutlook=async(req,res,next)=>{
	try{
		const data=await WeatherOutlook.findByIdAndDelete(req.params.id);
		if(!data)return res.status(404).json({success:false,message:'Weather outlook not found'});
		res.json({success:true,message:'Weather outlook deleted'});
	}catch(err){next(err);}
};