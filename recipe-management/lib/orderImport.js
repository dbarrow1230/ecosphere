import {parseVendorReceipt} from './vendorReceiptAdapters.js';
import {parseVendorTable} from './vendorOrderTables.js';
const amount=value=>Number(String(value||'0').replace(/[$,]/g,''));
export function calculateOrderTax(subtotal,rate){return Math.round((Number(subtotal)*Number(rate)/100+Number.EPSILON)*100)/100;}
export function orderTotals(order,lines=[]){
 const itemSubtotal=lines.reduce((sum,line)=>sum+Number(line.lineTotal??Number(line.quantity||0)*Number(line.unitCost||0)),0);
 const subtotal=order.subtotal!==''&&order.subtotal!=null?Number(order.subtotal):itemSubtotal;
 const taxableItems=lines.reduce((sum,line)=>sum+(line.taxable===true?Number(line.lineTotal??Number(line.quantity||0)*Number(line.unitCost||0)):0),0);
 const taxableFees=['shipping','deliveryFee','serviceFee','otherFees'].reduce((sum,key)=>sum+(order.taxableFees?.[key]===true?Number(order[key]||0):0),0);
 const taxableSubtotal=order.taxMode==='itemized'?Number((taxableItems+taxableFees).toFixed(2)):subtotal;
 const tax=order.taxRate!=null?calculateOrderTax(taxableSubtotal,order.taxRate):Number(order.tax||0);
 const fees=tax+['shipping','deliveryFee','serviceFee','otherFees'].reduce((sum,key)=>sum+Number(order[key]||0),0),tip=order.orderType==='grocery'?Number(order.tip||0):0;
 return {itemSubtotal,subtotal,taxableSubtotal,tax,total:Number((subtotal+fees+tip).toFixed(2))};
}
export function parseExistingOrder(text,options={}){
 const adapted=parseVendorReceipt(text,options);if(adapted)return adapted;
 const sourceLines=String(text).replace(/\r/g,'').split('\n').map(line=>line.trim()).filter(Boolean);const lines=sourceLines.filter((line,index)=>!/^Original Item:/i.test(line)&&!(/^Original Item:/i.test(sourceLines[index-1]||'')&&/^\d+\s*x\s+/i.test(line))).map(line=>/^(?:Original|Charged|Refunded) price (?:is|was):/i.test(line)?line.match(/\$\s*[\d,]+\.\d{2}/)?.[0]||line:line),result={orderType:'grocery',orderDate:'',orderReference:'',subtotal:'',deliveryFee:'0',serviceFee:'0',otherFees:'0',shipping:'0',tax:'0',tip:'0',sourceTotal:'',lines:[]};
 let refunded=false;const money=/\$\s*([\d,]+\.\d{2})/g;
 for(let i=0;i<lines.length;i++){
  const line=lines[i];const date=line.match(/(?:order(?:ed)?\s*(?:date|on)?|date)\s*[:#]?\s*(\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{4})/i);if(date){const raw=date[1];result.orderDate=raw.includes('/')?raw.split('/').map((v,index)=>index<2?v.padStart(2,'0'):v).reverse().map((v,index,all)=>index===0?v:index===1?all[2]:all[1]).join('-'):raw;continue;}
  const ref=line.match(/(?:order|invoice|purchase order)\s*(?:number|#|no\.?)[\s:#]*(\S+)/i);if(ref){result.orderReference=ref[1];continue;}
  if(/items?\s*(?:to be refunded|not found|unavailable)/i.test(line)){refunded=true;continue;}
  const totalKey=[['subtotal',/^(?:sub\s*total|merchandise\s*(?:total|subtotal)|items\s*subtotal)\b/i],['shipping',/^(?:shipping|freight)(?:\s*(?:fee|charge|cost))?\b/i],['deliveryFee',/^delivery\s*(?:fee|charge)\b/i],['serviceFee',/^service\s*fee\b/i],['otherFees',/^(?:(?:other\s*)?fees?|courier\s+compensation(?:\s+fee)?)\b/i],['tax',/^(?:sales\s*)?tax\b/i],['tip',/^tip\b/i],['sourceTotal',/^(?:grand\s*total|order\s*total|invoice\s*total|total|amount\s*due|balance\s*due)\b/i]].find(([,pattern])=>pattern.test(line));
  if(totalKey){const raw=line.match(/\$?([\d,]+(?:\.\d{2})?)/);const next=raw?raw[1]:/^free$/i.test(lines[i+1]||'')?'0':lines[i+1]?.match(/^\$?([\d,]+\.\d{2})$/)?.[1];if(next!==undefined){result[totalKey[0]]=String(amount(next)+(totalKey[0]==='otherFees'?amount(result.otherFees):0));if(!raw)i++;}if(totalKey[0]==='tax')result.sourceTax=String(amount(next));if(totalKey[0]==='sourceTotal')break;continue;}
  if(/^(?:order totals|order complete|items found|\d+ items found|sold by|delivered|reorder|receipt|your shopper|your payment|payment split|ebt |mastercard|visa |original|snap |we keep|your non|you have)/i.test(line))continue;
  const columns=line.split(/\t|\s*\|\s*/);if(columns.length>=3&&Number.isFinite(Number(columns[1]))){result.lines.push({productName:columns[0],quantity:columns[1],unitCost:String(amount(columns[2])),lineTotal:String(columns[3]!==undefined?amount(columns[3]):Number(columns[1])*amount(columns[2])),purchaseUnit:'pack',sourceAvailability:columns[4]||'found',offering:''});continue;}
  if(/^(?:refunded|original|charged) price\b/i.test(line))continue;
  if(!/[A-Za-z]/.test(line)||/^\$|^\d|^free$/i.test(line))continue;
  let itemName=line,start=i+1;if(lines[start]&&/[A-Za-z]/.test(lines[start])&&!/^\$|^\d|^(?:Subtotal|Order totals|Delivery Fee|Service Fee|Tax|Tip|Total)/i.test(lines[start])&&/^\$|^\d/.test(lines[start+1]||"")){itemName+=" "+lines[start];start++;}
  const data=[];let j=start;for(;j<lines.length&&data.length<6;j++){const value=lines[j];if(/^\$|^\d+(?:\.\d+)?(?:\s*(?:lb|lbs|oz|each|ea))?$/.test(value))data.push(value);else break;}
  if(!data.some(value=>/\$/.test(value)))continue;
  const prices=data.flatMap(value=>[...value.matchAll(money)].map(match=>Number(match[1].replaceAll(',','')))),qtyText=data.find(value=>/^\d/.test(value)),qty=qtyText?Number(qtyText.match(/^[\d.]+/)[0]):1;
  const price=(refunded?prices.find(value=>value>0):prices[0])||0;const charged=data.map((value,index)=>({value,index})).filter(item=>item.index!==data.indexOf(qtyText)&&/^\$?[\d,]+\.\d{2}$/.test(item.value));const total=refunded?0:charged.length?amount(charged.at(-1).value):Number((qty*price).toFixed(2));result.lines.push({productName:itemName,quantity:String(qty>0?qty:1),unitCost:String(price),lineTotal:String(total),purchaseUnit:/\blbs?\b/i.test(qtyText||'')?'lb':'pack',sourceAvailability:refunded?'notFound':'found',quantityNeedsReview:refunded&&qty===0,offering:''});i=j-1;
 }
 const tableLines=options.format==='wegmans'?[]:parseVendorTable(text);if(tableLines.length)result.lines=tableLines;result.orderType=options.orderType||'grocery';result.parserFormat=tableLines.length?'table':'receipt';result.warnings=[];
 const parsedSubtotal=result.lines.reduce((sum,line)=>sum+Number(line.lineTotal),0);if(result.subtotal!==''&&Math.abs(parsedSubtotal-Number(result.subtotal))>.005)result.warnings.push('Parsed items total $'+parsedSubtotal.toFixed(2)+'; receipt subtotal is $'+Number(result.subtotal).toFixed(2)+'. Review missing items, quantities, or discounts.');
 if(options.format==='table'&&!tableLines.length)result.warnings.push('No item table headers were recognized. Review the receipt-style result before saving.');
 result.taxMode='itemized';result.taxableFees={shipping:true,deliveryFee:true,serviceFee:true,otherFees:true};result.lines=result.lines.map(line=>({...line,taxable:line.taxable===true}));return result;
}
