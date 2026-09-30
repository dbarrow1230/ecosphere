import appLogos from "./appLogos.js";
import runtimeConfig from "../../app-runtime-config.json";

const getApplicationUrl=appId=>{
 const port=runtimeConfig.applications[appId];
 return port?`http://${runtimeConfig.host}:${port}`:"";
};

const APP_DESCRIPTIONS={
 "antinet-zettelkasten":"Capture, connect, and develop permanent notes.",
 "barrow-coffee-delights":"Manage coffee products, production, orders, and inventory.",
 "barrow-publications":"Track manuscripts through editorial, production, and publishing.",
 "beer-wine-inventory":"Manage beer and wine stock, purchases, and sales.",
 "bible-study":"Organize scripture studies, methods, notes, and study tasks.",
 "book-management":"Catalog books, authors, publishers, and reading activity.",
 "catering-management":"Plan catering menus, events, clients, and service operations.",
 "chorna-lifeboard":"Coordinate personal goals, projects, events, and daily activity.",
 "crazy-cravings-alchemy-delight-doughnuts":"Manage doughnut products, production, inventory, and orders.",
 "employee-manager":"Maintain employee records, departments, roles, and staff details.",
 "employee-scheduler":"Build staff schedules, shifts, and availability plans.",
 "everything-in-a-jar":"Track jar products, batches, stock, markets, and production.",
 "food-preservation-manager":"Record preservation batches, methods, inventory, and expiration dates.",
 "fresh-roots-flavor-kitchen":"Coordinate kitchen inventory, orders, staff, and production.",
 "from-the-ground-up":"Plan and track writing projects from research through revision.",
 "gardening-journal":"Record plants, garden activity, harvests, treatments, and observations.",
 "green-table-grocers":"Manage grocery products, inventory, and store operations.",
 "ham-radio-log":"Log radio contacts, stations, frequencies, and operating activity.",
 "home-tracker":"Organize household inventory, purchases, maintenance, and reminders.",
 "mentorship-tracking":"Track mentors, mentees, meetings, goals, and progress.",
 "menus":"Create and maintain menus and menu items.",
 "music-builder":"Compose, arrange, and manage music projects.",
 "natures-apothecary":"Manage remedies, ingredients, preparations, and apothecary records.",
 "novel-planner":"Develop characters, scenes, plot structure, research, and revisions.",
 "planners":"Manage personal planning, tasks, lists, budgets, and schedules.",
 "photo-lattice":"Manage photo albums, editing, and publishing.",
 "poetry-garden":"Write, organize, revise, and publish poetry collections.",
 "pro-edge-knife-system":"Track knives, sharpening work, equipment, and service records.",
 "project-tracker":"Manage projects, boards, tasks, timelines, and teams.",
 "recipe-costing":"Calculate recipe ingredient, portion, labor, and menu costs.",
 "recipe-management":"Create and organize recipes, ingredients, cuisines, and meal types.",
 "regenerative-earth-cuisine":"Develop regenerative cuisine menus, recipes, and food resources.",
 "root-wise-consulting":"Manage consulting services, clients, case studies, and resources.",
 "shopping-manager":"Organize shopping lists, stores, products, purchases, and returns.",
 "the-zestful-gourmet":"Manage gourmet recipes, menus, products, and culinary content.",
 "travel-log":"Plan trips, itineraries, bookings, documents, and travel history.",
 "website-planning":"Plan website structure, content, features, and delivery tasks.",
 "itm-fire-protection":"Inspection. Testing. Maintenance."
};

const configuredApps=[
 {
  id:"antinet-zettelkasten",
  title:"Antinet Zettelkasten"
 },
 {
  id:"barrow-coffee-delights",
  title:"Barrow Coffee Delights"
 },
 {
  id:"barrow-publications",
  title:"Barrow Publications"
 },
 {
  id:"beer-wine-inventory",
  title:"Beer Wine Inventory"
 },
 {
  id:"book-management",
  title:"Book Management"
 },
 {
  id:"catering-management",
  title:"Catering Management"
 },
 {
  id:"chorna-lifeboard",
  title:"Chorna-LifeBoard"
 },
 {
  id:"crazy-cravings-alchemy-delight-doughnuts",
  title:"Crazy Cravings Alchemy Delight Doughnuts"
 },
 {
  id:"ecosphere",
  title:"Eco Sphere",
  url:`http://${runtimeConfig.host}:${runtimeConfig.ecospherePort}`
 },
 {
  id:"employee-scheduler",
  title:"Employee Scheduler"
 },
 {
  id:"employee-manager",
  title:"Employee Manager"
 },
 {
  id:"everything-in-a-jar",
  title:"Everything in a Jar"
 },
 {
  id:"food-preservation-manager",
  title:"Food Preservation Manager"
 },
 {
  id:"fresh-roots-flavor-kitchen",
  title:"Fresh Roots Flavor Kitchen"
 },
 {
  id:"from-the-ground-up",
  title:"From The Ground Up"
 },
 {
  id:"gardening-journal",
  title:"Gardening Journal"
 },
 {
  id:"green-table-grocers",
  title:"Green Table Grocers"
 },
 {
  id:"ham-radio-log",
  title:"Ham Radio Log"
 },
 {
  id:"home-tracker",
  title:"Home Tracker"
 },
 {
  id:"mentorship-tracking",
  title:"Mentorship Tracking"
 },
 {
  id:"menus",
  title:"Menus"
 },
 {
  id:"music-builder",
  title:"Music Builder"
 },
 {
  id:"natures-apothecary",
  title:"Natures Apothecary"
 },
 {
  id:"novel-planner",
  title:"Novel Planner"
 },
 {
  id:"photo-lattice",
  title:"Photo Lattice"
 },
 {
  id:"planners",
  title:"Planners"
 },
 {
  id:"poetry-garden",
  title:"Poetry Garden"
 },
 {
  id:"pro-edge-knife-system",
  title:"Pro Edge Knife System"
 },
 {
  id:"project-tracker",
  title:"Project Tracker"
 },
 {
  id:"recipe-costing",
  title:"Recipe Costing"
 },
 {
  id:"recipe-management",
  title:"Recipe Management"
 },
 {
  id:"regenerative-earth-cuisine",
  title:"Regenerative Earth Cuisine"
 },
 {
  id:"root-wise-consulting",
  title:"Root Wise Consulting"
 },
 {
  id:"shopping-manager",
  title:"Shopping Manager"
 },
 {
  id:"the-zestful-gourmet",
  title:"The Zestful Gourmet"
 },
 {
  id:"travel-log",
  title:"Travel Log"
 },
 {
  id:"website-planning",
  title:"Website Planning"
 },
 {
    id:"itm-fire-protection",
    title:"ITM Fire Protection"
 },
 {
  id:"bible-study",
  title:"Bible Study"
 }
];

const apps=configuredApps.map(app=>({
 ...app,
 description:APP_DESCRIPTIONS[app.id]||"Application workspace.",
 logo:appLogos[app.id]||null,
 port:app.id==="ecosphere"?runtimeConfig.ecospherePort:runtimeConfig.applications[app.id]||null,
 url:getApplicationUrl(app.id)||app.url||""
})).sort((a,b)=>a.title.localeCompare(b.title));

export default apps;
