import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {MemoryRouter} from 'react-router-dom';
import {HydroPrintableReport} from '../src/components/dashboard/HydroHistoryReports.jsx';
import {buildHydroReports} from '../backend/services/hydroReports.js';
import {reportTypes} from '../src/utils/hydroReportTables.js';
test('the actual printable React component renders every report with identifiers and preserved unknown values',()=>{
 const report=buildHydroReports([{_id:'run-a',name:'Test run',startedDate:'2024-01-01',devices:[{_id:'device-a',name:'Device',podCount:1,pods:[{_id:'pod-a',position:1,seed:{_id:'seed-a',plantName:'Lettuce'},seedCount:null,notes:'Recorded pod note'}]}]}],[],{},new Date('2026-11-03T12:00:00Z'));
 for(const type of reportTypes){
  const html=renderToStaticMarkup(React.createElement(MemoryRouter,null,React.createElement(HydroPrintableReport,{report,type})));
  assert.ok(html.includes(type),type);assert.ok(html.includes('run-a'),type);assert.ok(html.includes('2026-11-03'),type);assert.ok(html.includes('<table'),type);assert.ok(html.includes('No conclusions or causal effects are inferred'),type);
 }
 const summary=renderToStaticMarkup(React.createElement(MemoryRouter,null,React.createElement(HydroPrintableReport,{report,type:reportTypes[0]})));
 assert.ok(summary.includes('Unrecorded'));assert.ok(summary.includes('Recorded pod note'));assert.ok(summary.includes('Unknown or Unrecorded'));
});
