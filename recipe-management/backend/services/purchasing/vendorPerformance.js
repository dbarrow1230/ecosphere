import {receivedOrderLines} from '../../../../shared/culinary/receivingLedger.js';
const id=value=>String(value?._id||value||'');
const day=value=>value&&!Number.isNaN(Date.parse(value))?new Date(value).toISOString().slice(0,10):null;
export function vendorDeliveryPerformance(orders,legacyLines=[]){
 const result={};
 for(const order of orders){if(!['received','closed'].includes(order.status)||order.flow!=='ingredients')continue;
  const key=id(order.vendorRef),entry=result[key]??={completedOrders:0,orderedPacks:0,acceptedPacks:0,onTimeOrders:0,assessedOrders:0};
  const lines=receivedOrderLines(order,legacyLines.filter(line=>id(line.purchaseOrderRef)===id(order)));
  const ordered=lines.reduce((sum,line)=>sum+Number(line.orderedQty||0),0),accepted=lines.reduce((sum,line)=>sum+Math.min(Number(line.receivedQty||0),Number(line.orderedQty||0)),0);
  if(!ordered)continue;entry.completedOrders++;entry.orderedPacks+=ordered;entry.acceptedPacks+=accepted;
  const receipts=(order.receipts||[]).filter(item=>item.status==='posted'),expected=day(order.expectedDate);
  let onTime=null;
  if(receipts.some(item=>item.onTime===false))onTime=false;
  else if(expected&&receipts.length){onTime=receipts.every(item=>day(item.deliveryDate||item.receiptDate)&&day(item.deliveryDate||item.receiptDate)<=expected);}
  else if(receipts.length&&receipts.every(item=>item.onTime===true))onTime=true;
  if(receipts.length&&receipts.at(-1).onTime===true&&!receipts.some(item=>item.onTime===false))onTime=true;
  if(onTime!==null){entry.assessedOrders++;if(onTime)entry.onTimeOrders++;}
 }
 return Object.fromEntries(Object.entries(result).map(([key,value])=>[key,{...value,fillRate:value.orderedPacks?value.acceptedPacks/value.orderedPacks*100:null,onTimeRate:value.assessedOrders?value.onTimeOrders/value.assessedOrders*100:null}]));
}
