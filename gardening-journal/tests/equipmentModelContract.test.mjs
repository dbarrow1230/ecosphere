import test from 'node:test';
import assert from 'node:assert/strict';
import Equipment from '../backend/models/equipment/equipmentModel.js';
import {equipmentDeviceValues,equipmentDevicePayload} from '../src/utils/equipmentFormData.js';
test('the equipment form keeps Equipment device configuration and image references on save',async()=>{
 const source={name:'My saved device',systemType:'hydroponic',serialNumber:'Original serial',productUrl:'https://example.test/device',location:'Original location',podCount:0,reservoirCapacity:'4 L',lightType:'led',pumpType:'air',images:['equipment/original.jpg']};
 const values={...equipmentDeviceValues(source),images:source.images.join('\n')};
 const payload=equipmentDevicePayload(values);
 for(const key of ['serialNumber','productUrl','location','podCount','reservoirCapacity','lightType','pumpType','images'])assert.deepEqual(payload[key],source[key]);
 await new Equipment({...source,...payload}).validate();
});
