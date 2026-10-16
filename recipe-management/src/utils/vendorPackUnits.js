import {unitDefinition} from '../../../shared/culinary/pricing.js';
export function vendorPackUnits(records=[]){
 return records.filter(record=>{const unit=unitDefinition(record);return unit&&(unit.dimension==='mass'||unit.dimension==='count'||(unit.dimension==='volume'&&unit.factor>=29.5735295625&&unit.factor!==236.5882365)||unit.dimension==='volume'&&['ml','milliliter','millilitre','l','liter','litre'].includes(String(record.symbol||record.abbreviation||record.name).toLowerCase()));});
}
export const packUnitLabel=unit=>{const symbol=unit.symbol||unit.abbreviation;return unit.name+(symbol?` (${symbol})`:'');};
