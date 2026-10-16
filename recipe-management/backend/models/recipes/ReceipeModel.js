// backend/models/master/ReceipeModel.js
import mongoose from "mongoose";
import businessInfoConnection from "../../db/businessInfoConnection.js";

const {Schema}=mongoose;
const ingredientDefault=value=>function(){return ["label","instruction"].includes(this.rowType)?undefined:value;};

const RecipeSchema=new Schema({
 allergenReview:{type:Schema.Types.Mixed,default:null},
 allergenReviewHistory:[{type:Schema.Types.Mixed}],
 business:{type:Schema.Types.ObjectId,ref:"Business",required:true,index:true},

 name:{type:String,required:true,trim:true,index:true},
 recipeNumber:{type:String,required:true,trim:true,uppercase:true,index:true},
 recipeSequence:{type:Number,required:true,min:1},
 image:{type:String,trim:true,default:""},
 platingPhotos:[{image:{type:String,required:true,trim:true},caption:{type:String,trim:true,default:""}}],
 parentRecipe:{type:Schema.Types.ObjectId,ref:"Recipe",default:null,index:true},
 scaleFactor:{type:Number,default:1,min:0},
 scalingMethod:{type:String,enum:["original","multiplier","servings","imperialYield","metricYield"],default:"original"},

 cuisines:[{type:Schema.Types.ObjectId,ref:"Cuisine"}],
 courses:[{type:Schema.Types.ObjectId,ref:"Course"}],
 mealType:{type:Schema.Types.ObjectId,ref:"MealType",default:null},
 categories:[{type:Schema.Types.ObjectId,ref:"Category"}],
 primaryCuisine:{type:Schema.Types.ObjectId,ref:"Cuisine",default:null},
 primaryCourse:{type:Schema.Types.ObjectId,ref:"Course",default:null},
 primaryCategory:{type:Schema.Types.ObjectId,ref:"Category",default:null},
 dietaryConsiderations:[{type:Schema.Types.ObjectId,ref:"Dietary"}],

 yield:{
  imperialQuantity:{type:Number,default:null},
  imperialUnit:{type:Schema.Types.ObjectId,ref:"ImperialUnit",default:null},
  metricQuantity:{type:Number,default:null},
  metricUnit:{type:Schema.Types.ObjectId,ref:"MetricUnit",default:null}
 },

 servingSize:{
  imperialQuantity:{type:Number,default:null},
  imperialUnit:{type:Schema.Types.ObjectId,ref:"ImperialUnit",default:null},
  metricQuantity:{type:Number,default:null},
  metricUnit:{type:Schema.Types.ObjectId,ref:"MetricUnit",default:null}
 },
 servingSizeDescription:{type:String,trim:true,default:""},
 servings:{type:Number,default:null,min:0},

 times:{
  prepTime:{type:String,trim:true,default:""},
  cookTime:{type:String,trim:true,default:""},
  chillTime:{type:String,trim:true,default:""},
  restTime:{type:String,trim:true,default:""},
  totalTime:{type:String,trim:true,default:""}
 },

 flavorProfile:{
  taste:[{type:String,trim:true}],
  aroma:[{type:String,trim:true}],
  mouthfeel:[{type:String,trim:true}]
 },

 fermentationTemperatureAdjustment:{type:String,trim:true,default:""},

 generalDescription:{type:String,trim:true,default:""},
 suggestedPrice:{type:Number,default:0,min:0},
 suggestedPriceDisplay:{type:String,trim:true,default:""},
 menuDescription:{type:String,trim:true,default:""},

 origin:{type:String,trim:true,default:""},
 history:{type:String,trim:true,default:""},
 culturalSignificance:{type:String,trim:true,default:""},

 techniques:[{type:String,trim:true}],
 techniqueRefs:[{type:Schema.Types.ObjectId,ref:"Technique"}],

 equipment:[{type:Schema.Types.ObjectId,ref:"Equipment"}],
 equipmentNames:[{type:String,trim:true}],

 haccp:[{
  code:{type:String,trim:true,required:true},
  description:{type:String,trim:true,default:""}
 }],

 ccp:[{
  code:{type:String,trim:true,required:true},
  criticalControlPoint:{type:String,trim:true,default:""},
  hazard:{type:String,trim:true,default:""},
  criticalLimit:{type:String,trim:true,default:""},
  monitoring:{type:String,trim:true,default:""},
  correctiveAction:{type:String,trim:true,default:""},
  verification:{type:String,trim:true,default:""},
  records:{type:String,trim:true,default:""}
 }],

 ingredients:[{
  rowType:{type:String,enum:["ingredient","label","instruction"],default:"ingredient"},
  sourceName:{type:String,trim:true,default:ingredientDefault("")},
  ingredient:{type:Schema.Types.ObjectId,ref:"Ingredient",required:function(){return this.rowType==="ingredient";}},
  vendor:{type:Schema.Types.ObjectId,ref:"Vendor",default:ingredientDefault(null)},
  vendorIngredientPrice:{type:Schema.Types.ObjectId,ref:"VendorIngredientPrice",default:ingredientDefault(null)},
  priceSnapshot:{type:Schema.Types.Mixed,default:ingredientDefault(null)},
  unitCost:{type:Number,default:ingredientDefault(0),min:0},
  totalCost:{type:Number,default:ingredientDefault(0),min:0},
  vendorPackCost:{type:Number,default:ingredientDefault(0),min:0},
  vendorPackImperialDisplay:{type:String,default:ingredientDefault("")},
  vendorPackMetricDisplay:{type:String,default:ingredientDefault("")},

  imperialQuantity:{type:Number,default:ingredientDefault(null)},
  imperialUnit:{type:Schema.Types.ObjectId,ref:"ImperialUnit",default:ingredientDefault(null)},

  metricQuantity:{type:Number,default:ingredientDefault(null)},
  metricUnit:{type:Schema.Types.ObjectId,ref:"MetricUnit",default:ingredientDefault(null)},

  preparation:{type:String,trim:true,default:ingredientDefault("")},
  time:{type:String,trim:true,default:ingredientDefault("")},
  note:{type:String,trim:true,default:ingredientDefault("")}
 }],

 instructions:[{
  stepNumber:{type:Number,required:true},
  instruction:{type:String,trim:true,required:true},
  ccpRefs:[{type:String,trim:true}]
 }],

 plating:[{type:String,trim:true}],
 notes:[{type:String,trim:true}],
 storage:[{type:String,trim:true}],

 suggestedNutrition:{type:Schema.Types.Mixed,default:null},
 nutritionSync:{type:Schema.Types.Mixed,default:null},
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

 allergens:[{type:Schema.Types.ObjectId,ref:"Allergen"}],

 isActive:{type:Boolean,default:true}
},{ timestamps:true, collection:"recipes"});

RecipeSchema.index({"nutritionSync.status":1,"nutritionSync.retryAt":1});
RecipeSchema.index({business:1,name:1},{unique:true});
RecipeSchema.index({business:1,recipeNumber:1},{unique:true});

export default businessInfoConnection.models.Recipe||businessInfoConnection.model("Recipe",RecipeSchema);
