// src/pages/referance/SettingExplorationPage.jsx
import {Building2,Castle,Compass,Landmark,Map,Mountain,Palmtree,Rocket,Shell,Sun,TreePine,Waves} from "lucide-react";
import {Badge,Container} from "react-bootstrap";
import "./SettingExplorationPage.css";

const settingOptions=[
 {
  title:"Urban Metropolis",
  icon:Building2,
  text:"Skyscrapers, subways, and endless neon lights. Life moves fast, and anonymity breeds secrets. How does the buzz of the city amplify tension or isolate your characters? Could technology, crime, or politics shape your narrative?"
 },
 {
  title:"Small Town or Village",
  icon:Map,
  text:"Tight-knit and full of unspoken rules. Gossip travels fast, and everyone knows each other. What hidden pasts, family legacies, or long-standing feuds influence your characters? What happens when someone disrupts the peace?"
 },
 {
  title:"Isolated Space Colony",
  icon:Rocket,
  text:"Claustrophobic corridors, artificial air, and no way back to Earth. How does isolation affect relationships and power dynamics? What scientific advances or threats drive the plot? Who controls the colony, and what secrets are buried in the stars?"
 },
 {
  title:"Ancient Kingdom",
  icon:Castle,
  text:"Castles, scrolls, prophecy, and power. What traditions or class systems define this world? Are your characters part of a noble house or a rebellion? What ancient beliefs or supernatural forces influence their choices?"
 },
 {
  title:"Underwater City",
  icon:Waves,
  text:"Pressure, silence, and strange marine life. How does this unfamiliar ecosystem influence society? Is the city utopian, dystopian, or something in between? What resources or dangers lie outside its walls?"
 },
 {
  title:"Parallel Universe or Alternate Reality",
  icon:Compass,
  text:"A world both familiar and altered. What rules are different here — time, physics, identity? How do those differences create conflict or opportunity? What version of your protagonist exists in this place?"
 },
 {
  title:"Post-Apocalyptic Landscape",
  icon:Sun,
  text:"Ruins, survival, and scarcity. What caused the collapse — war, climate disaster, plague? How has humanity adapted or not? Is there hope for rebuilding, or just a fight to stay alive?"
 },
 {
  title:"Lush Forest or Jungle",
  icon:TreePine,
  text:"Dense, mysterious, and teeming with life. Does the wilderness heal, test, or trap your characters? Are there sacred groves, hidden temples, or ancient whispers among the trees?"
 },
 {
  title:"Mountainous Region",
  icon:Mountain,
  text:"High peaks, spiritual isolation, snow-covered paths. What enlightenment, danger, or inner journey awaits at the summit? Do monks live in solitude? Are ancient prophecies carved in stone?"
 },
 {
  title:"Remote Island",
  icon:Palmtree,
  text:"Surrounded by sea, cut off from the known world. Is it paradise or purgatory? What forgotten rituals or spirits reside there? What happens when the tides shift?"
 },
 {
  title:"Sacred Desert",
  icon:Sun,
  text:"Harsh sun, endless dunes — a setting of survival and revelation. What visions or divine encounters happen under blazing skies? Are there pilgrimages, forgotten cities, or desert spirits?"
 },
 {
  title:"Magical Forest Realm",
  icon:TreePine,
  text:"Otherworldly and enchanted — glowing moss, timeless beings, and shifting landscapes. What ancient powers sleep here? What is the price of entering this sacred space?"
 },
 {
  title:"Ancient Kingdom or Historical World",
  icon:Landmark,
  text:"Ruled by myth, monarchy, or ritual. How do belief systems shape society? Are temples central to life? What happens when faith is questioned?"
 },
 {
  title:"Pilgrimage Path or Sacred Journey",
  icon:Compass,
  text:"A physical journey through mountains, rivers, or spiritual cities — but also a symbolic one. Each stop challenges a wound: pride, anger, guilt, grief. The character meets strangers who carry messages or mirror their flaws. The journey ends with a surrender to God."
 },
 {
  title:"Temple Complex or Monastic World",
  icon:Landmark,
  text:"A setting centered around ritual, reflection, and transformation. How does the architecture reflect inner peace or hidden darkness? What vows or truths shape the people within?"
 },
 {
  title:"Technocratic Future",
  icon:Shell,
  text:"Automation rules, AI governs, and data is currency. What freedoms have been lost in the name of progress? Who resists? How does your character survive in a world where everything is monitored?"
 }
];

function SettingExplorationPage(){
 return (
  <main className="setting-exploration-page">
   <Container fluid>
    <section className="setting-hero">
     <Badge className="setting-badge">
      <Map size={16} className="me-2"/>
      Worldbuilding
     </Badge>

     <h1 className="setting-title">
      Setting <span>exploration</span>
     </h1>

     <p className="setting-lead">
      Your story’s setting is more than just a location — it creates tone, dictates limitations, shapes
      worldviews, and reveals hidden layers of your characters.
     </p>

     <p className="setting-text">
      The same plot can unfold in wildly different ways depending on where and when it’s set.
      Try imagining your story across various backdrops to unlock fresh possibilities.
     </p>
    </section>

    <section className="setting-atlas">
     {settingOptions.map((setting,index)=>{
      const Icon=setting.icon;

      return (
       <article className="setting-atlas-row" key={index}>
        <div className="setting-atlas-number">
         {String(index+1).padStart(2,"0")}
        </div>

        <div className="setting-atlas-icon">
         <Icon size={24}/>
        </div>

        <div className="setting-atlas-heading">
         <h2>{setting.title}</h2>
        </div>

        <div className="setting-atlas-copy">
         <p>{setting.text}</p>
        </div>
       </article>
      );
     })}
    </section>
   </Container>
  </main>
 );
}

export default SettingExplorationPage;