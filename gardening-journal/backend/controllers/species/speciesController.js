// backend/controllers/species/speciesController.js
import mongoose from "mongoose";
import Species from "../../models/species/speciesModel.js";
import Family from "../../models/species/familyModel.js";
import Genus from "../../models/species/genusModel.js";

const getId=value=>{
	if(!value)return "";

	if(typeof value==="string"){
		return mongoose.Types.ObjectId.isValid(value) ? value : "";
	}

	if(typeof value==="object"){
		if(typeof value.$oid==="string"&&mongoose.Types.ObjectId.isValid(value.$oid))return value.$oid;
		if(typeof value._id==="string"&&mongoose.Types.ObjectId.isValid(value._id))return value._id;
		if(typeof value.id==="string"&&mongoose.Types.ObjectId.isValid(value.id))return value.id;
		if(typeof value._id?.$oid==="string"&&mongoose.Types.ObjectId.isValid(value._id.$oid))return value._id.$oid;
		if(typeof value.id?.$oid==="string"&&mongoose.Types.ObjectId.isValid(value.id.$oid))return value.id.$oid;
	}

	return "";
};

const cleanString=value=>{
	return value===undefined||value===null ? "" : String(value).trim();
};

const cleanStringArray=value=>{
	if(!Array.isArray(value))return [];
	return value.map(item=>cleanString(item)).filter(Boolean);
};

const getNameValue=value=>{
	if(!value)return "";
	if(typeof value==="string")return cleanString(value);

	if(typeof value==="object"){
		return cleanString(value.name||value.title||value.label||value.value||"");
	}

	return "";
};

const escapeRegex=value=>{
	return String(value).replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
};

const resolveFamily=async value=>{
	if(!value)return null;

	const id=getId(value);

	if(id){
		const existing=await Family.findById(id);
		if(existing)return existing._id;
	}

	const name=getNameValue(value);

	if(!name)return null;

	const family=await Family.findOneAndUpdate(
		{name:new RegExp(`^${escapeRegex(name)}$`,"i")},
		{$setOnInsert:{name}},
		{returnDocument:"after",upsert:true}
	);

	return family._id;
};

const resolveGenus=async(value,familyId=null)=>{
	if(!value)return null;

	const id=getId(value);

	if(id){
		const existing=await Genus.findById(id);

		if(existing){
			if(familyId&&String(existing.family||"")!==String(familyId)){
				existing.family=familyId;
				await existing.save();
			}

			return existing._id;
		}
	}

	const name=getNameValue(value);

	if(!name)return null;

	const genus=await Genus.findOneAndUpdate(
		{name:new RegExp(`^${escapeRegex(name)}$`,"i")},
		{
			$setOnInsert:{name},
			...(familyId ? {$set:{family:familyId}} : {})
		},
		{returnDocument:"after",upsert:true}
	);

	return genus._id;
};

const populateSpecies=query=>{
	return query
		.populate("family","name description")
		.populate("genus","name family description");
};

const cleanSpeciesPayload=async body=>{
	const familyId=await resolveFamily(body.family);
	const genusId=await resolveGenus(body.genus,familyId);

	return {
		family:familyId,
		genus:genusId,
		species:cleanString(body.species),
		botanicalName:cleanString(body.botanicalName),
		commonName:cleanString(body.commonName),
		description:cleanString(body.description),
		synonyms:cleanStringArray(body.synonyms),
		variety:cleanStringArray(body.variety)
	};
};

export const createSpecies=async(req,res)=>{
	try{
		const data=await cleanSpeciesPayload(req.body);

		const species=new Species(data);
		const saved=await species.save();
		const populated=await populateSpecies(Species.findById(saved._id));

		return res.status(201).json(populated);
	}catch(error){
		return res.status(500).json({message:error.message});
	}
};

export const getSpecies=async(req,res)=>{
	try{
		const query={};

		if(req.query.search){
			query.$or=[
				{species:{$regex:req.query.search,$options:"i"}},
				{botanicalName:{$regex:req.query.search,$options:"i"}},
				{commonName:{$regex:req.query.search,$options:"i"}},
				{description:{$regex:req.query.search,$options:"i"}},
				{synonyms:{$regex:req.query.search,$options:"i"}},
				{variety:{$regex:req.query.search,$options:"i"}}
			];
		}

		const species=await populateSpecies(Species.find(query)).sort({species:1,commonName:1,botanicalName:1});

		return res.status(200).json(species);
	}catch(error){
		return res.status(500).json({message:error.message});
	}
};

export const getSpeciesById=async(req,res)=>{
	try{
		const id=getId(req.params.id);

		if(!id){
			return res.status(400).json({message:"Invalid species id"});
		}

		const species=await populateSpecies(Species.findById(id));

		if(!species){
			return res.status(404).json({message:"Species not found"});
		}

		return res.status(200).json(species);
	}catch(error){
		return res.status(500).json({message:error.message});
	}
};

export const updateSpecies=async(req,res)=>{
	try{
		const id=getId(req.params.id);

		if(!id){
			return res.status(400).json({message:"Invalid species id"});
		}

		const data=await cleanSpeciesPayload(req.body);

		const species=await Species.findByIdAndUpdate(
			id,
			{$set:data},
			{returnDocument:"after",runValidators:true}
		);

		if(!species){
			return res.status(404).json({message:"Species not found"});
		}

		const populated=await populateSpecies(Species.findById(species._id));

		return res.status(200).json(populated);
	}catch(error){
		return res.status(500).json({message:error.message});
	}
};

export const updateSpeciesVariety=async(req,res)=>{
	try{
		const id=getId(req.params.id);

		if(!id){
			return res.status(400).json({message:"Invalid species id"});
		}

		const species=await Species.findByIdAndUpdate(
			id,
			{$set:{variety:cleanStringArray(req.body.variety)}},
			{returnDocument:"after",runValidators:true}
		);

		if(!species){
			return res.status(404).json({message:"Species not found"});
		}

		const populated=await populateSpecies(Species.findById(species._id));

		return res.status(200).json(populated);
	}catch(error){
		return res.status(500).json({message:error.message});
	}
};

export const deleteSpecies=async(req,res)=>{
	try{
		const id=getId(req.params.id);

		if(!id){
			return res.status(400).json({message:"Invalid species id"});
		}

		const species=await Species.findByIdAndDelete(id);

		if(!species){
			return res.status(404).json({message:"Species not found"});
		}

		return res.status(200).json({message:"Species deleted successfully"});
	}catch(error){
		return res.status(500).json({message:error.message});
	}
};
