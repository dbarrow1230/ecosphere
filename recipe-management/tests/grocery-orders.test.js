import test from 'node:test';import assert from 'node:assert/strict';import {parseExistingOrder,orderTotals} from '../lib/orderImport.js';import {makeGroceryLines,receiptChanges,assertOrderTransition} from '../backend/services/purchasing/ingredientWorkflow.js';
test('existing grocery text retains unavailable items and all order charges',()=>{const parsed=parseExistingOrder(`Order Date: 04/16/2026
Wegmans Heavy Cream
$6.89/ea
1
$6.89
7 Items to be refunded
Wegmans Mixed Peppers
$8.09/ea
0
$0.00
$8.09
Order totals
Subtotal
$6.89
Delivery Fee
$4.99
Service Fee
Free
Sales Tax
$0.44
Tip
$1.00
Total
$13.32`);assert.equal(parsed.orderDate,'2026-04-16');assert.equal(parsed.lines.length,2);assert.equal(parsed.lines[1].sourceAvailability,'notFound');assert.equal(parsed.lines[1].quantityNeedsReview,true);assert.equal(parsed.lines[1].unitCost,'8.09');assert.equal(parsed.lines[1].lineTotal,'0');assert.equal(orderTotals(parsed,parsed.lines).total,13.32);});
test('grocery totals include tips only for groceries',()=>{const values={orderType:'grocery',subtotal:144.70,deliveryFee:4.99,serviceFee:0,tax:.44,tip:0};assert.equal(orderTotals(values).total,150.13);assert.equal(orderTotals({...values,tip:2}).total,152.13);assert.equal(orderTotals({...values,orderType:'purchase',tip:2}).total,150.13);});
test('unlinked grocery items persist and shortages can be marked without stocking them',()=>{const lines=makeGroceryLines([{productName:'Unavailable garlic',quantity:2,unitCost:4,lineTotal:0,purchaseUnit:'each',sourceAvailability:'notFound'}],[],[],[],'b','v');assert.equal(lines[0].ingredientRef,null);assert.equal(lines[0].orderedQty,2);const changes=receiptChanges({status:'sent'},[{...lines[0],_id:'l'}],[{line:'l',accepted:0,notFilled:2,outcome:'notFilled'}]);assert.equal(changes[0].notFilled,2);assert.equal(changes[0].outcome,'notFilled');assert.equal(receiptChanges({status:'sent'},[{...lines[0],_id:'l'}],[{line:'l',accepted:2}])[0].accepted,2);});
test('weighted grocery lines and placed-order status are supported without purchase approval',()=>{const lines=makeGroceryLines([{productName:'Chicken',quantity:8.06,unitCost:2.89,lineTotal:23.29,purchaseUnit:'lb'}],[],[],[],'b','v');assert.equal(lines[0].orderedQty,8.06);assert.equal(lines[0].packBaseQuantity,453.59237);assert.doesNotThrow(()=>assertOrderTransition({status:'draft',orderType:'grocery'},'sent'));assert.throws(()=>assertOrderTransition({status:'draft',orderType:'purchase'},'sent'));});
test('wrapped product names remain intact during import',()=>{const parsed=parseExistingOrder('Wegmans Special Blends Frozen Potatoes &\nButton Mushrooms\n$5.79/ea\n1\n$5.79\nSubtotal\n$5.79\nTotal\n$5.79');assert.equal(parsed.lines[0].productName,'Wegmans Special Blends Frozen Potatoes & Button Mushrooms');assert.equal(parsed.lines[0].lineTotal,'5.79');});
test('business percentage tax calculates from line-item subtotal with currency rounding',()=>{const result=orderTotals({taxRate:8.875,subtotal:'',tax:999,deliveryFee:4.99,orderType:'grocery',tip:2},[{lineTotal:10},{lineTotal:20}]);assert.equal(result.subtotal,30);assert.equal(result.tax,2.66);assert.equal(result.total,39.65);});
test('receipt line totals without currency symbols are not confused with unit prices',()=>{const parsed=parseExistingOrder('Wegmans Pork & Beans\n$1.49/ea\n4\n5.96\nWegmans Chicken\n$2.89/lb\n8.06 lb\n23.29\nTotal\n29.25');assert.equal(parsed.lines[0].lineTotal,'5.96');assert.equal(parsed.lines[1].lineTotal,'23.29');});

test('courier compensation is an order fee, never a grocery item',()=>{const parsed=parseExistingOrder('Garlic\n$4.59/ea\n1\n$4.59\nCourier Compensation Fee\n$2.00\nOther Fees\n$1.00\nTotal\n$7.59');assert.equal(parsed.lines.length,1);assert.equal(parsed.lines[0].productName,'Garlic');assert.equal(parsed.otherFees,'3');assert.equal(orderTotals(parsed,parsed.lines).total,7.59);});

test('grocery tax is calculated from taxable fees rather than the full food subtotal',()=>{const parsed=parseExistingOrder('Subtotal\n$135.91\nDelivery Fee\n$4.99\nService Fee\nFree\nCourier Compensation Fee\n$5.99\nSales Tax\n$0.97\nTip\n$0.00\nTotal\n$147.86');assert.equal(parsed.taxMode,'itemized');assert.equal(orderTotals({...parsed,taxRate:8.875}).tax,.97);assert.equal(orderTotals({...parsed,taxRate:8.875}).total,147.86);});

test("taxable items and individually selected fees form the tax base, excluding tips",()=>{const result=orderTotals({orderType:"grocery",taxMode:"itemized",taxRate:8.875,subtotal:"",deliveryFee:4.99,serviceFee:5.99,tip:9,taxableFees:{deliveryFee:true,serviceFee:false}},[{lineTotal:100,taxable:false},{lineTotal:10,taxable:true}]);assert.equal(result.taxableSubtotal,14.99);assert.equal(result.tax,1.33);assert.equal(result.total,131.31);});

test('replacement original-item metadata does not hide purchased quantity or total',()=>{const parsed=parseExistingOrder('1 Item replaced\nWegmans Organic Mini Sweet Peppers\n$4.09/ea\nOriginal Item:\n1x Wegmans Mini Sweet Peppers, FAMILY PACK\n2\nOriginal price is:$8.18\nSubtotal\n$8.18\nTotal\n$8.18');assert.equal(parsed.lines.length,1);assert.equal(parsed.lines[0].quantity,'2');assert.equal(parsed.lines[0].lineTotal,'8.18');});
