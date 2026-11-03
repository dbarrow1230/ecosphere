// backend/models/business/businessModel.js
import mongoose from "mongoose";
import businessInfoConnection from "../../db/businessInfoConnection.js";

const themeColorTokenSchema=new mongoose.Schema({
 value:{type:String,trim:true,default:""},
 colorName:{type:String,trim:true,default:""}
},{_id:false});

const themeFontTokenSchema=new mongoose.Schema({
 fontName:{type:String,trim:true,default:""},
 fallbackFont:{type:String,trim:true,default:""}
},{_id:false});

const themeBackgroundSchema=new mongoose.Schema({
 mode:{
  type:String,
  enum:["color","gradient","image"],
  default:"color"
 },
 image:{type:String,trim:true,default:""},
 imageOpacity:{type:Number,default:0.08},
 imageSize:{type:String,trim:true,default:"cover"},
 imagePosition:{type:String,trim:true,default:"center"},
 imageRepeat:{type:String,trim:true,default:"no-repeat"},
 overlayOpacity:{type:Number,default:0},
 gradientToken:{
  type:String,
  enum:["gradientMain","gradientSoft"],
  default:"gradientSoft"
 },
 gradientType:{
  type:String,
  enum:["linear","radial"],
  default:"linear"
 },
 gradientDirectionMode:{
  type:String,
  enum:["preset","custom"],
  default:"preset"
 },
 gradientDirection:{type:String,trim:true,default:"180deg"},
 gradientStart:{type:String,trim:true,default:"#cfdcc8"},
 gradientEnd:{type:String,trim:true,default:"#b7c9ad"},
 gradientStartStop:{type:Number,default:0},
 gradientEndStop:{type:Number,default:100}
},{_id:false});

const themeColorsSchema=new mongoose.Schema({
 bg:{type:themeColorTokenSchema,default:{}},
 bgAlt:{type:themeColorTokenSchema,default:{}},
 surface:{type:themeColorTokenSchema,default:{}},
 surface2:{type:themeColorTokenSchema,default:{}},

 backgroundTreatment:{type:themeBackgroundSchema,default:{}},

 text:{type:themeColorTokenSchema,default:{}},
 textSoft:{type:themeColorTokenSchema,default:{}},
 textInverse:{type:themeColorTokenSchema,default:{}},
 heading:{type:themeColorTokenSchema,default:{}},

 primary:{type:themeColorTokenSchema,default:{}},
 primaryHover:{type:themeColorTokenSchema,default:{}},

 secondary:{type:themeColorTokenSchema,default:{}},
 secondaryHover:{type:themeColorTokenSchema,default:{}},

 accent:{type:themeColorTokenSchema,default:{}},
 accentHover:{type:themeColorTokenSchema,default:{}},
 accent2:{type:themeColorTokenSchema,default:{}},

 success:{type:themeColorTokenSchema,default:{}},
 warning:{type:themeColorTokenSchema,default:{}},
 danger:{type:themeColorTokenSchema,default:{}},
 info:{type:themeColorTokenSchema,default:{}},

 border:{type:themeColorTokenSchema,default:{}},
 borderStrong:{type:themeColorTokenSchema,default:{}},

 gradientMain:{type:String,trim:true,default:""},
 gradientSoft:{type:String,trim:true,default:""},

 overlay:{type:themeColorTokenSchema,default:{}},
 tableStripe:{type:themeColorTokenSchema,default:{}},

 selectionBg:{type:themeColorTokenSchema,default:{}},
 selectionText:{type:themeColorTokenSchema,default:{}},

 fontHeading:{type:themeFontTokenSchema,default:{}},
 fontBody:{type:themeFontTokenSchema,default:{}}
},{_id:false});

const businessSchema=new mongoose.Schema({
 legalName:{type:String,required:true,trim:true},
 code:{type:String,trim:true,lowercase:true,default:undefined},

 typeRef:{type:mongoose.Schema.Types.ObjectId,ref:"BusinessType",required:true},
 taxRateRef:{type:mongoose.Schema.Types.ObjectId,ref:"TaxRate",default:null,index:true},
 website:{type:String,trim:true,default:""},
 taglineId:{type:mongoose.Schema.Types.ObjectId,ref:"Tagline",default:null,index:true},
 logo:{type:String,trim:true,default:""},

 themeColors:{type:themeColorsSchema,default:{}},

 phone:{type:String,trim:true,default:""},
 fax:{type:String,trim:true,default:""},
 email:{type:String,trim:true,lowercase:true,default:""},

 footerId:{type:mongoose.Schema.Types.ObjectId,ref:"Footer",default:null,index:true},
 receiptsEnabled:{type:Boolean,default:true},
 receiptTemplateId:{type:mongoose.Schema.Types.ObjectId,ref:"ReceiptTemplate",default:null,index:true},
 receiptHeaderId:{type:mongoose.Schema.Types.ObjectId,ref:"ReceiptHeader",default:null,index:true},
 receiptSubHeaderId:{type:mongoose.Schema.Types.ObjectId,ref:"ReceiptSubHeader",default:null,index:true},
 receiptFooterId:{type:mongoose.Schema.Types.ObjectId,ref:"ReceiptFooter",default:null,index:true},

 addressLine1:{type:String,trim:true,default:""},
 addressLine2:{type:String,trim:true,default:""},
 city:{type:String,trim:true,default:""},
 stateRef:{type:mongoose.Schema.Types.ObjectId,ref:"State",default:null,index:true},
 countyRef:{type:mongoose.Schema.Types.ObjectId,ref:"County",default:null,index:true},
 countryRef:{type:mongoose.Schema.Types.ObjectId,ref:"Country",default:null,index:true},
 postalCode:{type:String,trim:true,default:""},

 showLogoOnReceipt:{type:Boolean,default:true},
 showTaxRateOnReceipt:{type:Boolean,default:true},
 showWebsiteOnReceipt:{type:Boolean,default:true},
 showEmailOnReceipt:{type:Boolean,default:true},
 showPhoneOnReceipt:{type:Boolean,default:true},
 showFaxOnReceipt:{type:Boolean,default:false},
 showAddressOnReceipt:{type:Boolean,default:true},

 isActive:{type:Boolean,default:true},
 notes:{type:String,trim:true,default:""}
},{timestamps:true,collection:"businesses"});

businessSchema.index({legalName:1});
businessSchema.index({code:1},{unique:true,sparse:true});
businessSchema.index({isActive:1});

const Business=businessInfoConnection.models.Business||businessInfoConnection.model("Business",businessSchema);

export default Business;
