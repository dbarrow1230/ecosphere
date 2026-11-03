//backend/models/planner/bookModel.js
import mongoose from "mongoose";

const bookSchema=new mongoose.Schema({
 business_id:{type:mongoose.Schema.Types.ObjectId,required:true,index:true,ref:"Business"},
 user_id:{type:mongoose.Schema.Types.ObjectId,default:null,index:true,ref:"User"},
 title:{type:String,trim:true,required:true},
 subtitle:{type:String,trim:true,default:""},
genre:{type:String,trim:true,default:""},
 subgenre:{type:String,trim:true,default:""},
 // A book may belong to several main genres. Subgenres remain values
 // embedded in the selected genre catalog records; this stores the
 // selections on the book without creating a separate subgenre collection.
 genres:{type:[String],default:[]},
 subgenres:{type:[String],default:[]},
 genreSubgenres:{type:[{genre:{type:String,trim:true},subgenres:{type:[String],default:[]}}],default:[]},
 status:{type:String,trim:true,default:"Planning"},
 statusHistory:{type:[{status:{type:String,trim:true},revisionNumber:{type:Number,default:0},changedAt:{type:Date,default:Date.now}}],default:[]},
 targetWords:{type:Number,default:80000},
 currentWords:{type:Number,default:0},
 deadline:{type:Date,default:null},
 logline:{type:String,trim:true,default:""},
 notes:{type:String,trim:true,default:""},
 isActive:{type:Boolean,default:true,index:true},
 createdBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null,index:true},
 updatedBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null,index:true}
},{timestamps:true,collection:"books"});

bookSchema.index({business_id:1,isActive:1});
bookSchema.index({business_id:1,user_id:1,isActive:1});

const titleOptionSchema=new mongoose.Schema({
 title:{type:String,trim:true,default:""},
 isChecked:{type:Boolean,default:false}
},{_id:false});

const genreAudienceFitSchema=new mongoose.Schema({
 status:{type:String,trim:true,default:""},
 notes:{type:String,trim:true,default:""}
},{_id:false});

const nameYourStorySchema=new mongoose.Schema({
 business_id:{type:mongoose.Schema.Types.ObjectId,required:true,index:true,ref:"Business"},
 user_id:{type:mongoose.Schema.Types.ObjectId,required:true,index:true,ref:"User"},
 book_id:{type:mongoose.Schema.Types.ObjectId,required:true,index:true,ref:"Book"},
 mainTitle:{type:String,trim:true,default:""},
 tagline:{type:String,trim:true,default:""},
 whyThisTitle:{type:String,trim:true,default:""},
 doesItFitGenreAudience:{type:genreAudienceFitSchema,default:()=>({})},
 workingTitles:{type:[titleOptionSchema],default:[]},
 futureTitleIdeas:{type:[titleOptionSchema],default:[]},
 compareWithOtherTitles:{type:String,trim:true,default:""},
 notes:{type:String,trim:true,default:""},
 isActive:{type:Boolean,default:true,index:true},
 createdBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null,index:true},
 updatedBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null,index:true}
},{timestamps:true,collection:"_name_your_story"});

nameYourStorySchema.index({business_id:1,user_id:1,book_id:1},{unique:true});
nameYourStorySchema.index({business_id:1,user_id:1,isActive:1});

const Book=mongoose.models.Book||mongoose.model("Book",bookSchema);
const NameYourStory=mongoose.models.NameYourStory||mongoose.model("NameYourStory",nameYourStorySchema);

export {NameYourStory};
export default Book;
