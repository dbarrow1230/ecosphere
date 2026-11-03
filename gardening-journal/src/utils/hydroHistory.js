export const hydroPodActive=pod=>!!pod?.seed&&!pod.removedAt&&pod.germinationStatus!=="failed";
export function germinationDeadline(pod){
 if(!pod?.plantedDate||pod.maxGerminationDays==null||!Number.isFinite(Number(pod.maxGerminationDays)))return null;
 const date=new Date(pod.plantedDate);
 if(Number.isNaN(date.getTime()))return null;
 date.setUTCDate(date.getUTCDate()+Number(pod.maxGerminationDays));
 return date;
}
export function germinationState(pod,now=new Date()){
 if(pod?.germinationStatus==="failed")return "Failed Germination";
 if(pod?.germinationStatus==="germinated")return "Germinated";
 const deadline=germinationDeadline(pod);
 if(deadline&&new Date(now)>=deadline)return "Germination Overdue";
 return pod?.germinationStatus==="awaiting"?"Awaiting Germination":"Unknown or Unrecorded";
}
