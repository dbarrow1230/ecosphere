// backend/models/BorrowedBookModel.js
import mongoose from "mongoose";

async function generateUniqueSlug(Model,baseSlug,docId=null){
 let slug=baseSlug||"borrowed-book";
 let counter=1;

 while(true){
  const existing=await Model.findOne({
   slug,
   ...(docId?{_id:{$ne:docId}}:{})
  }).select("_id").lean();

  if(!existing)return slug;
  counter+=1;
  slug=`${baseSlug}-${counter}`;
 }
}

const BorrowedBookModelSchema=new mongoose.Schema({
 title:{type:String,trim:true,required:true,index:true},
 subtitle:{type:String,trim:true,default:""},
 slug:{type:String,trim:true,lowercase:true,unique:true,index:true},
 authors:[{type:mongoose.Schema.Types.ObjectId,ref:"Author"}],
 book:{type:mongoose.Schema.Types.ObjectId,ref:"Book",default:null,index:true},

 borrowedFrom:{type:String,trim:true,default:"",index:true},
 borrowSource:{type:mongoose.Schema.Types.ObjectId,ref:"BorrowSource",default:null,index:true},

 format:{type:mongoose.Schema.Types.ObjectId,ref:"Format",default:null},
 fileTypes:[{type:mongoose.Schema.Types.ObjectId,ref:"FileType"}],

 borrowedDate:{type:Date,default:null,index:true},
 dueDate:{type:Date,default:null,index:true},
 returnedDate:{type:Date,default:null,index:true},

 status:{type:String,trim:true,enum:["Borrowed","Returned","Overdue","Auto Returned","Renewed","Lost"],default:"Borrowed",index:true},
 isDigital:{type:Boolean,default:false,index:true},
 autoReturns:{type:Boolean,default:false,index:true},
 renewalCount:{type:Number,default:0,min:0},

 reading:{
  status:{type:String,trim:true,enum:["Unread","Reading","Paused","Finished","Abandoned"],default:"Unread",index:true},
  currentPage:{type:Number,default:0,min:0},
  totalPages:{type:Number,default:0,min:0},
  progressPercent:{type:Number,min:0,max:100,default:0},
  startedAt:{type:Date,default:null},
  finishedAt:{type:Date,default:null},
  lastReadAt:{type:Date,default:null}
 },

 notes:[{type:String,trim:true}]

},{timestamps:true,collection:"borrowed_books",toJSON:{virtuals:true},toObject:{virtuals:true}});

BorrowedBookModelSchema.pre("validate",async function(){
 const baseSlug=(this.title?.trim()||"")
  .toLowerCase()
  .replace(/[^a-z0-9\s-]/g,"")
  .replace(/\s+/g,"-")
  .replace(/-+/g,"-")
  .replace(/^-+|-+$/g,"")||"borrowed-book";

 this.slug=await generateUniqueSlug(this.constructor,baseSlug,this._id);

 this.borrowedFrom=(this.borrowedFrom||"").trim();
 this.status=(this.status||"Borrowed").trim();
 this.renewalCount=Math.max(0,Number(this.renewalCount||0));

 const currentPage=Math.max(0,Number(this.reading?.currentPage||0));
 const totalPages=Math.max(0,Number(this.reading?.totalPages||0));
 if(this.reading){
  this.reading.currentPage=currentPage;
  this.reading.totalPages=totalPages;
  this.reading.progressPercent=totalPages>0?Math.min(100,Math.max(0,Math.round((currentPage/totalPages)*100))):0;
 }

 if(this.returnedDate&&this.borrowedDate&&this.returnedDate<this.borrowedDate){
  throw new Error("returnedDate cannot be before borrowedDate");
 }

 if(this.dueDate&&this.borrowedDate&&this.dueDate<this.borrowedDate){
  throw new Error("dueDate cannot be before borrowedDate");
 }
});

const BorrowedBookModel=mongoose.models.BorrowedBook||mongoose.model("BorrowedBook",BorrowedBookModelSchema);

export default BorrowedBookModel;