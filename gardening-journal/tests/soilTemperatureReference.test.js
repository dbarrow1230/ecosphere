import test from "node:test";
import assert from "node:assert/strict";
import {hardinessZones,soilTemperatureCrops,soilGerminationStatus,zoneWinterRange,toCelsius,toFahrenheit,displaySoilTemperature} from "../src/pages/reference/soilTemperatureData.js";

test("USDA half-zone winter bands cover 1a through 13b",()=>{
 assert.equal(hardinessZones.length,26);
 assert.deepEqual(zoneWinterRange("1a"),{minimum:-60,maximum:-55});
 assert.deepEqual(zoneWinterRange("7a"),{minimum:0,maximum:5});
 assert.deepEqual(zoneWinterRange("7b"),{minimum:5,maximum:10});
 assert.deepEqual(zoneWinterRange("13b"),{minimum:65,maximum:70});
 assert.equal(zoneWinterRange("14a"),null);
});
test("Fahrenheit and Celsius readings give the same crop comparison",()=>{
 const bean=soilTemperatureCrops.find(crop=>crop.name==="Bean");
 assert.equal(soilGerminationStatus(bean,55,"F").level,"cold");
 assert.equal(soilGerminationStatus(bean,toCelsius(55),"C").level,"cold");
 assert.equal(soilGerminationStatus(bean,75,"F").level,"preferred");
 assert.equal(soilGerminationStatus(bean,100,"F").level,"hot");
 assert.equal(soilGerminationStatus(bean,"","F"),null);
 assert.equal(soilGerminationStatus(bean,0,"C").level,"cold");
 assert.equal(toFahrenheit(0),32);
 assert.equal(displaySoilTemperature(32,"C"),"0 °C");
});
test("reference crop ranges remain internally ordered",()=>{
 assert.equal(new Set(soilTemperatureCrops.map(crop=>crop.name)).size,soilTemperatureCrops.length);
 for(const crop of soilTemperatureCrops){
  assert.ok(crop.minimum<=crop.optimumLow,crop.name);
  assert.ok(crop.optimumLow<=crop.optimum,crop.name);
  assert.ok(crop.optimum<=crop.optimumHigh,crop.name);
  assert.ok(crop.optimumHigh<=crop.maximum,crop.name);
 }
});
