// backend/models/LoanModel.js
import mongoose from "mongoose";

const LOAN_PERIOD_DAYS={default:14,children:7,reference:3,audiobook:14,ebook:14};

const LoanModelSchema=new mongoose.Schema({

 book:{type:mongoose.Schema.Types.ObjectId,ref:"Book",required:true,index:true},
 contact:{type:mongoose.Schema.Types.ObjectId,ref:"Contact",required:true,index:true},

 lentAt:{type:Date,default:Date.now,required:true,index:true},
 loanRule:{type:String,trim:true,enum:["default","children","reference","audiobook","ebook"],default:"default"},
 loanDays:{type:Number,default:null,min:1},
 dueAt:{type:Date,default:null,index:true},
 returnedAt:{type:Date,default:null,validate:{validator:function(v){return !v||!this.lentAt||v>=this.lentAt;},message:"returnedAt cannot be before lentAt"}},

 conditionOut:{type:String,trim:true,enum:["new","like new","very good","good","fair","poor","damaged"],default:"good"},
 conditionIn:{type:String,trim:true,enum:["new","like new","very good","good","fair","poor","damaged"],default:"good"},

 status:{type:String,trim:true,enum:["active","returned","overdue"],default:"active",index:true},
 notes:[{type:String,trim:true}]

},{timestamps:true,collection:"loans",toJSON:{virtuals:true},toObject:{virtuals:true}});

LoanModelSchema.pre("validate",async function(){
 const days=LOAN_PERIOD_DAYS[this.loanRule]||LOAN_PERIOD_DAYS.default;
 this.loanDays=days;

 if(this.lentAt){
  const lentDate=new Date(this.lentAt);
  if(!Number.isNaN(lentDate.getTime())){
   this.dueAt=new Date(lentDate.getTime()+(days*86400000));
  }else{
   this.dueAt=null;
  }
 }else{
  this.dueAt=null;
 }

 if(this.returnedAt){
  this.status="returned";
 }else if(this.dueAt&&new Date()>this.dueAt){
  this.status="overdue";
 }else{
  this.status="active";
 }

 if(this.book){
  const existing=await this.constructor.findOne({
   _id:{$ne:this._id},
   book:this.book,
   returnedAt:null
  }).select("_id").lean();

  if(existing)throw new Error("This book already has an active loan");
 }
});

LoanModelSchema.virtual("daysOut").get(function(){
 if(!this.lentAt)return 0;
 const end=this.returnedAt||new Date();
 return Math.max(0,Math.ceil((end-this.lentAt)/86400000));
});

LoanModelSchema.virtual("isOverdue").get(function(){
 if(this.returnedAt||!this.dueAt)return false;
 return new Date()>this.dueAt;
});

const LoanModel=mongoose.models.Loan||mongoose.model("Loan",LoanModelSchema);

export default LoanModel;
