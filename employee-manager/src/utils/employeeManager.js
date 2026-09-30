const storageKey="employee-manager-data";

export const employeeManagerSeed={
 admin:{
  companyName:"Acme Service Incorporated",
  address:"12345 Main Street",
  city:"Los Angeles",
  region:"California, 90121",
  country:"USA",
  payFrequency:"Bi-Weekly",
  payrollStart:"2018-10-01",
  workweekStartsOn:"Monday",
  startTime:"07:00",
  endTime:"18:00",
  dailyOvertimeAfter:8,
  weeklyOvertimeAfter:40,
  timeFormat:"Time Format (2:30)"
 },
 users:[{id:"USR-1",name:"Randy",email:"randy@example.com",role:"Admin",remember:true}],
 employees:[
  {id:"EMP-1001",firstName:"Lisa",lastName:"Aabling",gender:"Female",status:"Active",position:"Service Tech",payType:"Hourly",rate:28,email:"lisa.aabling@example.com",phone:"555-0101",startDate:"2018-10-01"},
  {id:"EMP-1002",firstName:"Lisa",lastName:"Aames",gender:"Female",status:"Active",position:"Dispatcher",payType:"Hourly",rate:24,email:"lisa.aames@example.com",phone:"555-0102",startDate:"2018-10-15"},
  {id:"EMP-1003",firstName:"Chase",lastName:"Baily",gender:"Male",status:"Active",position:"Installer",payType:"Hourly",rate:31,email:"chase.baily@example.com",phone:"555-0103",startDate:"2019-01-21"},
  {id:"EMP-1004",firstName:"Tanya",lastName:"Angle",gender:"Female",status:"Active",position:"Manager",payType:"Salary",rate:82000,email:"tanya.angle@example.com",phone:"555-0104",startDate:"2018-11-12"},
  {id:"EMP-1005",firstName:"Cade",lastName:"Morton",gender:"Male",status:"Active",position:"Service Tech",payType:"Hourly",rate:27,email:"cade.morton@example.com",phone:"555-0105",startDate:"2019-03-18"}
 ],
 timeClock:[
  {id:"TC-1220",employeeId:"EMP-1001",date:"2018-11-12",clockIn:"07:30",breakOut:"12:00",breakIn:"12:30",clockOut:"16:45",notes:"Regular shift"},
  {id:"TC-1221",employeeId:"EMP-1003",date:"2019-01-21",clockIn:"07:05",breakOut:"12:15",breakIn:"12:45",clockOut:"17:35",notes:"Field install"},
  {id:"TC-1222",employeeId:"EMP-1004",date:"2019-03-18",clockIn:"08:00",breakOut:"12:00",breakIn:"12:30",clockOut:"17:00",notes:"Payroll review"}
 ],
 leave:[
  {id:"LV-1",employeeId:"EMP-1001",type:"Sick",paid:true,rate:28,annualMax:40,used:8},
  {id:"LV-2",employeeId:"EMP-1001",type:"Vacation",paid:true,rate:28,annualMax:80,used:16},
  {id:"LV-3",employeeId:"EMP-1003",type:"Holiday",paid:true,rate:31,annualMax:48,used:8},
  {id:"LV-4",employeeId:"EMP-1005",type:"Emergency",paid:true,rate:27,annualMax:16,used:0}
 ],
 events:[
  {id:"EV-2001",name:"Chase Sick Leave",type:"Leave",employeeId:"EMP-1003",createdOn:"2020-02-07",recurring:false,reminder:true,notes:"Sick leave entry from workbook sample."},
  {id:"EV-2002",name:"Tanya Review",type:"Review",employeeId:"EMP-1004",createdOn:"2019-03-18",recurring:true,reminder:true,notes:"Annual performance review."},
  {id:"EV-2003",name:"Company Party",type:"Company Party",employeeId:"",createdOn:"2018-12-01",recurring:false,reminder:true,notes:"Company-wide event."}
 ],
 payrolls:[
  {id:"PR-0001",name:"11/12/2018_11/25/2018",from:"2018-11-12",to:"2018-11-25",status:"Closed"},
  {id:"PR-0002",name:"11/26/2018_12/09/2018",from:"2018-11-26",to:"2018-12-09",status:"Closed"},
  {id:"PR-0003",name:"03/18/2019_03/31/2019",from:"2019-03-18",to:"2019-03-31",status:"Draft"}
 ],
 attachments:[
  {id:"AT-1",employeeId:"EMP-1001",fileName:"W4_Aabling.pdf",type:"Tax Form",addedBy:"Randy",addedOn:"2018-10-01"},
  {id:"AT-2",employeeId:"EMP-1004",fileName:"Review_Tanya_Angle.docx",type:"Review",addedBy:"Randy",addedOn:"2019-03-18"}
 ]
};

export const money=new Intl.NumberFormat("en-US",{style:"currency",currency:"USD"});

export function loadEmployeeManager(){
 try{
  const saved=localStorage.getItem(storageKey);
  return saved?JSON.parse(saved):employeeManagerSeed;
 }catch(err){
  console.error("Employee Manager load failed",err);
  return employeeManagerSeed;
 }
}

export function saveEmployeeManager(data){
 localStorage.setItem(storageKey,JSON.stringify(data));
 return data;
}

export function employeeName(employee){
 return employee?`${employee.firstName} ${employee.lastName}`:"Unassigned";
}

export function employeeMap(data){
 return Object.fromEntries(data.employees.map(employee=>[employee.id,employee]));
}

export function minutes(time){
 if(!time)return 0;
 const [hours,mins]=String(time).split(":").map(Number);
 return (hours||0)*60+(mins||0);
}

export function clockHours(entry){
 const breakMinutes=Math.max(0,minutes(entry.breakIn)-minutes(entry.breakOut));
 return Math.max(0,minutes(entry.clockOut)-minutes(entry.clockIn)-breakMinutes)/60;
}

export function createId(prefix){
 return `${prefix}-${Date.now().toString().slice(-5)}`;
}
