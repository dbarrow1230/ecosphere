import mongoose from "mongoose";

const lifeThemeSchema=new mongoose.Schema({
 user:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
 title:{type:String,required:true,trim:true},
 description:{type:String,default:""},
 themeType:{type:String,enum:["daily","weekly","monthly","quarterly","yearly","seasonal","custom"],default:"monthly"},
 startDate:{type:Date,required:true},
 endDate:{type:Date},
 intention:{type:String,default:""},
 focusWords:[{type:String,trim:true}],
 affirmation:{type:String,default:""},
 status:{type:String,enum:["active","completed","archived"],default:"active"},
 lifeArea:{type:mongoose.Schema.Types.ObjectId,ref:"LifeArea"},
 category:{type:mongoose.Schema.Types.ObjectId,ref:"Category"},
 linkedGoals:[{type:mongoose.Schema.Types.ObjectId,ref:"Goal"}],
 tags:[{type:mongoose.Schema.Types.ObjectId,ref:"Tag"}]
},{
 timestamps:true,
 collection:"lifethemes"
});

lifeThemeSchema.index({user:1,themeType:1,status:1});
lifeThemeSchema.index({user:1,startDate:-1,endDate:1});

const LifeTheme=mongoose.model("LifeTheme",lifeThemeSchema);

export default LifeTheme;