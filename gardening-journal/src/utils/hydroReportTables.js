import {followUpReadingFields,formatFollowUpReading} from "./dashboard/followUpReadings.js";
export const reportTypes=["Planting Run Summary","Germination Report","Seed Quantity Report","Environmental Conditions Report","Planting Cycle Report","Plant Pairing Report","Pod Positioning Report","Failed Germination Report","Retry History Report","Notes and Observations Report"];
const identity=[["runName","Run"],["run","Run ID"],["pod","Planting ID"],["item","Planted item"]];
export function hydroReportTable(report,type){
 const plantings=report.plantings||[];
 if(type===reportTypes[0])return {rows:report.runs,columns:[["runName","Run"],["run","Run ID"],["startedDate","Started"],["completedAt","Completed"],["state","Run state"],["plantings","Pod plantings"],["germinated","✓ Germinated"],["failed","✗ Confirmed failures"],["unresolved","Unresolved / unknown"],["confirmedSuccessPercent","Success % of confirmed outcomes"]]};
 if(type===reportTypes[3])return {rows:report.environment.map(row=>({...row,additionalReadings:followUpReadingFields.filter(field=>row[field.key]!=null).map(field=>`${field.label}: ${formatFollowUpReading(field,row[field.key])}`).join("; ")})),columns:[["runName","Run"],["run","Run ID"],["deviceName","Device"],["recordedAt","Recorded date and time"],["waterLevel","Water %"],["phLevel","pH"],["temperature","Temperature °C"],["nutrientsLevel","Nutrients %"],["additionalReadings","Additional recorded measurements"],["source","Record context"]]};
 if(type===reportTypes[5])return {rows:report.pairings,columns:[["runName","Run"],["run","Run ID"],["first","First item"],["second","Second item"],["observation","Comparison basis"]]};
 if(type===reportTypes[6])return {rows:report.movements,columns:[...identity,["at","Moved at"],["fromDevice","Previous device ID"],["from","Previous position"],["toDevice","New device ID"],["to","New position"]]};
 if(type===reportTypes[9])return {rows:report.notes,columns:[["runName","Run"],["run","Run ID"],["pod","Planting ID"],["date","Recorded date"],["type","Record type"],["text","Recorded note / observation"],["association","Association"],["readings","Follow-up readings"],["journalEntry","Journal record"]]};
 const base=[...identity,["deviceName","Device"],["position","Position"],["seedCount","Seeds planted"],["plantedDate","Planting start"],["state","Recorded / calculated state"]];
 if(type===reportTypes[7])return {rows:plantings.filter(row=>row.failedAt),columns:[...base,["failedAt","Failure date and time"],["retryTo","Subsequent planting ID"],["retryTargetRun","Subsequent run ID"]]};
 if(type===reportTypes[8])return {rows:plantings.filter(row=>row.retryOf||row.retryTo||row.failedAt),columns:[...base,["failedAt","Confirmed failure"],["retryOf","Original failed planting ID"],["retryRun","Original run ID"],["retryTo","Subsequent planting ID"],["retryTargetRun","Subsequent run ID"]]};
 return {rows:plantings,columns:[...base,["maxGerminationDays","Maximum germination days"],["deadline","Calculated deadline"],["germinatedAt","Confirmed germination"],["germinationDays","Calculated days to germination"],["failedAt","Confirmed failure"],["removedAt","Removed from active display"]]};
}

