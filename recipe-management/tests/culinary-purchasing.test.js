import test from "node:test";
import assert from "node:assert/strict";
import {consolidateRequirements,purchasingComparison,purchasingCsv} from "../../shared/culinary/purchasing.js";
const records=[{_id:"kg",symbol:"kg"},{_id:"g",symbol:"g"},{_id:"l",symbol:"l"}];
const requirement={key:"i:mass",ingredient:"i",dimension:"mass",baseUnit:"g",requiredQuantity:1500};
const offer={_id:"p",business:"b",vendor:"v",ingredient:"i",metricQuantity:1,metricUnit:"kg",packCost:10,availablePacks:10};
test("purchasing consolidates compatible recipe quantities and scales",()=>{
 const result=consolidateRequirements([{recipe:{_id:"r",ingredients:[{ingredient:"i",metricQuantity:1,metricUnit:"kg"},{ingredient:"i",metricQuantity:500,metricUnit:"g"}]},factor:2}],records);
 assert.equal(result.requirements.length,1);assert.equal(result.requirements[0].requiredQuantity,3000);assert.equal(result.issues.length,0);
});
test("inventory is scoped, committed stock excluded, and full packs purchased",()=>{
 const result=purchasingComparison({requirements:[requirement],offers:[offer],inventory:[{business:"b",ingredient:"i",quantityOnHand:600,committedQuantity:100,unit:"g"},{business:"other",ingredient:"i",quantityOnHand:9999,unit:"g"}],business:"b",records,vendors:[{_id:"v",purchasingTerms:{deliveryCost:3,minimumOrder:0}}]});
 assert.equal(result.lines[0].neededQuantity,1000);assert.equal(result.multipleVendor.orders[0].lines[0].packs,1);assert.equal(result.multipleVendor.total,13);
});
test("delivery and order minima can favor a more expensive ingredient",()=>{
 const result=purchasingComparison({requirements:[requirement],offers:[offer,{...offer,_id:"q",vendor:"w",packCost:11}],business:"b",records,vendors:[{_id:"v",purchasingTerms:{deliveryCost:20,minimumOrder:0}},{_id:"w",purchasingTerms:{deliveryCost:0,minimumOrder:0}}]});
 assert.equal(result.multipleVendor.orders[0].vendor,"w");assert.equal(result.multipleVendor.total,22);
 const minimum=purchasingComparison({requirements:[requirement],offers:[offer],business:"b",records,vendors:[{_id:"v",purchasingTerms:{deliveryCost:0,minimumOrder:50}}]});assert.equal(minimum.multipleVendor,null);assert.equal(minimum.singleVendor[0].complete,false);
});
test("manual unavailable offerings and incomplete searches cannot claim an optimum",()=>{
 const unavailable=purchasingComparison({requirements:[requirement],offers:[{...offer,availablePacks:1}],business:"b",records});assert.equal(unavailable.multipleVendor,null);
 const manual=purchasingComparison({requirements:[requirement],offers:[offer],business:"b",records,manual:{"i:mass":"missing"}});assert.equal(manual.manualPlan.complete,false);
 const capped=purchasingComparison({requirements:[requirement],offers:[offer],business:"b",records,maxCombinations:0});assert.equal(capped.searchComplete,false);
 assert.ok(purchasingCsv({orders:[{name:"=danger",total:10,lines:[{ingredient:"i"}]}]}).includes("'=danger"));
});
test("known pack multiples and quantity minima affect purchasing eligibility",()=>{
 const result=purchasingComparison({requirements:[requirement],offers:[offer],business:"b",records,vendors:[{_id:"v",purchasingTerms:{minimumOrder:0,deliveryCost:0,packMultiple:3,minimumPacks:3}}]});
 assert.equal(result.multipleVendor.orders[0].lines[0].packs,3);assert.equal(result.multipleVendor.total,30);
 const unknownMinimum=purchasingComparison({requirements:[requirement],offers:[offer],business:"b",records,vendors:[{_id:"v",purchasingTerms:{minimumOrder:0,deliveryCost:0,quantityMinimumUnresolved:true}}]});assert.equal(unknownMinimum.singleVendor[0].complete,false);assert.equal(unknownMinimum.multipleVendor,null);
});
