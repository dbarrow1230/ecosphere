const groups=[
 {key:"overview",label:"Overview",titles:["overview","name","scientific name(s)","category","type","form","size","yield (imperial/metric)","prep time","mix time","cook time","total time","introduction","description","suggested price","formula focus"]},
 {key:"history",label:"History",titles:["origins","region","ancient uses","history","cultural significance"]},
 {key:"uses",label:"Uses & Benefits",titles:["symptoms supported","benefits","dosage"]},
 {key:"formula",label:"Ingredients & Making",titles:["herbs","carrier oil for infusion","formula","equipment","instructions","texture profile","customizations"]},
 {key:"safety",label:"Safety & Storage",titles:["side effects","contraindications","interactions","safety guidance","storage","shelf life","allergens","regulatory notes"]},
 {key:"faq",label:"Q&A",titles:["faq"]},
 {key:"resources",label:"Resources",titles:["resources"]}
];

const groupByTitle=new Map(groups.flatMap(group=>group.titles.map(title=>[title,group.key])));

export const groupProductSections=(sections,{includeEmpty=false}={})=>{
 const grouped=new Map(groups.map(group=>[group.key,[]]));
 const other=[];
 for(const section of sections||[]){
  const key=groupByTitle.get(String(section.title||"").trim().toLowerCase());
  if(key)grouped.get(key).push(section);
  else other.push(section);
 }
 return [
  ...groups.filter(group=>includeEmpty||grouped.get(group.key).length).map(group=>({key:group.key,label:group.label,sections:grouped.get(group.key)})),
  ...(other.length?[{key:"more",label:"More Information",sections:other}]:[])
 ];
};
