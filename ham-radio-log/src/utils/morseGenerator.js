const levelCharacters={
 1:"ETIANM",
 2:"ETIANMSURWDKGO",
 3:"ABCDEFGHIJKLMNOPQRSTUVWXYZ",
 4:"ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
};

const qcodes=["QSO","QSL","QTH","QRM","QRN","QSY","QRP","QRO","QRT","QRZ"];
const hamWords=["CQ","DE","K","KN","RST","NAME","QTH","RIG","ANT","PWR","WX","73"];
const qsoSamples=[
 "CQ CQ CQ DE K2ABC K",
 "K2ABC DE N4XYZ 599 NY",
 "RST 579 QTH BROOKLYN NY",
 "NAME DARRELL QTH NEW YORK",
 "TNX FER QSO 73"
];

const getRandomItem=(items)=>{
 return items[Math.floor(Math.random()*items.length)];
};

const generateCharacters=(characters,length=25)=>{
 let output="";

 for(let i=0;i<length;i++){
  output+=characters[Math.floor(Math.random()*characters.length)];

  if((i+1)%5===0){
   output+=" ";
  }
 }

 return output.trim();
};

const generateCallsign=()=>{
 const letters="ABCDEFGHIJKLMNOPQRSTUVWXYZ";
 const numbers="0123456789";

 const prefix=getRandomItem(letters)+getRandomItem(numbers);
 const suffixLength=Math.floor(Math.random()*2)+2;
 let suffix="";

 for(let i=0;i<suffixLength;i++){
  suffix+=getRandomItem(letters);
 }

 return `${prefix}${suffix}`;
};

export const generateMorsePracticeText=(practiceType,level)=>{
 if(practiceType==="letters"){
  return generateCharacters(levelCharacters[level]||levelCharacters[1],30);
 }

 if(practiceType==="numbers"){
  return generateCharacters("0123456789",30);
 }

 if(practiceType==="mixed"){
  return generateCharacters("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",35);
 }

 if(practiceType==="qcodes"){
  return Array.from({length:8},()=>getRandomItem(qcodes)).join(" ");
 }

 if(practiceType==="callsigns"){
  return Array.from({length:10},()=>generateCallsign()).join(" ");
 }

 if(practiceType==="qso"){
  return getRandomItem(qsoSamples);
 }

 return Array.from({length:10},()=>getRandomItem(hamWords)).join(" ");
};