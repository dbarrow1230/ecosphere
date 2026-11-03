// Source: OSU Extension, Soil temperature conditions for vegetable seed germination.
// Values are germination references in Fahrenheit, not transplanting thresholds.
export const soilTemperatureSources={
 crops:"https://extension.oregonstate.edu/catalog/soil-temperature-conditions-vegetable-seed-germination",
 zones:"https://planthardiness.ars.usda.gov/pages/how-to-use-the-maps",
 planting:"https://extension.umn.edu/garden-and-home/yard-and-garden/gardening-in-minnesota/planting-the-vegetable-garden"
};
export const soilTemperatureCrops=[
  {
    "name": "Asparagus",
    "type": "Perennial vegetables",
    "minimum": 50,
    "optimumLow": 60,
    "optimumHigh": 85,
    "optimum": 75,
    "maximum": 95
  },
  {
    "name": "Bean",
    "type": "Legumes",
    "minimum": 60,
    "optimumLow": 60,
    "optimumHigh": 85,
    "optimum": 80,
    "maximum": 95
  },
  {
    "name": "Beet",
    "type": "Root crops",
    "minimum": 40,
    "optimumLow": 50,
    "optimumHigh": 85,
    "optimum": 85,
    "maximum": 95
  },
  {
    "name": "Carrot",
    "type": "Root crops",
    "minimum": 40,
    "optimumLow": 45,
    "optimumHigh": 85,
    "optimum": 80,
    "maximum": 95
  },
  {
    "name": "Cauliflower",
    "type": "Brassicas",
    "minimum": 40,
    "optimumLow": 45,
    "optimumHigh": 85,
    "optimum": 80,
    "maximum": 100
  },
  {
    "name": "Swiss chard",
    "type": "Leafy greens",
    "minimum": 40,
    "optimumLow": 50,
    "optimumHigh": 85,
    "optimum": 85,
    "maximum": 95
  },
  {
    "name": "Corn",
    "type": "Fruiting vegetables",
    "minimum": 50,
    "optimumLow": 60,
    "optimumHigh": 95,
    "optimum": 95,
    "maximum": 105
  },
  {
    "name": "Cucumber",
    "type": "Fruiting vegetables",
    "minimum": 60,
    "optimumLow": 60,
    "optimumHigh": 95,
    "optimum": 95,
    "maximum": 105
  },
  {
    "name": "Eggplant",
    "type": "Fruiting vegetables",
    "minimum": 60,
    "optimumLow": 75,
    "optimumHigh": 90,
    "optimum": 85,
    "maximum": 95
  },
  {
    "name": "Lettuce",
    "type": "Leafy greens",
    "minimum": 35,
    "optimumLow": 40,
    "optimumHigh": 80,
    "optimum": 75,
    "maximum": 95
  },
  {
    "name": "Muskmelon",
    "type": "Melons",
    "minimum": 60,
    "optimumLow": 75,
    "optimumHigh": 95,
    "optimum": 90,
    "maximum": 100
  },
  {
    "name": "Onion",
    "type": "Alliums",
    "minimum": 35,
    "optimumLow": 50,
    "optimumHigh": 95,
    "optimum": 75,
    "maximum": 95
  },
  {
    "name": "Parsley",
    "type": "Herbs",
    "minimum": 40,
    "optimumLow": 50,
    "optimumHigh": 85,
    "optimum": 75,
    "maximum": 90
  },
  {
    "name": "Parsnip",
    "type": "Root crops",
    "minimum": 35,
    "optimumLow": 50,
    "optimumHigh": 70,
    "optimum": 65,
    "maximum": 85
  },
  {
    "name": "Pea",
    "type": "Legumes",
    "minimum": 40,
    "optimumLow": 40,
    "optimumHigh": 75,
    "optimum": 75,
    "maximum": 85
  },
  {
    "name": "Pepper",
    "type": "Fruiting vegetables",
    "minimum": 60,
    "optimumLow": 65,
    "optimumHigh": 95,
    "optimum": 85,
    "maximum": 95
  },
  {
    "name": "Radish",
    "type": "Root crops",
    "minimum": 40,
    "optimumLow": 45,
    "optimumHigh": 90,
    "optimum": 85,
    "maximum": 95
  },
  {
    "name": "Spinach",
    "type": "Leafy greens",
    "minimum": 35,
    "optimumLow": 45,
    "optimumHigh": 75,
    "optimum": 70,
    "maximum": 85
  },
  {
    "name": "Squash",
    "type": "Fruiting vegetables",
    "minimum": 60,
    "optimumLow": 70,
    "optimumHigh": 95,
    "optimum": 95,
    "maximum": 100
  },
  {
    "name": "Tomato",
    "type": "Fruiting vegetables",
    "minimum": 50,
    "optimumLow": 60,
    "optimumHigh": 85,
    "optimum": 85,
    "maximum": 95
  },
  {
    "name": "Turnip",
    "type": "Root crops",
    "minimum": 40,
    "optimumLow": 60,
    "optimumHigh": 105,
    "optimum": 85,
    "maximum": 105
  },
  {
    "name": "Watermelon",
    "type": "Melons",
    "minimum": 60,
    "optimumLow": 70,
    "optimumHigh": 95,
    "optimum": 95,
    "maximum": 105
  }
];

export const hardinessZones=Array.from({length:26},(_,index)=>`${Math.floor(index/2)+1}${index%2?"b":"a"}`);
export const toCelsius=fahrenheit=>(fahrenheit-32)*5/9;
export const toFahrenheit=celsius=>celsius*9/5+32;
export const displaySoilTemperature=(value,unit)=>`${Number((unit==="C"?toCelsius(value):value).toFixed(1))} °${unit}`;

export function zoneWinterRange(zone){
 if(!hardinessZones.includes(zone))return null;
 const number=Number(zone.slice(0,-1));
 const minimum=number*10-70+(zone.endsWith("b")?5:0);
 return {minimum,maximum:minimum+5};
}

export function soilGerminationStatus(crop,reading,unit){
 if(reading===""||reading===null||reading===undefined)return null;
 const value=Number(reading);
 if(!Number.isFinite(value))return null;
 const fahrenheit=unit==="C"?toFahrenheit(value):value;
 if(fahrenheit<crop.minimum)return {level:"cold",label:"Below germination minimum"};
 if(fahrenheit>crop.maximum)return {level:"hot",label:"Above germination maximum"};
 if(fahrenheit<crop.optimumLow)return {level:"cool",label:"Below preferred germination range"};
 if(fahrenheit>crop.optimumHigh)return {level:"warm",label:"Above preferred germination range"};
 return {level:"preferred",label:"Within preferred germination range"};
}
