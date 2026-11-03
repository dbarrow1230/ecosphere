// /backend/controllers/wishlistController.js
import Wishlist from '../models/wishlistModel.js';

export const createWishlist=async(req,res)=>{
try{
const{name,user,product,store,targetPrice,currentPrice,priority,status,notes}=req.body;
const normalizedName=String(name||'').trim();
if(!normalizedName)return res.status(400).json({success:false,message:'Wishlist item name is required'});
if(user&&product){
const existing=await Wishlist.findOne({user,product});
if(existing)return res.status(409).json({success:false,message:'Wishlist item already exists for this user and product'});
}
const wishlist=await Wishlist.create({
name:normalizedName,
user:user||null,
product:product||null,
store:store||null,
targetPrice,
currentPrice,
priority:priority||null,
status:status||null,
notes
});
res.status(201).json({success:true,message:'Wishlist item created successfully',wishlist});
}catch(error){
res.status(500).json({success:false,message:'Error creating wishlist item',error:error.message});
}
};

export const getWishlists=async(req,res)=>{
try{
const query={};
if(req.query.user)query.user=req.query.user;
if(req.query.product)query.product=req.query.product;
if(req.query.store)query.store=req.query.store;
if(req.query.priority)query.priority=req.query.priority;
if(req.query.status)query.status=req.query.status;
const wishlists=await Wishlist.find(query)
.populate('user')
.populate('product')
.populate('store')
.populate('priority')
.populate('status')
.sort({createdAt:-1});
res.status(200).json({success:true,count:wishlists.length,wishlists});
}catch(error){
res.status(500).json({success:false,message:'Error fetching wishlist items',error:error.message});
}
};

export const getWishlistById=async(req,res)=>{
try{
const wishlist=await Wishlist.findById(req.params.id)
.populate('user')
.populate('product')
.populate('store')
.populate('priority')
.populate('status');
if(!wishlist)return res.status(404).json({success:false,message:'Wishlist item not found'});
res.status(200).json({success:true,wishlist});
}catch(error){
res.status(500).json({success:false,message:'Error fetching wishlist item',error:error.message});
}
};

export const getWishlistsByUser=async(req,res)=>{
try{
const wishlists=await Wishlist.find({user:req.params.userId})
.populate('user')
.populate('product')
.populate('store')
.populate('priority')
.populate('status')
.sort({createdAt:-1});
res.status(200).json({success:true,count:wishlists.length,wishlists});
}catch(error){
res.status(500).json({success:false,message:'Error fetching user wishlist items',error:error.message});
}
};

export const updateWishlist=async(req,res)=>{
try{
const{name,user,product,store,targetPrice,currentPrice,priority,status,notes}=req.body;
const wishlist=await Wishlist.findById(req.params.id);
if(!wishlist)return res.status(404).json({success:false,message:'Wishlist item not found'});
if(name!==undefined){
const normalizedName=String(name||'').trim();
if(!normalizedName)return res.status(400).json({success:false,message:'Wishlist item name is required'});
wishlist.name=normalizedName;
}
const nextUser=user??wishlist.user;
const nextProduct=product??wishlist.product;
if(nextUser&&nextProduct&&(String(nextUser)!==String(wishlist.user)||String(nextProduct)!==String(wishlist.product))){
const existing=await Wishlist.findOne({user:nextUser,product:nextProduct,_id:{$ne:req.params.id}});
if(existing)return res.status(409).json({success:false,message:'Wishlist item already exists for this user and product'});
}
wishlist.user=user!==undefined?(user||null):wishlist.user;
wishlist.product=product!==undefined?(product||null):wishlist.product;
wishlist.store=store!==undefined?(store||null):wishlist.store;
wishlist.targetPrice=targetPrice??wishlist.targetPrice;
wishlist.currentPrice=currentPrice??wishlist.currentPrice;
wishlist.priority=priority!==undefined?(priority||null):wishlist.priority;
wishlist.status=status!==undefined?(status||null):wishlist.status;
wishlist.notes=notes??wishlist.notes;
await wishlist.save();
const updatedWishlist=await Wishlist.findById(wishlist._id)
.populate('user')
.populate('product')
.populate('store')
.populate('priority')
.populate('status');
res.status(200).json({success:true,message:'Wishlist item updated successfully',wishlist:updatedWishlist});
}catch(error){
res.status(500).json({success:false,message:'Error updating wishlist item',error:error.message});
}
};

export const deleteWishlist=async(req,res)=>{
try{
const wishlist=await Wishlist.findById(req.params.id);
if(!wishlist)return res.status(404).json({success:false,message:'Wishlist item not found'});
await Wishlist.findByIdAndDelete(req.params.id);
res.status(200).json({success:true,message:'Wishlist item deleted successfully'});
}catch(error){
res.status(500).json({success:false,message:'Error deleting wishlist item',error:error.message});
}
};
