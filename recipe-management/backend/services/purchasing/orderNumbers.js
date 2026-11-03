export async function reserveOrderNumber(db,business,type,date,vendorName){
 if(!['purchase','grocery'].includes(type))throw Error('Choose an order type.');if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||Number.isNaN(Date.parse(date)))throw Error('Enter a valid order date.');
 const existing=await db.collection('purchase_orders').find({business_id:business,orderType:type}).toArray();const highest=existing.reduce((max,order)=>Math.max(max,Number(String(order.orderReference||'').match(/-(\d{6})$/)?.[1]||0)),0);const counterId=String(business)+':'+type;await db.collection('order_number_counters').updateOne({_id:counterId},{$max:{value:highest}},{upsert:true});
 const vendorCode=String(vendorName||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]/gi,'').slice(0,4).toUpperCase();if(!vendorCode)throw Error('Choose a vendor before generating an order number.');
 const prefix=(type==='grocery'?'GO':'PO')+'-'+vendorCode+'-'+date.replaceAll('-','');
 for(let attempt=0;attempt<30;attempt++){
  try{const counter=await db.collection('order_number_counters').findOneAndUpdate({_id:counterId},{$inc:{value:1}},{upsert:true,returnDocument:'after'});const number=prefix+'-'+String(counter.value).padStart(6,'0');if(await db.collection('purchase_orders').findOne({business_id:business,$or:[{orderReference:number},{poNumber:number},{orderReferenceKey:number}]}))continue;await db.collection('order_number_reservations').insertOne({_id:String(business)+':'+number,business,number,createdAt:new Date()});return number;}catch(error){if(error.code!==11000)throw error;}
 }
 throw Error('An order number could not be generated. Try again.');
}
