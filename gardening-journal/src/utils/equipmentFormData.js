export const equipmentDeviceFields=[['systemType','System type'],['serialNumber','Serial number'],['productUrl','Product URL'],['location','Location'],['podCount','Pod count'],['reservoirCapacity','Reservoir capacity'],['lightType','Light type'],['pumpType','Pump type']];
export function equipmentDeviceValues(item={}){
 return Object.fromEntries(equipmentDeviceFields.map(([name])=>[name,item[name]??'']));
}
export function equipmentDevicePayload(form){
 return {...equipmentDeviceValues(form),podCount:form.podCount===''?0:Number(form.podCount),images:String(form.images||'').split(/\r?\n/).map(value=>value.trim()).filter(Boolean)};
}
