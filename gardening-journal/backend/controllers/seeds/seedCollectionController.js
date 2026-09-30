import mongoose from "mongoose";
import "../../models/users/userModel.js";
import "../../models/seeds/seedModel.js";
import "../../models/vendors/seedVendorModel.js";
import SeedCollection from "../../models/seeds/seedCollectionModel.js";

const collectionStatuses=["collected","stored","planted","archived"];
const collectionSourceTypes=["harvested","store_item","gifted","purchased","traded","saved","other"];

const cleanString=value=>{
	return value===undefined||value===null ? "" : String(value).trim();
};

const cleanStatus=value=>{
	const status=cleanString(value).toLowerCase();
	return collectionStatuses.includes(status) ? status : "collected";
};

const cleanSourceType=value=>{
	const sourceType=cleanString(value).toLowerCase();
	return collectionSourceTypes.includes(sourceType) ? sourceType : "harvested";
};

const cleanColor=value=>{
	const color=cleanString(value);
	return /^#[0-9a-f]{6}$/i.test(color) ? color : "#0f7d4f";
};

const cleanObjectId=value=>{
	if(!value)return null;

	if(typeof value==="string")return mongoose.Types.ObjectId.isValid(value) ? value : null;

	if(typeof value==="object"){
		if(typeof value.$oid==="string")return mongoose.Types.ObjectId.isValid(value.$oid) ? value.$oid : null;
		if(typeof value._id==="string")return mongoose.Types.ObjectId.isValid(value._id) ? value._id : null;
		if(typeof value.id==="string")return mongoose.Types.ObjectId.isValid(value.id) ? value.id : null;
		if(typeof value._id?.$oid==="string")return mongoose.Types.ObjectId.isValid(value._id.$oid) ? value._id.$oid : null;
		if(typeof value.id?.$oid==="string")return mongoose.Types.ObjectId.isValid(value.id.$oid) ? value.id.$oid : null;
	}

	return null;
};

const cleanDate=value=>{
	if(!value)return null;
	const date=new Date(value);
	return Number.isNaN(date.getTime()) ? null : date;
};

const cleanNumber=value=>{
	if(value===""||value===undefined||value===null)return null;
	const number=Number(value);
	return Number.isFinite(number) ? number : null;
};

const cleanNotes=value=>{
	if(Array.isArray(value)){
		return value.map(cleanString).filter(Boolean);
	}

	const note=cleanString(value);
	return note ? [note] : [];
};

const cleanCollectionData=data=>({
	seed:cleanObjectId(data.seed),
	dateCollected:cleanDate(data.dateCollected),
	seedCount:cleanNumber(data.seedCount),
	amountUnit:cleanString(data.amountUnit)||"seeds",
	sourceType:cleanSourceType(data.sourceType),
	sourceName:cleanString(data.sourceName),
	vendor:cleanObjectId(data.vendor),
	labelColor:cleanColor(data.labelColor),
	notes:cleanNotes(data.notes),
	status:cleanStatus(data.status)
});

const populateCollection=query=>{
	return query
		.populate("seed","plantName coverImage lotNumber packedFor")
		.populate("vendor","name companyName")
		.populate("user","username email");
};

export const createSeedCollection=async(req,res)=>{
	try{
		const data=cleanCollectionData(req.body);
		const userId=cleanObjectId(req.body.user||req.user?._id||req.user?.id);

		if(!data.seed)return res.status(400).json({message:"Valid seed id is required"});
		if(!userId)return res.status(400).json({message:"Valid user id is required"});

		const collection=new SeedCollection({
			...data,
			user:userId
		});

		const saved=await collection.save();
		const populated=await populateCollection(SeedCollection.findById(saved._id));

		return res.status(201).json(populated);
	}catch(error){
		return res.status(500).json({message:error.message});
	}
};

export const getSeedCollections=async(req,res)=>{
	try{
		const query={};
		const userId=cleanObjectId(req.params.userId||req.query.user);
		const seedId=cleanObjectId(req.query.seed);

		if(req.params.userId||req.query.user){
			if(!userId)return res.status(400).json({message:"Invalid user id"});
			query.user=userId;
		}

		if(req.query.seed){
			if(!seedId)return res.status(400).json({message:"Invalid seed id"});
			query.seed=seedId;
		}

		if(req.query.status){
			query.status=cleanStatus(req.query.status);
		}

		const collections=await populateCollection(SeedCollection.find(query)).sort({dateCollected:-1,createdAt:-1});

		return res.status(200).json(collections);
	}catch(error){
		return res.status(500).json({message:error.message});
	}
};

export const getSeedCollectionById=async(req,res)=>{
	try{
		const id=cleanObjectId(req.params.id);

		if(!id)return res.status(400).json({message:"Invalid collection id"});

		const collection=await populateCollection(SeedCollection.findById(id));

		if(!collection)return res.status(404).json({message:"Seed collection record not found"});

		return res.status(200).json(collection);
	}catch(error){
		return res.status(500).json({message:error.message});
	}
};

export const updateSeedCollection=async(req,res)=>{
	try{
		const id=cleanObjectId(req.params.id);

		if(!id)return res.status(400).json({message:"Invalid collection id"});

		const collection=await SeedCollection.findById(id);

		if(!collection)return res.status(404).json({message:"Seed collection record not found"});

		const data=cleanCollectionData(req.body);
		const userId=req.body.user!==undefined ? cleanObjectId(req.body.user) : null;

		if(!data.seed)return res.status(400).json({message:"Valid seed id is required"});
		if(req.body.user!==undefined&&req.body.user&&!userId)return res.status(400).json({message:"Invalid user id"});

		Object.keys(data).forEach(key=>{
			collection[key]=data[key];
		});

		if(userId)collection.user=userId;

		const updated=await collection.save();
		const populated=await populateCollection(SeedCollection.findById(updated._id));

		return res.status(200).json(populated);
	}catch(error){
		return res.status(500).json({message:error.message});
	}
};

export const deleteSeedCollection=async(req,res)=>{
	try{
		const id=cleanObjectId(req.params.id);

		if(!id)return res.status(400).json({message:"Invalid collection id"});

		const collection=await SeedCollection.findByIdAndDelete(id);

		if(!collection)return res.status(404).json({message:"Seed collection record not found"});

		return res.status(200).json({message:"Seed collection record deleted successfully"});
	}catch(error){
		return res.status(500).json({message:error.message});
	}
};
