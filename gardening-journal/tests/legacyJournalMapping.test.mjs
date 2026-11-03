import test from 'node:test';
import assert from 'node:assert/strict';
import {legacyJournalFields,repairableLegacyJournalCopy} from '../backend/services/legacyJournalMapping.js';

const original={_id:'source',JournalDate:'2024-04-10',Notes:'basil starting to die',LightingID:'10',Nutrients:null};
const copied={_id:'source',title:'Garden journal',entry:'',entryDate:null,planting:null,images:[]};

test('capitalized original Notes and JournalDate become visible content and the correct calendar day',()=>{
 const fields=legacyJournalFields(original);
 assert.equal(fields.entry,'basil starting to die');
 assert.equal(fields.title,'basil starting to die');
 assert.equal(fields.entryDate.toISOString().slice(0,10),'2024-04-10');
 assert(repairableLegacyJournalCopy(original,copied));
});

test('all legacy notes, actions, readings and zero values survive conversion',()=>{
 const source={journal_date:'2025-03-01',growth_stage:'Seedling',stage_progress:'First true leaves',notes:[{note:'Rotate daily',note_date:'2025-03-01'},'Checked roots'],actionsTaken:['Watered'],fertilizer_notes:['Compost'],nutrients:'NPK 5-5-5',phLevel:'6.5',growth_height:{inches:2},weather:{temperature:{fahrenheit:65,celsius:18.3},humidity:55,rain:0},is_indoor:false,photos:[{file_path:'/images/seedling.jpg'}]};
 const fields=legacyJournalFields(source,{sourceName:'Basil',location:'Kitchen'});
 for(const text of ['First true leaves','Rotate daily','Checked roots','Watered','Compost','NPK 5-5-5','6.5','2 in','65 °F','18.3 °C','55%','Rain: 0','Indoors: No','Kitchen'])assert(fields.entry.includes(text),text);
 assert.equal(fields.title,'Basil · Seedling');
 assert.equal(fields.notes.length,2);
 assert.deepEqual(fields.images,['/images/seedling.jpg']);
});

test('repair refuses user-edited bodies, titles, dates, timestamps, links or follow-ups',()=>{
 for(const change of [{entry:'My edited note'},{title:'My title'},{entryDate:new Date('2024-05-01')},{updatedAt:new Date('2026-10-31')},{planting:'new-link'},{notes:[{note:'New follow-up'}]},{legacyJournalMappingVersion:2}])assert.equal(repairableLegacyJournalCopy(original,{...copied,...change}),false,JSON.stringify(change));
});

test('original content and source records are not mutated',()=>{
 const snapshot=JSON.stringify(original);legacyJournalFields(original);assert.equal(JSON.stringify(original),snapshot);
});
