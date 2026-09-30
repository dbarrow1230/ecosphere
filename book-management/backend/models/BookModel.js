// backend/models/BookModel.js
import mongoose from "mongoose";

async function generateUniqueSlug(Model,baseSlug,docId=null){
 let slug=baseSlug||"book";
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

const BookModelSchema=new mongoose.Schema({
 title:{type:String,trim:true,required:true,index:true},
 subtitle:{type:String,trim:true,default:""},
 slug:{type:String,trim:true,lowercase:true,unique:true,index:true},
 edition:{type:String,trim:true,default:""},
 volume:{type:String,trim:true,default:""},
 summary:{type:String,trim:true,default:""},
 authors:{type:[{type:mongoose.Schema.Types.ObjectId,ref:"Author"}],required:true,validate:{validator:function(v){return Array.isArray(v)&&v.length>0;},message:"At least one author is required"}},
 series:{type:mongoose.Schema.Types.ObjectId,ref:"Series",default:null},
 seriesNumber:{type:Number,default:null},
 publishers:[{type:mongoose.Schema.Types.ObjectId,ref:"Publisher"}],
 publication:{
  publishedDate:{type:Date,default:null},
  language:{type:mongoose.Schema.Types.ObjectId,ref:"Language",default:null}
 },

 isbn10:{type:String,trim:true,uppercase:true,default:"",index:true},
 isbn13:{type:String,trim:true,default:"",index:true},
 eisbn:{type:String,trim:true,default:"",index:true},
 asin:{type:String,trim:true,uppercase:true,default:"",index:true},
 customId:{type:String,trim:true,default:"",index:true},
 identifierNotes:{type:String,trim:true,default:""},

 cost:{type:Number,default:null,min:0},
 currency:{type:String,trim:true,uppercase:true,default:"USD"},
 acquisitionSource:{type:mongoose.Schema.Types.ObjectId,ref:"AcquisitionSource",default:null,index:true},
 acquisitionMethod:{type:mongoose.Schema.Types.ObjectId,ref:"AcquisitionMethod",default:null,index:true},
 acquisitionNotes:{type:String,trim:true,default:""},

 formats:[{type:mongoose.Schema.Types.ObjectId,ref:"Format"}],
 formatPrices:[{
  format:{type:mongoose.Schema.Types.ObjectId,ref:"Format",required:true},
  price:{type:Number,default:null,min:0},
  currency:{type:String,trim:true,uppercase:true,default:"USD"}
 }],
 duration:{
  hours:{type:Number,default:0,min:0},
  minutes:{type:Number,default:0,min:0,max:59}
 },
 fileTypes:[{type:mongoose.Schema.Types.ObjectId,ref:"FileType"}],
 purchaseDate:{type:Date,default:null},
 genres:[{type:mongoose.Schema.Types.ObjectId,ref:"Genre"}],
 tags:[{type:String,trim:true}],
 subjects:[{type:String,trim:true}],

 images:[{type:String,trim:true,default:""}],

 condition:{type:String,trim:true,enum:["New","Like New","Very Good","Good","Fair","Poor","Damaged"],default:"New"},

 reading:{
  status:{type:String,trim:true,enum:["Unread","Reading","Paused","Finished","Abandoned"],default:"Unread",index:true},
  currentPage:{type:Number,default:0,min:0},
  totalPages:{type:Number,default:0,min:0},
  progressPercent:{type:Number,min:0,max:100,default:0},
  startedAt:{type:Date,default:null},
  finishedAt:{type:Date,default:null},
  lastReadAt:{type:Date,default:null}
 },

 rating:{
  average:{type:Number,min:0,max:5,default:null},
  personal:{type:Number,min:0,max:5,default:null}
 },

 notes:[{type:String,trim:true}]

},{timestamps:true,collection:"books",toJSON:{virtuals:true},toObject:{virtuals:true}});

BookModelSchema.pre("validate",async function(){
 const baseSlug=(this.title?.trim()||"")
  .toLowerCase()
  .replace(/[^a-z0-9\s-]/g,"")
  .replace(/\s+/g,"-")
  .replace(/-+/g,"-")
  .replace(/^-+|-+$/g,"")||"book";

 this.slug=await generateUniqueSlug(this.constructor,baseSlug,this._id);

 this.isbn10=(this.isbn10||"").toUpperCase().replace(/[^0-9X]/g,"");
 this.isbn13=(this.isbn13||"").replace(/[^0-9]/g,"");
 this.eisbn=(this.eisbn||"").replace(/[^0-9]/g,"");
 this.asin=(this.asin||"").toUpperCase().replace(/[^A-Z0-9]/g,"");
 this.customId=(this.customId||"").trim();
 this.identifierNotes=(this.identifierNotes||"").trim();

 this.cost=this.cost===null||this.cost===undefined||this.cost===""?null:Math.max(0,Number(this.cost)||0);
 this.currency=(this.currency||"USD").trim().toUpperCase();
 this.acquisitionNotes=(this.acquisitionNotes||"").trim();

 if(Array.isArray(this.formatPrices)){
  this.formatPrices=this.formatPrices
   .filter(item=>item&&item.format)
   .map(item=>({
    format:item.format,
    price:item.price===null||item.price===undefined||item.price===""?null:Math.max(0,Number(item.price)||0),
    currency:(item.currency||this.currency||"USD").trim().toUpperCase()
   }));
 }

 this.duration={
  hours:Math.max(0,Number(this.duration?.hours||0)),
  minutes:Math.max(0,Math.min(59,Number(this.duration?.minutes||0)))
 };

 const currentPage=Math.max(0,Number(this.reading?.currentPage||0));
 const totalPages=Math.max(0,Number(this.reading?.totalPages||0));
 if(this.reading){
  this.reading.currentPage=currentPage;
  this.reading.totalPages=totalPages;
  this.reading.progressPercent=totalPages>0?Math.min(100,Math.max(0,Math.round((currentPage/totalPages)*100))):0;
 }

 if(this.reading?.finishedAt&&this.reading?.startedAt&&this.reading.finishedAt<this.reading.startedAt){
  throw new Error("finishedAt cannot be before startedAt");
 }
});

const BookModel=mongoose.models.Book||mongoose.model("Book",BookModelSchema);

export default BookModel;