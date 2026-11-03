import test from "node:test";
import assert from "node:assert/strict";
import {assessRecipe,aggregateAssessments,allergyConflicts,declarationStatus} from "../../shared/culinary/allergens.js";
const allergens=[{_id:"milk",name:"Milk"},{_id:"nuts",name:"Nuts"}];
const recipe={_id:"recipe",business:"b",ingredients:[{ingredient:"ingredient",vendorIngredientPrice:"product"}],allergens:["milk"]};
const declarations=status=>({allergenInformation:{declarations:allergens.map(allergen=>({allergen:allergen._id,status,source:"Supplier label",verifiedBy:"Reviewer",verifiedAt:"2026-01-01"}))}});
const ingredient={_id:"ingredient",...declarations("absent")};
const product={_id:"product",business:"b",ingredient:"ingredient",...declarations("absent")};
test("empty declarations do not declare a recipe safe",()=>{
 const result=assessRecipe(recipe,[{_id:"ingredient"}],[{_id:"product",business:"b",ingredient:"ingredient"}],allergens);
 assert.equal(result.risks.find(item=>item.allergen==="milk").status,"present");assert.equal(result.risks.find(item=>item.allergen==="nuts").status,"unknown");assert.equal(result.reviewRequired,true);
});
test("absence requires verified evidence and supplier specificity",()=>{
 assert.equal(declarationStatus({allergenInformation:{declarations:[{allergen:"milk",status:"absent"}]}},"milk").status,"unknown");
 assert.equal(assessRecipe(recipe,[ingredient],[{...product,business:"other"}],allergens).reviewRequired,true);
 const result=assessRecipe(recipe,[ingredient],[product],allergens);assert.equal(result.reviewRequired,false);assert.equal(result.risks[0].status,"present");
 const expired={allergenInformation:{declarations:[{allergen:"milk",status:"absent",source:"Label",verifiedBy:"Reviewer",verifiedAt:"2025-01-01",expiresAt:"2025-02-01"}]}};
 assert.equal(declarationStatus(expired,"milk").status,"unknown");
});
test("cross-contact differs from presence and propagates to menus and customer conflicts",()=>{
 const result=assessRecipe({...recipe,allergens:[]},[ingredient],[{...product,...declarations("cross_contact")}],allergens);
 assert.equal(result.risks[0].status,"cross_contact");const menu=aggregateAssessments([result]);assert.equal(menu.reviewRequired,true);assert.equal(allergyConflicts(menu,["milk"])[0].conflict,"Possible cross-contact");
});
test("changed supplier declarations invalidate the input signature",()=>{
 const old=assessRecipe(recipe,[ingredient],[product],allergens);const changed=assessRecipe(recipe,[ingredient],[{...product,...declarations("present")}],allergens);
 assert.notEqual(old.inputSignature,changed.inputSignature);
 assert.equal(assessRecipe({...recipe,ingredients:[]},[],[],allergens).reviewRequired,true);
});
