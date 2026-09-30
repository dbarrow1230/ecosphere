const shellAlerts=[
 {
  appId:"antinet-zettelkasten",appTitle:"Antinet ZettelKasten",
  items:[{id:"az-1",type:"action",title:"Process fleeting captures",detail:"2 captures are waiting to enter the permanent-note workflow.",time:"From app dashboard"}]
 },
 {
  appId:"barrow-coffee-delights",appTitle:"Barrow Coffee Delights",
  items:[{id:"bc-1",type:"error",title:"Reminder feed is unavailable",detail:"The reminders page reports that /api/reminders was not found.",time:"Integration needs repair"}]
 },
 {
  appId:"bible-study",appTitle:"Bible Study",
  items:[{id:"bs-1",type:"reminder",title:"Study task waiting",detail:"1 study task is pending.",time:"From app dashboard"}]
 },
 {
  appId:"catering-management",appTitle:"Catering Management",
  items:[{id:"cm-1",type:"alert",title:"Kitchen stock needs attention",detail:"5 catering inventory items are low in stock.",time:"From app dashboard"}]
 },
 {
  appId:"gardening-journal",appTitle:"Gardening Journal",
  items:[{id:"gj-1",type:"alert",title:"Plant losses need review",detail:"6 plant deaths are recorded; show the affected plants and causes when live data is connected.",time:"From app dashboard"}]
 },
 {
  appId:"mentorship-tracking",appTitle:"Mentorship Tracking",
  items:[{id:"mt-1",type:"action",title:"Review incoming mentee",detail:"1 incoming mentee is waiting for review.",time:"From app dashboard"}]
 },
 {
  appId:"novel-planner",appTitle:"Novel Planner",
  items:[{id:"np-1",type:"progress",title:"Writing target has not started",detail:"Emperor's Earth shows 0 of 80,000 words and 0% overall progress.",time:"From app dashboard"}]
 },
 {
  appId:"recipe-costing",appTitle:"Recipe Costing",
  items:[{id:"rc-1",type:"alert",title:"Vendor prices are missing",detail:"Ingredients without a current vendor price cannot be compared or costed correctly.",time:"Needs attention"}]
 }
];

export default shellAlerts;
