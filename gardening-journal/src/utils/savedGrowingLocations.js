export function savedGrowingLocations(locations=[],runs=[],plants=[]){
 const entries=new Map();
 const include=(name,record={})=>{if(name&&!entries.has(name))entries.set(name,{...record,name,runs:[],plants:[]});return entries.get(name);};
 for(const location of locations)include(location.location_name||location.name,location);
 for(const run of runs){const entry=include(run.location);if(entry)entry.runs.push(run);}
 for(const plant of plants){const entry=include(plant.plantingRecord?.location);if(entry)entry.plants.push(plant);}
 return [...entries.values()].sort((a,b)=>a.name.localeCompare(b.name));
}
