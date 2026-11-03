export function shiftJournalMonth(month,offset){
 const [year,number]=month.split('-').map(Number);
 return new Date(Date.UTC(year,number-1+offset,1)).toISOString().slice(0,7);
}
export function journalYears(entries,selectedMonth,currentYear=new Date().getFullYear()){
 const years=entries.map(entry=>Number(String(entry.entryDate||entry.createdAt||'').slice(0,4))).filter(year=>Number.isInteger(year)&&year>0);
 years.push(Number(selectedMonth.slice(0,4)),currentYear,currentYear+1);
 const min=Math.min(...years),max=Math.max(...years);
 return Array.from({length:max-min+1},(_,index)=>max-index);
}
