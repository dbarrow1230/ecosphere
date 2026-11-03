import mongoose from "mongoose";

const strings=["contractNumber","clientName","company","phone","email","billingAddress","billingCity","billingState","billingZip","eventName","eventType","eventLocation","eventCity","eventState","eventZip","startTime","endTime","serviceTime","serviceType","menuDescription","servicesDescription","specialRequests","paymentMethod","cancellationTerms","guestCountTerms","menuChangeTerms","paymentTerms","foodSafetyTerms","allergyTerms","leftoversTerms","venueTerms","equipmentTerms","forceMajeureTerms","additionalTerms","clientPrintedName","clientSignature","representativeName","representativeSignature"];
const dates=["contractDate","eventDate","depositDueDate","balanceDueDate","finalGuestCountDueDate","finalMenuChangesDueDate","cancellationDeadline","clientSignatureDate","representativeSignatureDate"];
const definition=Object.fromEntries(strings.map(field=>[field,{type:String,trim:true,default:""}]));
for(const field of dates)definition[field]={type:Date,default:null};
definition.contractNumber.required=true;
definition.clientName.required=true;
definition.guestCount={type:Number,min:0,default:0};
definition.contractTotal={type:Number,min:0,default:0};
definition.depositRequired={type:Number,min:0,default:0};
definition.depositPaid={type:Number,min:0,default:0};
definition.balance={type:Number,min:0,default:0};
definition.clientAccepted={type:Boolean,default:false};

const cateringContractSchema=new mongoose.Schema(definition,{timestamps:true,collection:"catering_contracts"});
cateringContractSchema.index({contractNumber:1},{unique:true});
cateringContractSchema.index({eventDate:1});

export default mongoose.models.CateringContract||mongoose.model("CateringContract",cateringContractSchema);
