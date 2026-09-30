import WeatherObservation from "../../models/reference/weatherObservationModel.js";

// CREATE
export const createWeatherObservation=async(req,res)=>{
	try{
		const doc=new WeatherObservation(req.body);
		const saved=await doc.save();
		res.status(201).json(saved);
	}catch(err){
		res.status(500).json({message:err.message});
	}
};

// GET ALL
export const getWeatherObservations=async(req,res)=>{
	try{
		const docs=await WeatherObservation.find().sort({createdAt:-1});
		res.json(docs);
	}catch(err){
		res.status(500).json({message:err.message});
	}
};

// GET ONE
export const getWeatherObservationById=async(req,res)=>{
	try{
		const doc=await WeatherObservation.findById(req.params.id);
		if(!doc)return res.status(404).json({message:"Not found"});
		res.json(doc);
	}catch(err){
		res.status(500).json({message:err.message});
	}
};

// UPDATE
export const updateWeatherObservation=async(req,res)=>{
	try{
		const doc=await WeatherObservation.findByIdAndUpdate(req.params.id,req.body,{returnDocument:"after"});
		if(!doc)return res.status(404).json({message:"Not found"});
		res.json(doc);
	}catch(err){
		res.status(500).json({message:err.message});
	}
};

// DELETE
export const deleteWeatherObservation=async(req,res)=>{
	try{
		const doc=await WeatherObservation.findByIdAndDelete(req.params.id);
		if(!doc)return res.status(404).json({message:"Not found"});
		res.json({message:"Deleted successfully"});
	}catch(err){
		res.status(500).json({message:err.message});
	}
};