// backend/models/master/ReceipeModel.js
import mongoose from "mongoose";
import businessInfoConnection from "../../db/businessInfoConnection.js";

const {Schema}=mongoose;

const RecipeSchema=new Schema({
 business:{type:Schema.Types.ObjectId,ref:"Business",required:true,index:true},

 name:{type:String,required:true,trim:true,index:true},

 cuisine:{type:Schema.Types.ObjectId,ref:"Cuisine",required:true},
 course:{type:Schema.Types.ObjectId,ref:"Course",required:true},
 category:{type:Schema.Types.ObjectId,ref:"Category",required:true},
 dietaryConsiderations:[{type:Schema.Types.ObjectId,ref:"Dietary"}],

 yield:{
  imperialDisplay:{type:String,trim:true,default:""},
  metricDisplay:{type:String,trim:true,default:""},
  imperialQuantity:{type:Number,default:null},
  imperialUnit:{type:Schema.Types.ObjectId,ref:"ImperialUnit",default:null},
  metricQuantity:{type:Number,default:null},
  metricUnit:{type:Schema.Types.ObjectId,ref:"MetricUnit",default:null}
 },

 servingSize:{
  imperialDisplay:{type:String,trim:true,default:""},
  metricDisplay:{type:String,trim:true,default:""},
  imperialQuantity:{type:Number,default:null},
  imperialUnit:{type:Schema.Types.ObjectId,ref:"ImperialUnit",default:null},
  metricQuantity:{type:Number,default:null},
  metricUnit:{type:Schema.Types.ObjectId,ref:"MetricUnit",default:null}
 },

 times:{
  prepTime:{type:String,trim:true,default:""},
  cookTime:{type:String,trim:true,default:""},
  chillTime:{type:String,trim:true,default:""},
  restTime:{type:String,trim:true,default:""}
 },

 flavorProfile:{
  taste:{type:String,trim:true,default:""},
  aroma:{type:String,trim:true,default:""},
  mouthfeel:{type:String,trim:true,default:""}
 },

 fermentationTemperatureAdjustment:{type:String,trim:true,default:""},

 generalDescription:{type:String,trim:true,default:""},
 suggestedPrice:{type:Number,default:0,min:0},
 menuDescription:{type:String,trim:true,default:""},

 origin:{type:String,trim:true,default:""},
 history:{type:String,trim:true,default:""},
 culturalSignificance:{type:String,trim:true,default:""},

 techniques:[{type:String,trim:true}],

 equipment:[{type:Schema.Types.ObjectId,ref:"Equipment"}],

 haccp:[{
  code:{type:String,trim:true,required:true},
  description:{type:String,trim:true,required:true}
 }],

 ccp:[{
  code:{type:String,trim:true,required:true},
  metric:{type:String,trim:true,default:""},
  ingredient:{type:Schema.Types.ObjectId,ref:"Ingredient",default:null},
  preparation:{type:String,trim:true,default:""}
 }],

 ingredients:[{
  ingredient:{type:Schema.Types.ObjectId,ref:"Ingredient",required:true},

  imperialQuantity:{type:Number,default:null},
  imperialUnit:{type:Schema.Types.ObjectId,ref:"ImperialUnit",default:null},
  imperialDisplay:{type:String,trim:true,default:""},

  metricQuantity:{type:Number,default:null},
  metricUnit:{type:Schema.Types.ObjectId,ref:"MetricUnit",default:null},
  metricDisplay:{type:String,trim:true,default:""},

  preparation:{type:String,trim:true,default:""},
  time:{type:String,trim:true,default:""},
  note:{type:String,trim:true,default:""}
 }],

 instructions:[{
  stepNumber:{type:Number,required:true},
  instruction:{type:String,trim:true,required:true},
  ccpRefs:[{type:String,trim:true}]
 }],

 plating:[{type:String,trim:true}],
 notes:[{type:String,trim:true}],
 storage:[{type:String,trim:true}],

 nutrition:{
  calories:{type:String,trim:true,default:""},
  totalFat:{type:String,trim:true,default:""},
  saturatedFat:{type:String,trim:true,default:""},
  transFat:{type:String,trim:true,default:""},
  polyunsaturatedFat:{type:String,trim:true,default:""},
  monounsaturatedFat:{type:String,trim:true,default:""},
  cholesterol:{type:String,trim:true,default:""},
  sodium:{type:String,trim:true,default:""},
  potassium:{type:String,trim:true,default:""},
  totalCarbohydrate:{type:String,trim:true,default:""},
  dietaryFiber:{type:String,trim:true,default:""},
  sugars:{type:String,trim:true,default:""},
  protein:{type:String,trim:true,default:""},
  vitaminA:{type:String,trim:true,default:""},
  vitaminB6:{type:String,trim:true,default:""},
  vitaminB12:{type:String,trim:true,default:""},
  vitaminC:{type:String,trim:true,default:""},
  vitaminD:{type:String,trim:true,default:""},
  vitaminE:{type:String,trim:true,default:""},
  calcium:{type:String,trim:true,default:""},
  magnesium:{type:String,trim:true,default:""},
  iron:{type:String,trim:true,default:""}
 },

 allergens:[{type:String,trim:true}],

 isActive:{type:Boolean,default:true}
},{ timestamps:true, collection:"recipes"});

RecipeSchema.index({business:1,name:1},{unique:true});

export default businessInfoConnection.models.Recipe||businessInfoConnection.model("Recipe",RecipeSchema);