import {test} from "node:test";
import assert from "node:assert/strict";
import {taskCompletedOnDate,taskOccurrenceDates,taskOccursOnDate} from "./dailyTaskRecurrence.js";

test("daily repeats stop at the chosen end date",()=>{
 const task={scheduledDate:"2026-09-14",recurrenceRule:"daily",recurrenceEndDate:"2026-09-16"};
 assert.deepEqual(taskOccurrenceDates(task,"2026-09-13","2026-09-18"),["2026-09-14","2026-09-15","2026-09-16"]);
});

test("weekly and biweekly repeats use the first date as their anchor",()=>{
 assert.equal(taskOccursOnDate({scheduledDate:"2026-09-14",recurrenceRule:"weekly"},"2026-09-21"),true);
 assert.equal(taskOccursOnDate({scheduledDate:"2026-09-14",recurrenceRule:"biweekly"},"2026-09-21"),false);
 assert.equal(taskOccursOnDate({scheduledDate:"2026-09-14",recurrenceRule:"biweekly"},"2026-09-28"),true);
});

test("monthly repeats fall on the last day of shorter months",()=>{
 const task={scheduledDate:"2026-01-31",recurrenceRule:"monthly"};
 assert.equal(taskOccursOnDate(task,"2026-02-28"),true);
 assert.equal(taskOccursOnDate(task,"2026-03-31"),true);
 assert.equal(taskOccursOnDate(task,"2026-03-30"),false);
});

test("repeating task completion belongs to each occurrence",()=>{
 const task={scheduledDate:"2026-09-14",recurrenceRule:"daily",completedDates:["2026-09-15"]};
 assert.equal(taskCompletedOnDate(task,"2026-09-14"),false);
 assert.equal(taskCompletedOnDate(task,"2026-09-15"),true);
});
