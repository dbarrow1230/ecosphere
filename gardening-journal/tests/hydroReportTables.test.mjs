import test from 'node:test';
import assert from 'node:assert/strict';
import {reportTypes,hydroReportTable} from '../src/utils/hydroReportTables.js';
import {buildHydroReports} from '../backend/services/hydroReports.js';
test('all ten dashboard and printable report views retrieve their recorded data and identifiers',()=>{
 const run={_id:'run-a',name:'Original',startedDate:'2024-01-01',devices:[{_id:'device-a',name:'Device',podCount:2,readings:[{recordedAt:'2024-01-02',phLevel:6,temperature:20}],pods:[{_id:'pod-a',seed:{_id:'seed-a',plantName:'Lettuce'},position:2,seedCount:3,plantedDate:'2024-01-01',maxGerminationDays:10,germinationStatus:'failed',failedAt:'2024-01-20',removedAt:'2024-01-20',notes:'Failed attempt observation',positionHistory:[{fromDevice:'device-a',from:1,toDevice:'device-a',to:2,at:'2024-01-05'}]},{_id:'pod-b',seed:{_id:'seed-b',plantName:'Basil'},position:1,seedCount:null,plantedDate:'2024-01-01'}]}]};
 const report=buildHydroReports([run],[],{},new Date('2024-02-01'));
 assert.equal(reportTypes.length,10);
 for(const type of reportTypes){const table=hydroReportTable(report,type);assert.ok(table.columns.length>0,type);assert.ok(table.rows.length>0,type);assert.ok(table.columns.some(([key])=>key==='run'),type);for(const row of table.rows)assert.equal(row.run,'run-a');}
 assert.equal(hydroReportTable(report,'Failed Germination Report').rows.length,1);
 assert.equal(hydroReportTable(report,'Seed Quantity Report').rows[1].seedCount,null);
 assert.equal(hydroReportTable(report,'Pod Positioning Report').rows[0].from,1);
 assert.equal(hydroReportTable(report,'Notes and Observations Report').rows[0].text,'Failed attempt observation');
});
