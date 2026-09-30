export const inventoryFields={
 name:{type:String,required:true,trim:true},
 category:{type:String,trim:true,default:''},
 sku:{type:String,trim:true,default:''},
 quantityOnHand:{type:Number,min:0,default:0},
 reorderLevel:{type:Number,min:0,default:0},
 unit:{type:String,trim:true,default:''},
 costPerUnit:{type:Number,min:0,default:0},
 supplier:{type:String,trim:true,default:''},
 status:{type:String,enum:['in-stock','low','out-of-stock','discontinued'],default:'in-stock'},
 notes:{type:String,trim:true,default:''}
};

export const menuFields={
 name:{type:String,required:true,trim:true},
 description:{type:String,trim:true,default:''},
 category:{type:String,trim:true,default:''},
 pricePerGuest:{type:Number,min:0,default:0},
 minimumGuests:{type:Number,min:0,default:1},
 maximumGuests:{type:Number,min:0,default:0},
 status:{type:String,enum:['active','inactive','draft'],default:'draft'},
 notes:{type:String,trim:true,default:''}
};
