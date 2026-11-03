import test from 'node:test';
import assert from 'node:assert/strict';
import HydroSystem from '../backend/models/hydroponics/hydroSystemModel.js';
import {validateHydroJournalLink,normalizeEntryPayload} from '../backend/controllers/journal/journalEntryController.js';
const run='697000000000000000000001',first='697000000000000000000002',second='697000000000000000000003',pod='697000000000000000000004';
test('pod journal links stay associated with the planting after movement, and cannot be reassigned to another run',async()=>{
 const old=HydroSystem.findById;
 HydroSystem.findById=async()=>({_id:run,devices:[{_id:first,pods:[]},{_id:second,pods:[{_id:pod,position:2,seed:'697000000000000000000005',positionHistory:[{fromDevice:first,toDevice:second,from:1,to:2}]}]}]});
 try{
  const original={_id:'697000000000000000000006',hydroSystem:run,hydroDevice:first,hydroPod:pod,hydroPodPosition:1};
  const updated=normalizeEntryPayload({entry:'Updated observation'},original);
  await validateHydroJournalLink(updated,original);assert.equal(updated.hydroPod,pod);
  await assert.rejects(validateHydroJournalLink({...updated,hydroSystem:'697000000000000000000007'},original),/cannot be changed/);
  await assert.rejects(validateHydroJournalLink({...updated,hydroPod:'697000000000000000000008'},{}),/does not belong/);
 }finally{HydroSystem.findById=old;}
});
