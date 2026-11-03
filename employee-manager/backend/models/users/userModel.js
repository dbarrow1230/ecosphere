import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema=new mongoose.Schema(
{
 username:{type:String,required:true,trim:true,unique:true},
 email:{type:String,required:true,trim:true,lowercase:true,unique:true},
 password:{type:String,required:true,select:false},
 role:{type:mongoose.Schema.Types.ObjectId,ref:"Role",default:null},
 details:{type:mongoose.Schema.Types.ObjectId,ref:"UserDetails",default:null},
 isActive:{type:Boolean,default:true},
 createAndSendNotifications:{type:Boolean,default:false},
 lastLogin:{type:Date,default:null},
 resetPasswordToken:{type:String,default:null,select:false},
 resetPasswordExpires:{type:Date,default:null,select:false}
},
{timestamps:true,collection:"users"}
);

userSchema.pre("save",async function(){
 if(!this.isModified("password"))
 {
  return;
 }

 const salt=await bcrypt.genSalt(10);
 this.password=await bcrypt.hash(this.password,salt);
});

userSchema.methods.matchPassword=async function(enteredPassword){
 return await bcrypt.compare(enteredPassword,this.password);
};

const User=mongoose.model("User",userSchema);

export default User;
