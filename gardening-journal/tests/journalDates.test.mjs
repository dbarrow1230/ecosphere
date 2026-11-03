import test from 'node:test';
import assert from 'node:assert/strict';
import {shiftJournalMonth,journalYears} from '../src/utils/journalDates.js';
test('month navigation crosses year boundaries without date or daylight-saving drift',()=>{
 assert.equal(shiftJournalMonth('2024-01',-1),'2023-12');
 assert.equal(shiftJournalMonth('2024-12',1),'2025-01');
 assert.equal(shiftJournalMonth('2024-03',-1),'2024-02');
});
test('year choices include all saved history and keep the selected year available',()=>{
 assert.deepEqual(journalYears([{entryDate:'2024-04-10T00:00:00.000Z'}],'2026-10',2026),[2027,2026,2025,2024]);
 assert(journalYears([],'2022-01',2026).includes(2022));
});
