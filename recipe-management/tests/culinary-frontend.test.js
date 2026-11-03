import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import Module,{createRequire} from "node:module";
const require=createRequire(import.meta.url);const esbuild=require("esbuild");const React=require("react");const {renderToString}=require("react-dom/server");const root=path.resolve(import.meta.dirname,"..");const shared=path.resolve(root,"../shared");
const originalResolve=Module._resolveFilename;
Module._resolveFilename=function(request,parent,...rest){
 if(request==="@shared")request=path.join(shared,"index.js");else if(request.startsWith("@shared/"))request=path.join(shared,request.slice(8));
 if(request==="react"||request.startsWith("react/"))return originalResolve.call(this,request,{...parent,paths:Module._nodeModulePaths(root)},...rest);
 return originalResolve.call(this,request,parent,...rest);
};
const originalJs=Module._extensions[".js"];
Module._extensions[".css"]=()=>{};
Module._extensions[".jsx"]=(module,filename)=>module._compile(esbuild.transformSync(fs.readFileSync(filename,"utf8").replaceAll("import.meta.env","({})"),{loader:"jsx",format:"cjs",jsx:"automatic"}).code,filename);
Module._extensions[".js"]=(module,filename)=>filename.startsWith(path.join(root,"src"))||filename.startsWith(path.join(shared,"culinary"))?module._compile(esbuild.transformSync(fs.readFileSync(filename,"utf8").replaceAll("import.meta.env","({})"),{loader:"jsx",format:"cjs",jsx:"automatic"}).code,filename):originalJs(module,filename);
const RecipeForm=require("../src/pages/forms/recipes/RecipeForm.jsx").default;
const Ingredients=require("../src/pages/forms/recipes/modules/RecipeIngredientsModule.jsx").default;
const ScaleRecipeModal=require("../src/components/recipes/ScaleRecipeModal.jsx").default;
const {AssessmentDisplay}=require(path.join(shared,"culinary/AllergenWorkspace.jsx"));
const MenuPurchasing=require(path.join(shared,"culinary/MenuPurchasingWorkspace.jsx")).default;
const visit=(node,predicate)=>{if(!node||typeof node!=="object")return null;if(predicate(node))return node;for(const child of React.Children.toArray(node.props?.children)){const found=visit(child,predicate);if(found)return found;}return null;};
const harness=(Component,props)=>{
 const original={useState:React.useState,useRef:React.useRef,useEffect:React.useEffect,useCallback:React.useCallback,useMemo:React.useMemo};const states=[],refs=[],effects=[];let cursor=0,refCursor=0;
 React.useState=initial=>{const index=cursor++;if(!(index in states))states[index]=typeof initial==="function"?initial():initial;return[states[index],value=>{states[index]=typeof value==="function"?value(states[index]):value;}];};
 React.useRef=initial=>{const index=refCursor++;refs[index]??={current:initial};return refs[index];};React.useEffect=callback=>effects.push(callback);React.useCallback=callback=>callback;React.useMemo=callback=>callback();
 return{states,effects,render:()=>{cursor=0;refCursor=0;return Component(props);},restore:()=>Object.assign(React,original)};
};
const lookups={ingredients:[{_id:"flour",name:"Flour"},{_id:"sugar",name:"Sugar"}],metricUnits:[{_id:"g",symbol:"g",name:"Gram"},{_id:"kg",symbol:"kg",name:"Kilogram"}],imperialUnits:[],vendors:[{_id:"vendor",legalName:"Supplier"}],vendorIngredientPrices:[{_id:"offer",business:"business",ingredient:"flour",vendor:{_id:"vendor",legalName:"Supplier"},metricQuantity:1,metricUnit:"kg",packCost:4}],cuisines:[],courses:[],categories:[]};
const initial={_id:"recipe",business:"business",name:"Recipe",recipeNumber:"R-1",recipeSequence:1,primaryCuisine:"cuisine",primaryCourse:"course",primaryCategory:"category",ingredients:[{ingredient:"flour",metricQuantity:250,metricUnit:"g"}]};
test("recipe editing assigns converted product costs and clears stale vendor selections",async()=>{
 let saved;const h=harness(RecipeForm,{initialData:initial,lookups,onSubmit:async value=>{saved=value;}});
 try{
  const module=visit(h.render(),node=>node.type===Ingredients);assert.ok(module);
  module.props.chooseVendorPrice(0,"offer");assert.equal(h.states[0].ingredients[0].totalCost,1);
  module.props.arrayChange("ingredients",0,"metricQuantity","500");assert.equal(h.states[0].ingredients[0].totalCost,2);
  await h.render().props.onSubmit({preventDefault(){}});assert.equal(saved.ingredients[0].vendorIngredientPrice,"offer");assert.equal(saved.ingredients[0].totalCost,2);
  module.props.chooseVendor(0,"");assert.equal(h.states[0].ingredients[0].vendorIngredientPrice,"");assert.equal(h.states[0].ingredients[0].totalCost,0);
  module.props.chooseVendorPrice(0,"offer");module.props.chooseIngredient(0,"sugar");assert.equal(h.states[0].ingredients[0].vendor,"");assert.equal(h.states[0].ingredients[0].vendorIngredientPrice,"");
 }finally{h.restore();}
});
test("recipe creation retains optional pricing and existing required classifications",async()=>{
 let saved;const h=harness(RecipeForm,{initialData:{...initial,_id:undefined},lookups,onSubmit:async value=>{saved=value;}});
 try{await h.render().props.onSubmit({preventDefault(){}});assert.equal(saved.name,"Recipe");assert.equal(saved.business,"business");assert.equal(saved.ingredients[0].vendorIngredientPrice,null);assert.equal(saved.ingredients[0].metricQuantity,250);}finally{h.restore();}
});
test("scaling modal still produces the expected conversion factor, servings and yield",()=>{
 let saved;const recipe={...initial,servings:2,yield:{metricQuantity:500,metricUnit:{_id:"g",name:"Gram",symbol:"g"}},servingSize:{metricQuantity:250,metricUnit:{_id:"g",name:"Gram",symbol:"g"}}};
 const h=harness(ScaleRecipeModal,{show:true,recipe,metricUnits:lookups.metricUnits,imperialUnits:[],onSave:value=>{saved=value;}});
 try{h.render();h.effects[0]();const quick=visit(h.render(),node=>Array.isArray(node.props?.children)&&node.props.children[0]===2&&node.props.children[1]==="×");assert.ok(quick);quick.props.onClick();const save=visit(h.render(),node=>node.props?.children==="Save Linked Scaled Recipe");save.props.onClick();assert.equal(saved.factor,2);assert.equal(saved.newServings,4);assert.equal(saved.yieldOverride.metricQuantity,1000);}finally{h.restore();}
});
test("ingredient comparison, menu purchasing, and allergen risks render without dropping distinctions",()=>{
 const html=renderToString(React.createElement(Ingredients,{data:{business:"business",ingredients:[{...initial.ingredients[0],note:"",preparation:"",time:""}]},lookups,SelectOptions:()=>null}));assert.ok(html.includes("Lowest comparable"));assert.ok(html.includes("Supplier"));
 const allergyHtml=renderToString(React.createElement(AssessmentDisplay,{assessment:{reviewRequired:true,risks:[{allergen:"milk",name:"Milk",status:"cross_contact",verified:false}]}}));assert.ok(allergyHtml.includes("Possible cross-contact"));assert.ok(allergyHtml.includes("Requires verification"));
 const purchasingHtml=renderToString(React.createElement(MenuPurchasing,{options:{menus:[],menuItems:[],recipes:[],events:[],ingredients:[],inventory:[],vendors:[],allergens:[]},catering:true}));assert.ok(purchasingHtml.includes("Compare purchasing options"));
});
test("selected recipe review renders unassigned ingredients without expanding its lists",()=>{
 const Workspace=require(path.join(shared,"culinary/CulinaryWorkspace.jsx")).default;
 const h=harness(Workspace,{business:"business",recipe:"recipe"});
 try{
  h.render();h.states[0]=true;h.states[3]={recipes:[{_id:"recipe",name:"Recipe"}],ingredients:[{_id:"flour",name:"Flour"}],recipeIngredients:[{ingredient:"flour",name:"Flour",quantity:"250 g",vendor:"",offering:""}],costReviews:[],offers:[],allergens:[]};
  const component=visit(h.render(),node=>node.type?.name==="CostReview");assert.ok(component);h.restore();
  const html=renderToString(React.createElement(component.type,component.props));assert.ok(html.includes("Flour"));assert.ok(html.includes("250 g"));assert.ok(html.includes("No vendor assigned"));assert.ok(html.includes("price unavailable"));assert.ok(!html.includes("<details open"));
 }finally{h.restore();}
});

test("opening a selected recipe review shows content without an options API response",()=>{
 const Workspace=require(path.join(shared,"culinary/CulinaryWorkspace.jsx")).default;
 const h=harness(Workspace,{business:"business",recipe:"recipe",recipeRecord:{...initial,ingredients:[{ingredient:{_id:"flour",name:"Flour"},metricQuantity:250,metricUnit:{_id:"g",symbol:"g"}}]},recipeLookups:lookups});
 try{
  h.render();h.states[0]=true;
  const component=visit(h.render(),node=>node.type?.name==="CostReview");assert.ok(component);assert.equal(h.states[3],null);assert.equal(component.props.options.recipeIngredients[0].name,"Flour");assert.equal(component.props.options.costReviews.length,1);
  h.restore();const html=renderToString(React.createElement(component.type,component.props));assert.ok(html.includes("250 g"));assert.ok(html.includes("No vendor assigned"));assert.ok(html.includes("Selected recipe cost breakdown"));
 }finally{h.restore();}
});
test("existing vendor ingredients resolve their saved name and allow renaming without changing the ingredient ID",()=>{
 const IngredientForm=require("../src/pages/forms/recipes/IngredientForm.jsx").default;let saved;
 const h=harness(IngredientForm,{initialData:{_id:"product",ingredient:"ingredient",packCost:10},vendor:{_id:"vendor",business_id:"business",legalName:"Supplier"},ingredients:[{_id:"ingredient",name:"Incorrect name",unit:"g"}],onSubmit:value=>{saved=value;}});
 try{
  h.render();h.effects[0]();let tree=h.render();const name=visit(tree,node=>node.props?.name==="name");assert.equal(name.props.value,"Incorrect name");assert.ok(!name.props.readOnly);
  name.props.onChange({target:{name:"name",value:"Corrected ingredient",type:"text"}});tree=h.render();tree.props.onSubmit({preventDefault(){}});
  assert.equal(saved.name,"Corrected ingredient");assert.equal(saved.ingredient,"ingredient");assert.equal(saved.vendor,"vendor");
 }finally{h.restore();}
});
test("editing a vendor product retains the ingredient dropdown and populates the selected record",()=>{
 const IngredientForm=require("../src/pages/forms/recipes/IngredientForm.jsx").default;let saved;
 const h=harness(IngredientForm,{initialData:{_id:"product",ingredient:"old",brand:"Brand",packCost:10},vendor:{_id:"vendor",business_id:"business"},ingredients:[{_id:"old",name:"Old ingredient",unit:"g"},{_id:"correct",name:"Correct ingredient",description:"Correct description",unit:"ml"}],onSubmit:value=>{saved=value;}});
 try{h.render();h.effects[0]();let tree=h.render();const dropdown=visit(tree,node=>node.props?.onChange&&node.props?.value==="old"&&node.props?.children?.[0]?.props?.children==="Select ingredient");assert.ok(dropdown);dropdown.props.onChange({target:{value:"correct"}});tree=h.render();assert.equal(visit(tree,node=>node.props?.name==="name").props.value,"Correct ingredient");assert.equal(visit(tree,node=>node.props?.name==="description").props.value,"Correct description");assert.equal(visit(tree,node=>node.props?.name==="defaultUnit").props.value,"ml");tree.props.onSubmit({preventDefault(){}});assert.equal(saved.ingredient,"correct");assert.equal(saved.reassignIngredient,true);assert.equal(saved.brand,"Brand");}finally{h.restore();}
});
test("selected recipe cost refresh is disabled without active pricing and accepts a zero-cost offering",()=>{
 const Workspace=require(path.join(shared,"culinary/CulinaryWorkspace.jsx")).default;
 const h=harness(Workspace,{business:"business",recipe:"recipe"});let component;
 try{h.render();h.states[0]=true;h.states[3]={recipes:[{_id:"recipe",name:"Recipe"}],ingredients:[],recipeIngredients:[],costReviews:[],offers:[],allergens:[]};component=visit(h.render(),node=>node.type?.name==="CostReview");}finally{h.restore();}
 const disabled=offers=>{const cost=harness(component.type,{...component.props,options:{...component.props.options,offers}});try{return visit(cost.render(),node=>node.props?.children==="Refresh selected recipe cost").props.disabled;}finally{cost.restore();}};
 assert.equal(disabled([]),true);assert.equal(disabled([{packCost:""}]),true);assert.equal(disabled([{packCost:12,isActive:false}]),true);assert.equal(disabled([{packCost:12}]),false);assert.equal(disabled([{packCost:0}]),false);
});
test("recipe review popup opens only on request and keeps its scrolling inside the modal",()=>{
 const Workspace=require(path.join(shared,"culinary/CulinaryWorkspace.jsx")).default;
 const h=harness(Workspace,{popup:true,business:"business",recipe:"recipe",recipeRecord:initial,recipeLookups:lookups});
 try{let tree=h.render();let modal=visit(tree,node=>typeof node.props?.show==="boolean"&&node.props?.scrollable===true);assert.ok(modal);assert.equal(modal.props.show,false);const button=visit(tree,node=>node.props?.children==="Costs & allergens");assert.ok(button);button.props.onClick();tree=h.render();modal=visit(tree,node=>typeof node.props?.show==="boolean"&&node.props?.scrollable===true);assert.equal(modal.props.show,true);modal.props.onHide();assert.equal(h.states[0],false);}finally{h.restore();}
});

test("recipe review sits beside the cost and toolbar actions open in the right drawer",()=>{
 const Recipes=require("../src/pages/recipes/Recipes.jsx").default;
 const Detail=require("../src/components/recipes/RecipeDetailView.jsx").default;
 const h=harness(Recipes,{});
 try{h.render();h.states[0]=[initial];h.states[2]="recipe";let tree=h.render();const detail=visit(tree,node=>node.type===Detail);assert.ok(detail);assert.equal(detail.props.costReviewAction.props.children,"Cost Recipe");assert.equal(detail.props.costReviewAction.props.size,"sm");assert.equal(detail.props.allergenReviewAction.props.triggerLabel,"Review Allergens");
  let drawer=visit(tree,node=>node.props?.placement==="end");assert.ok(drawer);assert.equal(drawer.props.show,false);visit(tree,node=>node.props?.children==="Actions").props.onClick();tree=h.render();drawer=visit(tree,node=>node.props?.placement==="end");assert.equal(drawer.props.show,true);assert.ok(visit(drawer,node=>node.props?.children==="Add Recipe"));assert.equal(visit(drawer,node=>node.props?.children==="Cost Recipe").props.disabled,false);assert.ok(visit(drawer,node=>node.props?.children==="Recipe Costing Sheets"));drawer.props.onHide();assert.equal(h.states[10],false);
  h.restore();const html=renderToString(React.createElement(Detail,{recipe:initial,imageUrl:()=>"",costReviewAction:React.createElement("button",null,"Review")}));assert.match(html,/recipe-cost-value[\s\S]*?<button>Review<\/button>/);
 }finally{h.restore();}
});

test("review scopes keep recipe allergens and costing prices in their respective apps",()=>{
 const Workspace=require(path.join(shared,"culinary/CulinaryWorkspace.jsx")).default;
 for(const review of ["costs","allergens","menus"]){
  const h=harness(Workspace,{business:"business",review,menus:review==="menus"});
  try{h.render();h.states[0]=true;h.states[3]={recipes:[],ingredients:[],offers:[],allergens:[]};const tree=h.render();assert.equal(Boolean(visit(tree,node=>node.props?.eventKey==="costs")),review==="costs");assert.equal(Boolean(visit(tree,node=>node.props?.eventKey==="allergens")),review==="allergens");assert.equal(Boolean(visit(tree,node=>node.props?.eventKey==="menus")),review==="menus");}finally{h.restore();}
 }
});
test("adding a vendor from its existing form updates and selects the price-form dropdown",async()=>{
 const PriceForm=require("../src/pages/forms/recipes/CostingVendorIngredientForm.jsx").default;
 const originalFetch=global.fetch;global.fetch=async(url,options)=>{assert.equal(url,"/api/vendors");assert.equal(JSON.parse(options.body).legalName,"New supplier");return{ok:true,json:async()=>({_id:"new-vendor",legalName:"New supplier"})};};
 const h=harness(PriceForm,{business:"business",ingredient:{_id:"flour",name:"Flour"},onClose(){},onSave(){}});
 try{let tree=h.render();visit(tree,node=>node.props?.children==="Add Vendor"&&node.props?.onClick).props.onClick();tree=h.render();const form=visit(tree,node=>node.type?.name==="VendorForm");assert.ok(form);assert.equal(form.props.initialData.business_id,"business");await form.props.onSubmit({legalName:"New supplier",business_id:"business"});tree=h.render();const dropdown=visit(tree,node=>node.props?.name==="vendor");assert.equal(dropdown.props.value,"new-vendor");assert.equal(dropdown.props.options[0]._id,"new-vendor");assert.equal(h.states[3],null);}finally{h.restore();global.fetch=originalFetch;}
});

test("cost summary reconciles automatic pricing, overridden prices, yield, and losses",()=>{
 const Costings=require("../src/pages/RecipeCostings.jsx").default;
 for(const [price,expected] of [["",["$30.00","$30.00","$30.00","$10.00","$100.00","$90.00","$9.00","$10.00","30.0%","10.0%"]],["200",["$30.00","$60.00","$60.00","$50.00","$200.00","$150.00","$15.00","$20.00","15.0%","25.0%"]],["50",["$30.00","$15.00","$15.00","$-10.00","$50.00","$60.00","$6.00","$5.00","60.0%","-20.0%"]]]){
  const h=harness(Costings,{});
  try{h.render();h.states[5]={business:"business",recipe:"recipe",yieldQuantity:"10",foodCostPercent:"30",laborCostPercent:"30",overheadCostPercent:"30",profitPercent:"10",sellingPrice:price,notes:"",ingredients:[{ingredient:"flour",ingredientRecord:{_id:"flour",name:"Flour"},imperialQuantity:"",metricQuantity:"3",metricUnit:"g",unitCost:"10",totalCost:30}]};h.states[7]="edit";h.states[8]=false;
   const summary=visit(h.render(),node=>node.props?.className==="recipe-costing-panel costing-summary");assert.ok(summary);const dl=visit(summary,node=>node.type==="dl");const values=React.Children.toArray(dl.props.children).map(row=>React.Children.toArray(row.props.children).find(node=>node.type==="dd")).map(node=>React.Children.toArray(node.props.children).join(""));assert.deepEqual(values,expected);
  }finally{h.restore();}
 }
});

test("merged costing uses Recipe Management's vendor ingredient form and preserves ingredient context",async()=>{
 const PriceForm=require("../src/pages/forms/recipes/CostingVendorIngredientForm.jsx").default;
 const IngredientForm=require("../src/pages/forms/recipes/IngredientForm.jsx").default;let saved;const calls=[];const previousFetch=global.fetch;
 global.fetch=async(url,options)=>{calls.push({url,body:JSON.parse(options.body)});return{ok:true,json:async()=>({ingredient:{_id:"flour"}})};};
 const ingredient={_id:"flour",name:"Flour",unit:"g"};const h=harness(PriceForm,{business:"business",ingredient,onClose(){},onSave:async value=>{saved=value;}});
 try{h.render();h.states[0]="vendor";h.states[1]={vendors:[{_id:"vendor",legalName:"Supplier",business_id:"business"}],ingredients:[ingredient],businesses:[],imperialUnits:[],metricUnits:[]};const form=visit(h.render(),node=>node.type===IngredientForm);assert.ok(form);assert.equal(form.props.initialData.ingredient,ingredient);await form.props.onSubmit({ingredient:"flour",vendor:"vendor",business:"business",name:"Correct Flour",description:"Description",defaultUnit:"g",ingredientNotes:"Keep",productCategory:"supplier",packCost:4});assert.equal(calls[0].url,"/api/ingredients/flour");assert.equal(calls[0].body.unit,"g");assert.equal(calls[0].body.category,undefined);assert.equal(saved.productCategory,"supplier");assert.equal(saved.ingredient,"flour");assert.equal(saved.business,"business");assert.equal(saved.packCost,4);assert.equal(saved.name,undefined);}finally{h.restore();global.fetch=previousFetch;}
});
test("saved vendor prices from Recipe Management's API are immediately applied to the costing line",async()=>{
 const Costings=require("../src/pages/RecipeCostings.jsx").default;const PriceForm=require("../src/pages/forms/recipes/CostingVendorIngredientForm.jsx").default;
 const price={_id:"price",business:"business",ingredient:"flour",vendor:{_id:"vendor"},metricQuantity:1,metricUnit:{_id:"kg",symbol:"kg",name:"Kilogram"},packCost:4};const previousFetch=global.fetch;global.fetch=async(url)=>({ok:true,json:async()=>url.includes('?')?[price]:{vendorIngredientPrice:price}});
 const h=harness(Costings,{});
 try{h.render();h.states[5]={business:"business",recipe:"recipe",yieldQuantity:"1",foodCostPercent:"30",laborCostPercent:"30",overheadCostPercent:"30",profitPercent:"10",sellingPrice:"",notes:"",ingredients:[{ingredient:"flour",ingredientRecord:{_id:"flour",name:"Flour"},imperialQuantity:"",metricQuantity:250,metricUnit:"g",metricUnitRecord:{_id:"g",symbol:"g",name:"Gram"},unitCost:"0",totalCost:0}]};h.states[7]="edit";h.states[8]=false;h.states[11]={index:0,ingredient:{_id:"flour",name:"Flour"}};const form=visit(h.render(),node=>node.type===PriceForm);assert.ok(form);await form.props.onSave(price);assert.equal(h.states[5].ingredients[0].vendorIngredientPrice,"price");assert.equal(h.states[5].ingredients[0].totalCost,1);assert.equal(h.states[4][0]._id,"price");}finally{h.restore();global.fetch=previousFetch;}
});
test("dashboard costing coverage is scoped to business and preserves useful existing components",()=>{
 const {costingOverview}=require("../src/components/dashboard/CostingOverviewPanel.jsx");
 const result=costingOverview([{_id:"recipe",business:"a"},{_id:"recipe",business:"b"},{_id:"inactive",business:"a",isActive:false}],[{_id:"saved",business:"a",recipe:"recipe",updatedAt:"2026-10-13"},{_id:"archived",business:"b",recipe:"recipe",isActive:false}]);assert.equal(result.costed,1);assert.equal(result.uncosted.length,1);assert.equal(result.uncosted[0].business,"b");assert.equal(result.recent.length,1);
});

test("costing setup defaults to Recipe Management without a business dropdown",async()=>{
 const Costings=require("../src/pages/RecipeCostings.jsx").default;const previousFetch=global.fetch;
 const business={_id:"management",legalName:"Recipe Management"};global.fetch=async url=>({ok:true,json:async()=>url.includes('current-business')?{business}:url==='/api/businesses'?[business]:[]});
 const h=harness(Costings,{});
 try{h.render();h.effects[0]();await new Promise(resolve=>setImmediate(resolve));let tree=h.render();visit(tree,node=>node.props?.children==="Cost a Recipe").props.onClick();tree=h.render();assert.equal(h.states[5].business,"management");const field=visit(tree,node=>node.props?.className==="costing-business-field");assert.ok(field);assert.equal(visit(field,node=>node.type==="span").props.children,"Recipe Management");assert.equal(visit(field,node=>node.props?.options),null);assert.ok(visit(tree,node=>node.props?.className==="costing-yield-field"));}finally{h.restore();global.fetch=previousFetch;}
});
test("recipe financial summary uses the saved costing price, including a zero price",()=>{
 const Detail=require("../src/components/recipes/RecipeDetailView.jsx").default;
 for(const price of [20,0]){const html=renderToString(React.createElement(Detail,{recipe:{...initial,suggestedPrice:1,recipeCosting:{pricing:{suggestedPrice:price},totals:{totalCost:5}}},imageUrl:()=>""}));assert.ok(html.replaceAll("<!-- -->","").includes(`$${price.toFixed(2)}`));assert.ok(html.replaceAll("<!-- -->","").includes(`$${(price-5).toFixed(2)}`));}
});

test("vendor products use the selected vendor's existing offers and vendor categories",()=>{
 const {vendorProductRows}=require("../src/components/vendors/VendorProductsPanel.jsx");
 const ingredient={_id:"flour",name:"Flour",category:{_id:"baking",name:"Baking"}};
 const products=vendorProductRows([{_id:"one",vendor:{_id:"vendor"},ingredient:"flour",productCategory:"baking"},{_id:"other",vendor:"other",ingredient:"flour"},{_id:"inactive",vendor:"vendor",ingredient:"flour",isActive:false},{_id:"two",vendor:"vendor",ingredient:{_id:"water",name:"Water"}}],[ingredient],{_id:"vendor"},[{_id:"baking",name:"Supplier Products"}]);assert.equal(products.length,2);assert.equal(products[0]._id,"one");assert.equal(products[0].categoryName,"Supplier Products");assert.equal(products[1].categoryId,"uncategorized");
});
test("vendor product category filters and editor remain tied to the selected vendor",()=>{
 const Panel=require("../src/components/vendors/VendorProductsPanel.jsx").default;const PriceForm=require("../src/pages/forms/recipes/CostingVendorIngredientForm.jsx").default;const vendor={_id:"vendor",business_id:"business",legalName:"Supplier"};const h=harness(Panel,{vendor});
 try{h.render();h.states[0]=[{_id:"flour-price",vendor:"vendor",ingredient:"flour",productCategory:"baking",packCost:4},{_id:"water-price",vendor:"vendor",ingredient:"water",packCost:1}];h.states[1]=[{_id:"flour",name:"Flour",category:{_id:"baking",name:"Baking"}},{_id:"water",name:"Water"}];h.states[5]=false;h.states[9]=[{_id:"baking",name:"Supplier Products"}];let tree=h.render();visit(tree,node=>node.props?.['aria-label']==="Product category").props.onChange({target:{value:"baking"}});tree=h.render();const body=visit(tree,node=>node.type==="tbody");assert.equal(React.Children.toArray(body.props.children).length,1);visit(body,node=>node.props?.children==="Edit").props.onClick();const form=visit(h.render(),node=>node.type===PriceForm);assert.equal(form.props.vendor,vendor);assert.equal(form.props.row._id,"flour-price");assert.equal(form.props.business,"business");}finally{h.restore();}
});
test("vendor page embeds products for its selected record",()=>{
 const Vendors=require("../src/pages/admin/Vendors.jsx").default;const Panel=require("../src/components/vendors/VendorProductsPanel.jsx").default;const vendor={_id:"vendor",legalName:"Supplier"};const h=harness(Vendors,{});try{h.render();h.states[0]=[vendor];h.states[2]="vendor";const panel=visit(h.render(),node=>node.type===Panel);assert.equal(panel.props.vendor,vendor);assert.ok(panel.key.endsWith("vendor"));}finally{h.restore();}
});

test("default recipe unit offers imperial and metric options and still accepts manual input",()=>{
 const IngredientForm=require("../src/pages/forms/recipes/IngredientForm.jsx").default;let saved;const h=harness(IngredientForm,{vendor:{_id:"vendor",legalName:"Supplier"},imperialUnits:[{_id:"oz",name:"Ounce",symbol:"oz"}],metricUnits:[{_id:"g",name:"Gram",symbol:"g"}],onSubmit:value=>{saved=value;}});
 try{h.render();h.effects[0]();let tree=h.render();const ounce=visit(tree,node=>node.props?.onClick&&node.key?.endsWith('oz'));assert.ok(ounce);ounce.props.onClick();tree=h.render();assert.equal(visit(tree,node=>node.props?.name==="defaultUnit").props.value,"oz");visit(tree,node=>node.props?.name==="defaultUnit").props.onChange({target:{name:"defaultUnit",value:"scoop",type:"text"}});h.render().props.onSubmit({preventDefault(){}});assert.equal(saved.defaultUnit,"scoop");assert.ok(visit(tree,node=>node.props?.className==="vendor-ingredient-banner"));}finally{h.restore();}
});
test("vendor form fixes its business and provides Cancel",()=>{
 const VendorForm=require("../src/pages/forms/admin/VendorForm.jsx").default;let cancelled=false;const h=harness(VendorForm,{fixedBusiness:{_id:"business",legalName:"Recipe Management"},onCancel:()=>{cancelled=true;}});
 try{h.render();h.effects[0]();const tree=h.render();assert.equal(h.states[0].business_id,"business");assert.equal(visit(tree,node=>node.props?.name==="business_id"&&node.props?.options),null);assert.ok(visit(tree,node=>node.props?.readOnly&&node.props?.value==="Recipe Management"));visit(tree,node=>node.props?.children==="Cancel").props.onClick();assert.equal(cancelled,true);}finally{h.restore();}
});
test("label rows never render vendor or costing controls",()=>{
 const module=harness(Ingredients,{data:{business:"business",ingredients:[{rowType:"label",sourceName:"For the sauce"}]},lookups,SelectOptions:()=>null,arrayChange(){},removeRow(){},addIngredient(){}});try{const tree=module.render();assert.ok(visit(tree,node=>node.props?.['aria-label']==="Ingredient label"));assert.equal(visit(tree,node=>node.props?.['aria-label']==="Vendor product"),null);assert.equal(visit(tree,node=>node.props?.['aria-label']==="Ingredient vendor"),null);}finally{module.restore();}
});

test("labels save as recipe text without creating ingredient records",async()=>{
 let saved;const h=harness(RecipeForm,{initialData:{...initial,_id:undefined,ingredients:[...initial.ingredients,{rowType:"label",sourceName:"For the sauce",unitCost:99,totalCost:99}]},lookups,onCreateLookup:()=>{throw new Error('Labels must not create ingredient records');},onSubmit:async value=>{saved=value;}});
 try{await h.render().props.onSubmit({preventDefault(){}});const label=saved.ingredients.find(line=>line.rowType==="label");assert.ok(label);assert.equal(label.sourceName,"For the sauce");assert.equal(label.totalCost,undefined);assert.equal(label.ingredient,undefined);}finally{h.restore();}
});
test("vendor reference emails are clickable and ratings display fractional stars",()=>{
 const Vendors=require("../src/pages/admin/Vendors.jsx").default;const h=harness(Vendors,{});try{h.render();h.states[0]=[{_id:"vendor",legalName:"Supplier",email:"orders@example.com",performance:{rating:4.8}}];h.states[2]="vendor";const tree=h.render();assert.ok(visit(tree,node=>node.type==="a"&&node.props?.href==="mailto:orders@example.com"));const stars=visit(tree,node=>node.props?.className==="vendor-rating");assert.equal(stars.props['aria-label'],"4.8 out of 5 stars");assert.equal(React.Children.toArray(stars.props.children)[1].props.style.width,"96%");}finally{h.restore();}
});

test("vendor price history shows signed changes and handles a zero starting price",()=>{
 const {productPriceHistory}=require("../src/components/vendors/ProductPriceHistory.jsx");
 const history=productPriceHistory({packCost:9,priceHistory:[{packCost:10},{packCost:12}]});
 assert.equal(history[1].percent,20);assert.equal(history[2].percent,-25);assert.equal(history[2].change,-3);assert.equal(history[2].current,true);
 assert.equal(productPriceHistory({packCost:4,priceHistory:[{packCost:0}]} )[1].percent,null);
 assert.equal(productPriceHistory({packCost:4})[0].change,null);
});

test("price impact calculator reconciles totals and signed percentage changes",()=>{
 const {priceImpact}=require("../src/components/vendors/ProductPriceHistory.jsx");
 const result=priceImpact('2.85','3.65','20');assert.equal(result.previous,57);assert.equal(result.next,73);assert.equal(result.difference,16);assert.ok(Math.abs(result.percent-28.070175)<0.00001);
 assert.equal(priceImpact(4,3,2).percent,-25);assert.equal(priceImpact(0,3,2).percent,null);assert.equal(priceImpact('',3,2),null);assert.equal(priceImpact(3,4,-1),null);
});

test("price-only updates exclude product details and retain previous prices",async()=>{
 const {priceUpdatePayload}=require("../src/components/vendors/UpdateProductPrice.jsx");
 const {buildPriceUpdate}=await import("../../shared/culinary/vendorHistory.js");
 const existing={business:'business',vendor:'vendor',ingredient:'ingredient',packCost:4,unitCost:.8,effectiveDate:'2026-01-01',brand:'Keep',packSizeName:'Jar'};
 const payload=priceUpdatePayload(existing,{packCost:'5',unitCost:'1',effectiveDate:'2026-10-14'});
 assert.deepEqual(Object.keys(payload).sort(),['business','effectiveDate','ingredient','packCost','unitCost','unitCostOverride','vendor']);
 const update=buildPriceUpdate(existing,payload);assert.equal(update.$push.priceHistory.packCost,4);assert.equal(update.$set.packCost,5);assert.equal(update.$set.brand,undefined);assert.equal(update.$set.packSizeName,undefined);
});

test("vendor form saves fractional ratings without changing other performance values",()=>{
 const VendorForm=require("../src/pages/forms/admin/VendorForm.jsx").default;let saved;
 const h=harness(VendorForm,{initialData:{legalName:'Supplier',performance:{rating:3,onTimeRate:98}},onSubmit:value=>{saved=value;}});
 try{h.render();h.effects[0]();let tree=h.render();const field=visit(tree,node=>node.props?.id==='vendor-rating'&&node.props?.type==='number');assert.equal(field.props.max,'5');field.props.onChange({target:{value:'4.5'}});tree=h.render();visit(tree,node=>node.props?.onSubmit).props.onSubmit({preventDefault(){}});assert.equal(saved.performance.rating,4.5);assert.equal(saved.performance.onTimeRate,98);}finally{h.restore();}
});

test("vendor accordion groups all descendants under their main category",()=>{
 const {groupVendorProducts}=require("../src/components/vendors/VendorProductsPanel.jsx");
 const groups=groupVendorProducts([{_id:'a',categoryId:'mushrooms'},{_id:'b',categoryId:'vegetables'},{_id:'c',categoryId:'beef'},{_id:'d',categoryId:'uncategorized'}],[{_id:'produce',name:'Produce'},{_id:'vegetables',name:'Vegetables',parent:'produce'},{_id:'mushrooms',name:'Mushrooms',parent:'vegetables'},{_id:'meat',name:'Meat'},{_id:'beef',name:'Beef',parent:'meat'}]);
 assert.equal(groups.find(group=>group.name==='Produce').items.length,2);assert.equal(groups.find(group=>group.name==='Meat').items[0]._id,'c');assert.equal(groups.find(group=>group.name==='Uncategorized').items[0]._id,'d');
});

test("current price marker and calculations use effective dates rather than last entered record",()=>{
 const {productPriceHistory}=require("../src/components/vendors/ProductPriceHistory.jsx");const history=productPriceHistory({packCost:8.09,effectiveDate:'2026-05-10',priceHistory:[{packCost:6.99,effectiveDate:'2026-07-11'}]});assert.equal(history[0].current,false);assert.equal(history[1].current,true);assert.equal(history[1].price,6.99);assert.ok(history[1].percent<0);
});

test("average price requires three dated observations and calculates their mean",()=>{
 const {averagePackPrice}=require("../src/components/vendors/ProductPriceHistory.jsx");const history=[{price:3,effectiveDate:'2026-01-01'},{price:4,effectiveDate:'2026-02-01'},{price:5,effectiveDate:'2026-03-01'}];assert.equal(averagePackPrice(history),4);assert.equal(averagePackPrice(history.slice(0,2)),null);assert.equal(averagePackPrice([history[0],history[0],history[1]]),null);
});

test("New Order carries the selected vendor in both its URL and navigation state",()=>{
 const Vendors=require("../src/pages/admin/Vendors.jsx").default;const h=harness(Vendors,{});
 try{h.render();h.states[0]=[{_id:'amazon',legalName:'Amazon'},{_id:'wegmans',legalName:'Wegmans'}];h.states[2]='wegmans';const link=visit(h.render(),node=>node.props?.children==='New Order');assert.equal(link.props.to,'/purchasing?vendor=wegmans&new=1');assert.deepEqual(link.props.state,{vendorId:'wegmans',vendorName:'Wegmans'});}finally{h.restore();}
});
