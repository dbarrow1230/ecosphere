import {test} from "node:test";
import assert from "node:assert/strict";
import {validateAvailability} from "../controllers/employees/availabilityValidation.js";
import {employeeFromApi} from "../../src/utils/employeeManagerApi.js";

const monday={dayOfWeek:1,isAvailable:true,ranges:[{start:"09:00",end:"17:00"}]};
test("existing employee field names map to the same scheduling directory without changing records",()=>{
 const saved={_id:"employee-a",first_name:"Sample",last_name:"Employee",employee_id:"EMP-12",department:"Operations"};
 const employee=employeeFromApi(saved);
 assert.equal(employee.firstName,"Sample");assert.equal(employee.lastName,"Employee");assert.equal(employee.employeeNumber,"EMP-12");assert.equal(employee.departmentName,"Operations");assert.equal(saved.firstName,undefined);
});
test("availability keeps valid weekly hours and date overrides",()=>{
 const result=validateAvailability({weekly:[monday],overrides:[{date:"2026-11-02",isAvailable:false,ranges:[],note:"Away"}]});
 assert.deepEqual(result.weekly,[monday]);assert.equal(result.overrides[0].note,"Away");assert.equal(result.overrides[0].date.toISOString().slice(0,10),"2026-11-02");
});
test("duplicate and invalid weekdays are rejected",()=>{
 assert.throws(()=>validateAvailability({weekly:[monday,monday]}),/weekday/);
 assert.throws(()=>validateAvailability({weekly:[{...monday,dayOfWeek:7}]}),/weekday/);
});
test("invalid, reversed, and overlapping time ranges are rejected",()=>{
 for(const ranges of [[{start:"bad",end:"17:00"}],[{start:"17:00",end:"09:00"}],[{start:"09:00",end:"12:00"},{start:"11:00",end:"17:00"}]])assert.throws(()=>validateAvailability({weekly:[{...monday,ranges}]}));
});
test("available days need a range; days off can have none",()=>{
 assert.throws(()=>validateAvailability({weekly:[{...monday,ranges:[]}]}),/time range/);
 assert.deepEqual(validateAvailability({weekly:[{dayOfWeek:0,isAvailable:false,ranges:[]}]}).overrides,[]);
});
