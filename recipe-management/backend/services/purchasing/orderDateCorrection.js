export function correctOrderDates(order,input){
 const date=(value,required=false)=>{if(!value&&!required)return null;if(!/^\d{4}-\d{2}-\d{2}$/.test(value||''))throw Error('Enter dates as MM/DD/YYYY.');const result=new Date(value+'T00:00:00.000Z');if(Number.isNaN(result.getTime())||result.toISOString().slice(0,10)!==value)throw Error('Enter a valid date.');return result;};
 const set={orderDate:date(input.orderDate,true),expectedDate:date(input.expectedDate)};
 const receipts=(order.receipts||[]).map(receipt=>{const change=(input.receipts||[]).find(item=>String(item.id)===String(receipt._id));return change?{...receipt,deliveryDate:date(change.deliveryDate,true)}:receipt;});
 if((input.receipts||[]).some(change=>!(order.receipts||[]).some(receipt=>String(receipt._id)===String(change.id))))throw Error('Receiving record not found.');
 if(order.receipts)set.receipts=receipts;return set;
}
