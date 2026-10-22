export const followUpReadingFields=[
 {key:"airTemperature",label:"Air temperature",unit:"°C",usUnit:"°F",group:"Environment"},
 {key:"humidity",label:"Humidity",unit:"%",min:0,max:100,group:"Environment"},
 {key:"light",label:"Light intensity",unit:"lux",usUnit:"fc",min:0,group:"Environment"},
 {key:"lightHours",label:"Light duration",unit:"hours/day",min:0,max:24,group:"Environment"},
 {key:"waterTemperature",label:"Water / nutrient temperature",unit:"°C",usUnit:"°F",group:"Water, nutrients and root zone"},
 {key:"ph",label:"pH",unit:"",min:0,max:14,group:"Water, nutrients and root zone"},
 {key:"ec",label:"EC",unit:"mS/cm",min:0,group:"Water, nutrients and root zone"},
 {key:"tds",label:"TDS",unit:"ppm",min:0,group:"Water, nutrients and root zone"},
 {key:"waterLevel",label:"Reservoir water level",unit:"%",min:0,max:100,group:"Water, nutrients and root zone"},
 {key:"nutrientsLevel",label:"Nutrient level",unit:"%",min:0,max:100,group:"Water, nutrients and root zone"},
 {key:"dissolvedOxygen",label:"Dissolved oxygen",unit:"mg/L",min:0,group:"Water, nutrients and root zone"},
 {key:"moisture",label:"Soil / growing medium moisture",unit:"%",min:0,max:100,group:"Water, nutrients and root zone"},
 {key:"rootTemperature",label:"Soil / root zone temperature",unit:"°C",usUnit:"°F",group:"Water, nutrients and root zone"},
 {key:"plantHeight",label:"Plant height",unit:"cm",usUnit:"in",min:0,group:"Growth"},
 {key:"germinatedCount",label:"Germinated plants",unit:"plants",min:0,step:1,group:"Growth"}
];

export const toUSReading=(field,value)=>field.unit==="°C"?value*9/5+32:field.unit==="cm"?value/2.54:field.unit==="lux"?value/10.7639104167:value;
export const toMetricReading=(field,value)=>field.unit==="°C"?(value-32)*5/9:field.unit==="cm"?value*2.54:field.unit==="lux"?value*10.7639104167:value;
const roundedReading=value=>Number(value.toFixed(6));

export const updatePairedReading=(values,field,raw,isUS=false)=>{
 const next={...values};
 if(!field.usUnit)return {...next,[field.key]:raw};
 const enteredKey=isUS?`${field.key}US`:field.key;
 const convertedKey=isUS?field.key:`${field.key}US`;
 next[enteredKey]=raw;
 next[convertedKey]=raw===""||!Number.isFinite(Number(raw))?"":roundedReading((isUS?toMetricReading:toUSReading)(field,Number(raw)));
 return next;
};

export const formatFollowUpReading=(field,value)=>{
 const metric=`${Number(Number(value).toFixed(2))} ${field.unit}`.trim();
 return field.usUnit?`${Number(toUSReading(field,Number(value)).toFixed(2))} ${field.usUnit} / ${metric}`:metric;
};

export const normalizeFollowUpReadings=(values={})=>{
 if(!values||typeof values!=="object"||Array.isArray(values))throw new Error("Readings must be an object");
 const readings={};
 for(const field of followUpReadingFields){
  const raw=values[field.key];
  if(raw===undefined||raw===null||raw==="")continue;
  const value=typeof raw==="number"?raw:typeof raw==="string"&&raw.trim()?Number(raw):NaN;
  if(!Number.isFinite(value)||(field.min!==undefined&&value<field.min)||(field.max!==undefined&&value>field.max)||(field.step===1&&!Number.isInteger(value)))throw new Error(`Invalid ${field.label.toLowerCase()} reading`);
  readings[field.key]=value;
 }
 return readings;
};
