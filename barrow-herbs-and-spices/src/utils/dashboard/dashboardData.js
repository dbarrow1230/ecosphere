export function getDashboardCounts(data={}){
 const blends=Array.isArray(data.blends)?data.blends:[];
 const ingredients=Array.isArray(data.ingredients)?data.ingredients:[];
 const orders=Array.isArray(data.orders)?data.orders:[];
 return {
  blends:blends.length,
  ingredients:ingredients.length,
  finishedPacks:blends.reduce((total,blend)=>total+Number(blend.stock||0),0),
  pendingOrders:orders.filter(order=>order.status==='pending').length
 };
}
