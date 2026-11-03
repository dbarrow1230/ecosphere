// backend/models/PoetryForm.js
import mongoose from "mongoose";

const stopWords=new Set(["a","an","and","are","as","at","be","been","but","by","can","for","from","has","have","in","into","is","it","its","of","on","or","that","the","their","this","to","was","which","while","with","written","poem","poems","poetry","type","form"]);

const normalizeTag=value=>String(value||"")
 .toLowerCase()
 .trim()
 .replace(/['’]/g,"")
 .replace(/[^a-z0-9]+/g,"-")
 .replace(/^-+|-+$/g,"");

const descriptionTags=value=>String(value||"")
 .toLowerCase()
 .replace(/['’]/g,"")
 .match(/[a-z0-9]+/g)
 ?.filter(word=>word.length>=4&&!stopWords.has(word))||[];

const poetryFormSchema=new mongoose.Schema({
 name:{type:String,required:true,trim:true,unique:true,index:true},
 slug:{type:String,required:true,trim:true,lowercase:true,unique:true,index:true},
 alternateNames:[{type:String,trim:true}],
 type:{type:String,enum:["form","meter","stanza","movement","technique","genre"],default:"form",index:true},
 category:{type:String,trim:true,default:"",index:true},
 origin:{type:String,trim:true,default:""},
 description:{type:String,required:true,trim:true},
 structure:{
  lines:{type:Number,min:0,default:null},
  stanzas:{type:String,trim:true,default:""},
  meter:{type:String,trim:true,default:""},
  rhymeScheme:{type:String,trim:true,default:""},
  syllablePattern:{type:String,trim:true,default:""},
  refrain:{type:String,trim:true,default:""},
  additionalRules:[{type:String,trim:true}]
 },
 examples:[{
  title:{type:String,trim:true,default:""},
  author:{type:String,trim:true,default:""},
  text:{type:String,default:""},
  notes:{type:String,default:""},
  sourceUrl:{type:String,trim:true,default:""}
 }],
 references:[{
  title:{type:String,trim:true,required:true},
  url:{type:String,trim:true,default:""}
 }],
 tags:[{type:String,trim:true,lowercase:true}],
 notes:{type:String,default:""},
 isActive:{type:Boolean,default:true,index:true}
},{timestamps:true,collection:"poetry_forms"});

poetryFormSchema.pre("validate",function(){
 const tags=[
  normalizeTag(this.name),
  normalizeTag(this.category),
  ...descriptionTags(this.description)
 ];

 this.tags=[...new Set(tags.filter(Boolean))].slice(0,30);
});

const PoetryForm=mongoose.models.PoetryForm||mongoose.model("PoetryForm",poetryFormSchema);

export default PoetryForm;