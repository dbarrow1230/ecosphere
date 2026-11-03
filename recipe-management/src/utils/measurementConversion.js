const normalize=value=>String(value||"").trim().toLowerCase().replace(/[^a-z0-9]+/g," ").trim();

const definitions=[
 {aliases:["milligram","milligrams","mg"],dimension:"mass",system:"metric",factor:.001},
 {aliases:["gram","grams","g"],dimension:"mass",system:"metric",factor:1},
 {aliases:["kilogram","kilograms","kg"],dimension:"mass",system:"metric",factor:1000},
 {aliases:["ounce","ounces","oz"],dimension:"mass",system:"imperial",factor:28.349523125},
 {aliases:["pound","pounds","lb","lbs"],dimension:"mass",system:"imperial",factor:453.59237},
 {aliases:["milliliter","milliliters","millilitre","millilitres","ml"],dimension:"volume",system:"metric",factor:1},
 {aliases:["liter","liters","litre","litres","l"],dimension:"volume",system:"metric",factor:1000},
 {aliases:["teaspoon","teaspoons","tsp"],dimension:"volume",system:"imperial",factor:4.92892159375},
 {aliases:["tablespoon","tablespoons","tbsp"],dimension:"volume",system:"imperial",factor:14.78676478125},
 {aliases:["fluid ounce","fluid ounces","fl oz"],dimension:"volume",system:"imperial",factor:29.5735295625},
 {aliases:["cup","cups"],dimension:"volume",system:"imperial",factor:236.5882365},
 {aliases:["pint","pints","pt"],dimension:"volume",system:"imperial",factor:473.176473},
 {aliases:["quart","quarts","qt"],dimension:"volume",system:"imperial",factor:946.352946},
 {aliases:["gallon","gallons","gal"],dimension:"volume",system:"imperial",factor:3785.411784}
];

const definitionFor=unit=>{
 const values=[normalize(unit?.name),normalize(unit?.symbol)].filter(Boolean);
 return definitions.find(definition=>definition.aliases.some(alias=>values.includes(normalize(alias))))||null;
};

const findUnit=(items,aliases)=>items.find(item=>{
 const values=[normalize(item?.name),normalize(item?.symbol)];
 return aliases.some(alias=>values.includes(normalize(alias)));
})||null;

export const convertMeasurement=(quantity,unitId,sourceUnits,targetUnits)=>{
 const numeric=Number(quantity);
 if(!Number.isFinite(numeric)||!unitId)return null;
 const sourceUnit=sourceUnits.find(item=>String(item._id)===String(unitId));
 const sourceDefinition=definitionFor(sourceUnit);
 if(!sourceDefinition)return null;
 const baseValue=numeric*sourceDefinition.factor;
 let aliases=[];
 if(sourceDefinition.dimension==="mass")aliases=sourceDefinition.system==="imperial"?(baseValue>=1000?["kg"]:["g"]):(baseValue>=453.59237?["lb"]:["oz"]);
 else aliases=sourceDefinition.system==="imperial"?(baseValue>=1000?["l"]:["ml"]):(baseValue>=946.352946?["qt"]:baseValue>=236.5882365?["cup"]:["fl oz"]);
 const targetUnit=findUnit(targetUnits,aliases);
 const targetDefinition=definitionFor(targetUnit);
 if(!targetUnit||!targetDefinition)return null;
 return{quantity:Number((baseValue/targetDefinition.factor).toFixed(4)),unit:String(targetUnit._id)};
};

export const convertBetweenUnits=(quantity,sourceUnitId,targetUnitId,units)=>{
 const numeric=Number(quantity);
 const sourceUnit=units.find(item=>String(item._id)===String(sourceUnitId));
 const targetUnit=units.find(item=>String(item._id)===String(targetUnitId));
 const sourceDefinition=definitionFor(sourceUnit);
 const targetDefinition=definitionFor(targetUnit);
 if(!Number.isFinite(numeric)||!sourceDefinition||!targetDefinition||sourceDefinition.dimension!==targetDefinition.dimension)return null;
 return Number(((numeric*sourceDefinition.factor)/targetDefinition.factor).toFixed(6));
};
