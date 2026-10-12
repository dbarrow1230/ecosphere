export const growingStatuses=["active","germinating","seedling","transplanted"];
export const combineGrowingRuns=(plantings=[],hydroSystems=[])=>[
 ...plantings.map(run=>({...run,runKind:"planting",runKey:`planting-${run._id}`,status:run.isActive===false&&growingStatuses.includes(run.status||"active")?"archived":run.status||"active"})),
 ...hydroSystems.map(run=>({...run,runKind:"hydro",runKey:`hydro-${run._id}`,instanceName:run.name||"Hydro run",plantedDate:run.startedDate,status:run.isActive===false?"archived":"active",sourceType:"hydro",quantity:null}))
];
export const summarizeGrowingRuns=runs=>({
 total:runs.length,
 active:runs.filter(run=>run.isActive!==false&&growingStatuses.includes(run.status)).length,
 failed:runs.filter(run=>["failed","dead"].includes(run.status)).length,
 harvested:runs.filter(run=>run.status==="harvested").length
});
