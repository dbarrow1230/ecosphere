export function summarizeActivity(data=[]){
 const values=data.map(item=>({...item,value:Math.max(0,Number(item.value)||0)}));
 const total=values.reduce((sum,item)=>sum+item.value,0);
 const peak=values.reduce((best,item)=>item.value>best.value?item:best,{label:'',value:0});
 return {total,activePeriods:values.filter(item=>item.value>0).length,average:values.length?total/values.length:0,peakLabel:peak.label,peakValue:peak.value};
}
