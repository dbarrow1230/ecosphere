import test from "node:test";
import assert from "node:assert/strict";
import {buildCropCalendarEvents,dateForSavedCrop} from "../src/utils/growing/cropCalendarEvents.js";
import FruitCalendar from "../backend/models/planning/fruitCalendarModel.js";
import VegetableCalendar from "../backend/models/planning/vegetableCalendarModel.js";

test("saved crops create separate sow, plant and harvest windows",()=>{
 const row={_id:"crop-1",name:"Tomato",variety:"Cherry",sowMonths:[3],plantMonths:[5],harvestMonths:[8,9]};
 const events=buildCropCalendarEvents([row],2026);
 assert.equal(events.length,4);
 assert.equal(events[0].title,"Sow: Tomato (Cherry)");
 assert.equal(events[0].start.getMonth(),2);
 assert.equal(events[0].end.getMonth(),3);
 assert.equal(events[2].resource.record,row);
 assert.equal(events[2].resource.activity,"harvestMonths");
});

test("December ends exclusively on January 1 of the following year",()=>{
 const [event]=buildCropCalendarEvents([{_id:"winter",name:"Kale",harvestMonths:[12]}],2026);
 assert.equal(event.start.getFullYear(),2026);
 assert.equal(event.end.getFullYear(),2027);
 assert.equal(event.end.getMonth(),0);
 assert.equal(event.end.getDate(),1);
});

test("calendar follows a saved crop to a scheduled month, preserving an already visible month",()=>{
 const current=new Date(2026,9,18);
 assert.equal(dateForSavedCrop({sowMonths:[3],plantMonths:[5]},current).getMonth(),2);
 assert.equal(dateForSavedCrop({harvestMonths:[10]},current),current);
});

test("both crop types require a month before they can be saved",async()=>{
 for(const Model of [FruitCalendar,VegetableCalendar]){
  await assert.rejects(new Model({name:"Crop"}).validate(),/Select at least one/);
  await new Model({name:"Crop",sowMonths:[3]}).validate();
 }
});
