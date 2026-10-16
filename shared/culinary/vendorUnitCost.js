export function vendorUnitCost(value){
 const cost=Number(value.packCost);if(value.packCost===''||value.packCost==null||!Number.isFinite(cost)||cost<0)return null;
 for(const system of ['imperial','metric']){const quantity=Number(value[system+'Quantity']);if(value[system+'Unit']&&Number.isFinite(quantity)&&quantity>0)return {cost:Number((cost/quantity).toFixed(8)),unit:value[system+'Unit'],system};}
 return null;
}
