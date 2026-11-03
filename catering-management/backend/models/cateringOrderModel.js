import mongoose from "mongoose";

const menuItemSchema=new mongoose.Schema({
 item:{type:String,trim:true,default:""},
 quantity:{type:Number,min:0,default:1},
 portion:{type:String,trim:true,default:""},
 unitPrice:{type:Number,min:0,default:0}
},{_id:false});

const strings=["orderNumber","status","customerName","company","phone","email","billingAddress","billingCity","billingState","billingZip","eventName","eventType","eventLocation","eventCity","eventState","eventZip","startTime","endTime","serviceTime","venueContact","venuePhone","serviceType","allergies","specialInstructions","deliveryAddress","paymentMethod","paymentReference","notes"];
const numbers=["guestCount","mileage","mileageRate","mileageCharge","tollsParking","deliveryFee","setupFee","additionalServices","staffingTotal","equipmentRental","otherCharges","discount","tax","depositRequired","depositPaid","menuSubtotal","mileageTotal","subtotal","orderTotal","remainingBalance"];
const definition=Object.fromEntries(strings.map(field=>[field,{type:String,trim:true,default:""}]));
for(const field of numbers)definition[field]={type:Number,default:0};
definition.orderNumber.required=true;
definition.customerName.required=true;
definition.orderDate={type:Date,default:null};
definition.eventDate={type:Date,default:null};
definition.depositDueDate={type:Date,default:null};
definition.finalPaymentDueDate={type:Date,default:null};
definition.dietaryRequirements={type:[String],default:[]};
definition.menuItems={type:[menuItemSchema],default:[]};

const cateringOrderSchema=new mongoose.Schema(definition,{timestamps:true,collection:"catering_orders"});
cateringOrderSchema.index({orderNumber:1},{unique:true});
cateringOrderSchema.index({eventDate:1});

export default mongoose.models.CateringOrder||mongoose.model("CateringOrder",cateringOrderSchema);
