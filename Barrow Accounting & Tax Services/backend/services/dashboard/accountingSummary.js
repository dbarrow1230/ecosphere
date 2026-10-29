const closed=new Set(["Completed","Cancelled"]);
export function accountingSummary(clients,work,{owner=false,now=new Date()}={}){
 const today=new Date(now);today.setUTCHours(0,0,0,0);
 const soon=new Date(today);soon.setUTCDate(soon.getUTCDate()+8);
 const open=work.filter(item=>!closed.has(item.status));
 const overdue=open.filter(item=>item.dueDate&&new Date(item.dueDate)<today).length;
 const dueSoon=open.filter(item=>item.dueDate&&new Date(item.dueDate)>=today&&new Date(item.dueDate)<soon).length;
 const assignments=new Map();
 if(owner)for(const client of clients){
  const user=client.assignedTo,key=String(user?._id||"unassigned");
  if(!assignments.has(key))assignments.set(key,{id:key,name:user?.username||user?.email||"Unassigned",clients:0,openWork:0});
  assignments.get(key).clients++;
 }
 const clientById=new Map(clients.map(client=>[String(client._id),client]));
 if(owner)for(const item of open){const client=clientById.get(String(item.client?._id||item.client));const key=String(client?.assignedTo?._id||"unassigned");if(assignments.has(key))assignments.get(key).openWork++;}
 return {totalClients:clients.length,activeClients:clients.filter(client=>client.status==="active").length,unassignedClients:owner?clients.filter(client=>!client.assignedTo).length:null,openWork:open.length,overdue,dueSoon,waitingOnClient:open.filter(item=>item.status==="Waiting on client").length,assignments:owner?[...assignments.values()]:[]};
}
