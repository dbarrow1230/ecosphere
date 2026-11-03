export function receivingValidation(receipt){
 if(!receipt?.deliveryDate)return 'Enter the delivery date.';
 let processed=0;
 for(const line of receipt.lines||[]){if(line.outcome==='replaced'&&(!line.replacementName?.trim()||line.replacementPrice===''||!Number.isFinite(Number(line.replacementPrice))||Number(line.replacementPrice)<0||!(Number(line.replacementQuantity)>0)))return 'Enter the replacement item, quantity, and price for '+line.productName+'.';const accepted=Number(line.accepted||0),rejected=Number(line.rejected||0),notFilled=Number(line.notFilled||0);if(![accepted,rejected,notFilled].every(value=>Number.isFinite(value)&&value>=0))return 'Enter valid nonnegative quantities for '+line.productName+'.';if(accepted+rejected+notFilled>Number(line.remaining)+1e-9)return 'Quantities exceed the outstanding amount for '+line.productName+'.';processed+=accepted+rejected+notFilled;}
 return processed>0?'':'Record a received, rejected, or not-filled quantity for at least one item.';
}
