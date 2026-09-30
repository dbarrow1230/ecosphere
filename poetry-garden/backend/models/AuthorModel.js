import mongoose from "mongoose";

const AuthorModelSchema=new mongoose.Schema({
 firstName:{type:String,trim:true,required:true},
 middleName:{type:String,trim:true,default:""},
 lastName:{type:String,trim:true,required:true},
 displayName:{type:String,trim:true,index:true},
 sortName:{type:String,trim:true},
 slug:{type:String,trim:true,lowercase:true,unique:true,index:true},
 birthDate:{type:Date,default:null},
 deathDate:{type:Date,default:null,validate:{validator:function(v){return !v||!this.birthDate||v>=this.birthDate;},message:"deathDate cannot be before birthDate"}},
 nationality:{type:String,trim:true,default:""},
 languages:[{type:String,trim:true}],
 roles:[{type:String,trim:true}],
 bio:{type:String,trim:true,default:""},
 image:{url:{type:String,trim:true,default:""},alt:{type:String,trim:true,default:""}},
 links:{
  official:{type:String,trim:true,default:""},
  wikipedia:{type:String,trim:true,default:""},
  goodreads:{type:String,trim:true,default:""},
  openLibrary:{type:String,trim:true,default:""}
 },
 notes:[{type:String,trim:true}],
 isActive:{type:Boolean,default:true}
},{timestamps:true,collection:"authors"});

AuthorModelSchema.pre("validate",function(){
 const first=this.firstName?.trim()||"";
 const middle=this.middleName?.trim()||"";
 const last=this.lastName?.trim()||"";

 const full=[first,middle,last].filter(Boolean).join(" ");
 this.displayName=full;
 this.sortName=last?`${last}, ${first}${middle?` ${middle}`:""}`:full;
 this.slug=full
  .toLowerCase()
  .replace(/[^a-z0-9\s-]/g,"")
  .replace(/\s+/g,"-")
  .replace(/-+/g,"-")
  .replace(/^-+|-+$/g,"");
});

AuthorModelSchema.index({displayName:"text",bio:"text",nationality:"text"});
AuthorModelSchema.index({lastName:1,firstName:1});

const AuthorModel=mongoose.connection.models.Author||mongoose.connection.model("Author",AuthorModelSchema);

export default AuthorModel;