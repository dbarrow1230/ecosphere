// src/components/dashboard/DashboardStats.jsx
import {useIcons} from "@shared";
import "./DashboardStats.css";

function DashboardStats({stats=[]}){

 const {LucideIcons={}}=useIcons();

 const normalizeKey=value=>{
  return String(value||"")
   .trim()
   .toLowerCase()
   .replace(/&/g,"and")
   .replace(/[_\s]+/g,"-")
   .replace(/[^a-z0-9-]/g,"");
 };

 const getIcon=name=>{
  return LucideIcons[name]||LucideIcons.ChartColumnStacked||null;
 };

 const getStatKey=item=>{
  return normalizeKey(
   item.key||
   item.name||
   item.coreName||
   item.field||
   item.dataKey||
   item.label
  );
 };

 const shopLabelMap={
  tasks:"Orders",
  task:"Order",
  priorities:"Priority Orders",
  priority:"Priority Order",
  goals:"Production Goals",
  goal:"Production Goal",
  habits:"Daily Operations",
  habit:"Daily Operation",
  routines:"Shop Routines",
  routine:"Shop Routine",
  reminders:"Shop Reminders",
  reminder:"Shop Reminder",
  journal:"Production Logs",
  journals:"Production Logs",
  journalentries:"Production Logs",
  "journal-entries":"Production Logs",
  mindfulness:"Shop Check-ins",
  mood:"Customer Mood",
  moods:"Customer Mood",
  notes:"Shop Notes",
  note:"Shop Note",
  memories:"Shop Records",
  memory:"Shop Record",
  events:"Shop Events",
  event:"Shop Event",
  calendarevents:"Production Calendar",
  "calendar-events":"Production Calendar",
  timeline:"Sales Timeline",
  timelines:"Sales Timeline",
  milestones:"Shop Milestones",
  milestone:"Shop Milestone",
  reviews:"Shop Reviews",
  review:"Shop Review",
  categories:"Shop Categories",
  category:"Shop Category",
  tags:"Shop Tags",
  tag:"Shop Tag",
  lifeareas:"Shop Areas",
  "life-areas":"Shop Areas",
  lifethemes:"Shop Themes",
  "life-themes":"Shop Themes",
  visionboards:"Shop Boards",
  "vision-boards":"Shop Boards"
 };

 const getStatLabel=item=>{
  const label=item.label||
   item.name||
   item.coreName||
   item.field||
   item.key||
   "Stat";

  return shopLabelMap[normalizeKey(label)]||label;
 };

 const hasValue=value=>{
  if(value===null||value===undefined)return false;
  if(typeof value==="number")return value>0;
  if(typeof value==="string")return value.trim()!==""&&value.trim()!=="0";
  return Boolean(value);
 };

 const getEmptyText=item=>{
  return item.emptyText||
   item.noDataText||
   `No ${String(getStatLabel(item)).toLowerCase()} data for this period.`;
 };

 const getSummaryText=item=>{
  return item.averageMood||
   item.moodAverage||
   item.summary||
   item.average||
   "";
 };

 const coreFields={
  tasks:{field:"status",values:["pending","in-progress","completed","cancelled","archived"]},
  priorities:{field:"status",values:["active","completed","paused","cancelled","archived"]},
  goals:{field:"status",values:["not-started","in-progress","completed","paused","archived"]},
  habits:{field:"status",values:["active","paused","completed","archived"]},
  routines:{field:"status",values:["active","paused","completed","archived"]},
  reminders:{field:"status",values:["pending","processing","sent","failed","paused","dismissed","completed","cancelled"]},
  journal:{field:"journalType",values:["daily","private","reflection","gratitude","memory","dream","free-write"]},
  journalEntries:{field:"journalType",values:["daily","private","reflection","gratitude","memory","dream","free-write"]},
  mindfulness:{field:"mindfulnessType",values:["check-in","gratitude","breathing","body-scan","stress","intention","reflection","grounding","general"]},
  mood:{field:"moodType",values:["happy","calm","neutral","sad","angry","anxious","tired","energized","general"]},
  notes:{field:"noteType",values:["general","cornell","mindmap","outline","boxing","charting","sentence","slides","brain-dump","bullet"]},
  memories:{field:"memoryType",values:["personal","family","friendship","relationship","career","creative","travel","health","achievement","lesson","loss","other"]},
  events:{field:"eventType",values:["appointment","meeting","personal","work","holiday","birthday","general"]},
  calendarEvents:{field:"eventType",values:["appointment","meeting","personal","work","holiday","birthday","general"]},
  timeline:{field:"timelineType",values:["memory","milestone","event","achievement","reflection","general"]},
  milestones:{field:"status",values:["pending","in-progress","completed","archived"]},
  reviews:{field:"reviewType",values:["weekly","monthly","yearly","goal","habit","general"]},
  categories:{field:"categoryType",values:["task","goal","habit","journal","note","mindfulness","milestone","timeline","general"]},
  lifeThemes:{field:"status",values:["active","completed","archived"]},
  tags:null,
  lifeAreas:null,
  visionBoards:null
 };

 const statKeyAliases={
  task:"tasks",
  tasks:"tasks",
  priority:"priorities",
  priorities:"priorities",
  goal:"goals",
  goals:"goals",
  habit:"habits",
  habits:"habits",
  routine:"routines",
  routines:"routines",
  reminder:"reminders",
  reminders:"reminders",
  journal:"journal",
  journals:"journal",
  journalentry:"journalEntries",
  journalentries:"journalEntries",
  "journal-entry":"journalEntries",
  "journal-entries":"journalEntries",
  mindfulness:"mindfulness",
  mood:"mood",
  moods:"mood",
  moodlog:"mood",
  "mood-log":"mood",
  moodlogs:"mood",
  "mood-logs":"mood",
  note:"notes",
  notes:"notes",
  memory:"memories",
  memories:"memories",
  event:"events",
  events:"events",
  calendar:"calendarEvents",
  calendars:"calendarEvents",
  calendarevent:"calendarEvents",
  calendarevents:"calendarEvents",
  "calendar-event":"calendarEvents",
  "calendar-events":"calendarEvents",
  timeline:"timeline",
  timelines:"timeline",
  milestone:"milestones",
  milestones:"milestones",
  review:"reviews",
  reviews:"reviews",
  category:"categories",
  categories:"categories",
  tag:"tags",
  tags:"tags",
  lifearea:"lifeAreas",
  lifeareas:"lifeAreas",
  "life-area":"lifeAreas",
  "life-areas":"lifeAreas",
  lifetheme:"lifeThemes",
  lifethemes:"lifeThemes",
  "life-theme":"lifeThemes",
  "life-themes":"lifeThemes",
  visionboard:"visionBoards",
  visionboards:"visionBoards",
  "vision-board":"visionBoards",
  "vision-boards":"visionBoards"
 };

 const fieldAliases={
  tasktype:"taskType",
  "task-type":"taskType",
  type:"taskType",
  status:"status",
  priority:"priority",
  prioritylevel:"priorityLevel",
  "priority-level":"priorityLevel",
  prioritytype:"priorityType",
  "priority-type":"priorityType",
  routinetype:"routineType",
  "routine-type":"routineType",
  remindertype:"reminderType",
  "reminder-type":"reminderType",
  frequency:"frequency",
  journaltype:"journalType",
  "journal-type":"journalType",
  mindfulnesstype:"mindfulnessType",
  "mindfulness-type":"mindfulnessType",
  moodtype:"moodType",
  "mood-type":"moodType",
  notetype:"noteType",
  "note-type":"noteType",
  memorytype:"memoryType",
  "memory-type":"memoryType",
  eventtype:"eventType",
  "event-type":"eventType",
  timelinetype:"timelineType",
  "timeline-type":"timelineType",
  reviewtype:"reviewType",
  "review-type":"reviewType",
  categorytype:"categoryType",
  "category-type":"categoryType",
  themetype:"themeType",
  "theme-type":"themeType",
  isactive:"isActive",
  "is-active":"isActive",
  isprivate:"isPrivate",
  "is-private":"isPrivate"
 };

 const valueAliases={
  done:"completed",
  complete:"completed",
  blocked:"cancelled",
  canceled:"cancelled",
  cancelled:"cancelled",
  inprogress:"in-progress",
  "in-progress":"in-progress",
  notstarted:"not-started",
  "not-started":"not-started",
  private:"private",
  entries:"entries",
  logs:"logs"
 };

 const labelMap={
  status:"Status",
  taskType:"Order Type",
  priority:"Priority",
  priorityType:"Priority Type",
  priorityLevel:"Priority Level",
  routineType:"Shop Routine Type",
  reminderType:"Shop Reminder Type",
  frequency:"Frequency",
  journalType:"Production Log Type",
  mindfulnessType:"Shop Check-in Type",
  moodType:"Customer Mood Type",
  noteType:"Shop Note Type",
  memoryType:"Shop Record Type",
  eventType:"Shop Event Type",
  timelineType:"Sales Timeline Type",
  reviewType:"Shop Review Type",
  categoryType:"Shop Category Type",
  themeType:"Shop Theme Type",
  isActive:"Active",
  isPrivate:"Private",
  pending:"Pending",
  processing:"Processing",
  sent:"Sent",
  failed:"Failed",
  "in-progress":"In Progress",
  completed:"Completed",
  cancelled:"Cancelled",
  archived:"Archived",
  active:"Active",
  paused:"Paused",
  dismissed:"Dismissed",
  open:"Open",
  "not-started":"Not Started",
  scheduled:"Scheduled",
  low:"Low",
  medium:"Medium",
  high:"High",
  urgent:"Urgent",
  daily:"Daily",
  weekly:"Weekly",
  monthly:"Monthly",
  yearly:"Yearly",
  custom:"Custom",
  morning:"Morning",
  afternoon:"Afternoon",
  evening:"Evening",
  night:"Night",
  "weekly-reset":"Weekly Reset",
  "monthly-reset":"Monthly Reset",
  "self-care":"Staff Care",
  work:"Shop Work",
  study:"Training",
  fitness:"Operations",
  private:"Private",
  reflection:"Reflection",
  gratitude:"Customer Appreciation",
  memory:"Shop Record",
  dream:"Shop Idea",
  "free-write":"Free Write",
  "check-in":"Check-in",
  breathing:"Break",
  "body-scan":"Staff Check",
  stress:"Stress",
  intention:"Intention",
  grounding:"Grounding",
  general:"General",
  happy:"Happy",
  calm:"Calm",
  neutral:"Neutral",
  sad:"Sad",
  angry:"Angry",
  anxious:"Anxious",
  tired:"Tired",
  energized:"Energized",
  cornell:"Cornell",
  mindmap:"Mind Map",
  outline:"Outline",
  boxing:"Boxing",
  charting:"Charting",
  sentence:"Sentence",
  slides:"Slides",
  "brain-dump":"Brain Dump",
  bullet:"Bullet",
  personal:"Personal",
  family:"Family",
  friendship:"Friendship",
  relationship:"Relationship",
  career:"Business",
  creative:"Creative",
  travel:"Delivery",
  health:"Staff Wellness",
  achievement:"Achievement",
  lesson:"Lesson",
  loss:"Loss",
  other:"Other",
  appointment:"Appointment",
  meeting:"Meeting",
  holiday:"Holiday",
  birthday:"Birthday",
  milestone:"Milestone",
  event:"Shop Event",
  goal:"Production Goal",
  habit:"Daily Operation",
  task:"Order",
  journal:"Production Log",
  note:"Shop Note",
  mindfulness:"Shop Check-in",
  calendarEvent:"Production Calendar Event",
  review:"Shop Review",
  category:"Shop Category",
  tag:"Shop Tag",
  timeline:"Sales Timeline",
  quarterly:"Quarterly",
  seasonal:"Seasonal"
 };

 const statIcons={
  tasks:"ListChecks",
  task:"ListChecks",
  priorities:"TriangleAlert",
  priority:"TriangleAlert",
  prioritylevel:"TriangleAlert",
  "priority-level":"TriangleAlert",
  status:"CircleDot",
  pending:"Clock3",
  processing:"Timer",
  sent:"CheckCircle2",
  failed:"XCircle",
  "in-progress":"Timer",
  completed:"CheckCircle2",
  cancelled:"XCircle",
  archived:"Archive",
  active:"Activity",
  inactive:"Ban",
  paused:"PauseCircle",
  dismissed:"Ban",
  open:"Square",
  "not-started":"Circle",
  scheduled:"CalendarClock",
  low:"CircleDot",
  medium:"AlertCircle",
  high:"TriangleAlert",
  urgent:"Flame",
  daily:"CalendarCheck",
  weekly:"CalendarRange",
  monthly:"CalendarDays",
  yearly:"CalendarClock",
  custom:"Gauge",
  morning:"CalendarCheck",
  afternoon:"CalendarDays",
  evening:"CalendarClock",
  night:"Clock3",
  "weekly-reset":"Repeat",
  "monthly-reset":"Repeat",
  "self-care":"Sparkles",
  work:"CalendarClock",
  study:"BookOpen",
  fitness:"Activity",
  goals:"Target",
  goal:"Target",
  habits:"CalendarCheck",
  habit:"CalendarCheck",
  frequency:"Repeat",
  routines:"Repeat",
  routine:"Repeat",
  reminders:"Bell",
  reminder:"Bell",
  journal:"BookOpen",
  journals:"BookOpen",
  "journal-type":"BookOpen",
  journaltype:"BookOpen",
  private:"ShieldCheck",
  reflection:"BookOpen",
  gratitude:"Sparkles",
  memory:"Archive",
  dream:"Sparkles",
  "free-write":"BookOpen",
  mindfulness:"Brain",
  "mindfulness-type":"Brain",
  mindfulnesstype:"Brain",
  "check-in":"CheckSquare",
  breathing:"Brain",
  "body-scan":"Brain",
  stress:"TriangleAlert",
  intention:"Target",
  grounding:"Map",
  general:"ChartColumnStacked",
  mood:"Smile",
  moods:"Smile",
  "mood-log":"Smile",
  moodlog:"Smile",
  happy:"Smile",
  calm:"Smile",
  neutral:"Smile",
  sad:"Smile",
  angry:"TriangleAlert",
  anxious:"TriangleAlert",
  tired:"Clock3",
  energized:"Flame",
  notes:"StickyNote",
  note:"StickyNote",
  cornell:"StickyNote",
  mindmap:"Map",
  outline:"ListChecks",
  boxing:"Square",
  charting:"ChartColumnStacked",
  sentence:"BookOpen",
  slides:"Images",
  "brain-dump":"Brain",
  bullet:"ListChecks",
  idea:"Sparkles",
  planning:"CalendarPlus",
  reference:"BookOpen",
  memories:"Archive",
  personal:"CalendarHeart",
  family:"CalendarHeart",
  friendship:"CalendarHeart",
  relationship:"CalendarHeart",
  career:"Target",
  creative:"Sparkles",
  travel:"Map",
  health:"Activity",
  achievement:"Flag",
  lesson:"BookOpen",
  loss:"Archive",
  other:"ChartColumnStacked",
  events:"CalendarDays",
  event:"CalendarDays",
  calendar:"CalendarDays",
  "calendar-events":"CalendarDays",
  calendarevents:"CalendarDays",
  appointment:"CalendarCheck",
  meeting:"CalendarDays",
  holiday:"Sparkles",
  birthday:"CalendarHeart",
  reviews:"ClipboardCheck",
  review:"ClipboardCheck",
  milestones:"Flag",
  milestone:"Flag",
  timeline:"Clock3",
  timelines:"Clock3",
  categories:"Layers",
  category:"Layers",
  "category-type":"Layers",
  categorytype:"Layers",
  tags:"Tags",
  tag:"Tags",
  "life-areas":"Map",
  lifeareas:"Map",
  "life-area":"Map",
  lifearea:"Map",
  lifethemes:"Sparkles",
  "life-themes":"Sparkles",
  themetype:"Sparkles",
  "theme-type":"Sparkles",
  "vision-boards":"Images",
  visionboards:"Images",
  "is-active":"Activity",
  isactive:"Activity",
  gauge:"Gauge",
  orders:"ListChecks",
  inventory:"Archive",
  production:"Target",
  vendors:"Archive",
  ingredients:"Archive",
  menu:"ListChecks",
  sales:"ChartColumnStacked"
 };

 const getCoreStatKey=item=>{
  const statKey=getStatKey(item);

  return statKeyAliases[statKey]||statKey;
 };

 const getBadgeNumber=badge=>{
  return Number(badge?.value??badge?.total??badge?.count??0)||0;
 };

 const getPriorityRecords=item=>{
  if(Array.isArray(item?.records))return item.records;
  if(Array.isArray(item?.items))return item.items;
  if(Array.isArray(item?.data))return item.data;
  if(Array.isArray(item?.priorities))return item.priorities;
  if(Array.isArray(item?.rows))return item.rows;

  return [];
 };

 const getPriorityRecordTitle=record=>{
  return String(record?.title||"").trim()||"Untitled Priority Order";
 };

 const getPriorityTitleBadges=item=>{
  const priorities=getPriorityRecords(item);
  const titleCounts={};

  priorities.forEach(priority=>{
   const title=getPriorityRecordTitle(priority);
   titleCounts[title]=(titleCounts[title]||0)+1;
  });

  return Object.entries(titleCounts).map(([label,value])=>({
   key:label,
   label,
   value,
   variant:"priority"
  }));
 };

 const getBadgeSum=item=>{
  if(!Array.isArray(item?.badges))return 0;

  return item.badges.reduce((total,badge)=>{
   return total+getBadgeNumber(badge);
  },0);
 };

 const getPriorityStatValue=item=>{
  const priorityRecords=getPriorityRecords(item);

  if(priorityRecords.length)return priorityRecords.length;

  const directValue=item.value??item.total??item.count;

  if(hasValue(directValue))return directValue;

  return getBadgeSum(item);
 };

 const getStatValue=item=>{
  const coreStatKey=getCoreStatKey(item);
  const directValue=item.value??item.total??item.count;

  if(coreStatKey==="priorities"){
   return getPriorityStatValue(item);
  }

  return directValue??0;
 };

 const getCoreField=(item,badge)=>{
  const coreStatKey=getCoreStatKey(item);
  const config=coreFields[coreStatKey];

  if(config?.field){
   return config.field;
  }

  const rawField=normalizeKey(
   badge.field||
   badge.coreField||
   badge.modelField||
   ""
  );

  return fieldAliases[rawField]||badge.field||badge.coreField||badge.modelField||"";
 };

 const getCoreValue=badge=>{
  const rawValue=normalizeKey(
   badge.valueKey||
   badge.enumValue||
   badge.key||
   badge.name||
   badge.title||
   badge.label
  );

  return valueAliases[rawValue]||rawValue;
 };

 const getBadgeCount=(item,field,value)=>{
  if(!Array.isArray(item.badges))return 0;

  const match=item.badges.find(badge=>{
   const badgeValue=getCoreValue(badge);
   const rawField=normalizeKey(
    badge.field||
    badge.coreField||
    badge.modelField||
    ""
   );
   const badgeField=fieldAliases[rawField]||badge.field||badge.coreField||badge.modelField||field;

   return badgeField===field&&badgeValue===value;
  });

  if(!match){
   const valueOnlyMatch=item.badges.find(badge=>getCoreValue(badge)===value);

   return valueOnlyMatch?.value??valueOnlyMatch?.total??valueOnlyMatch?.count??0;
  }

  return match.value??match.total??match.count??0;
 };

 const isCoreBadge=(item,badge)=>{
  const coreStatKey=getCoreStatKey(item);
  const config=coreFields[coreStatKey];

  if(!config?.field||!Array.isArray(config.values))return false;

  const rawField=normalizeKey(
   badge.field||
   badge.coreField||
   badge.modelField||
   ""
  );
  const badgeField=fieldAliases[rawField]||badge.field||badge.coreField||badge.modelField||"";
  const badgeValue=getCoreValue(badge);

  return badgeField===config.field&&config.values.includes(badgeValue);
 };

 const getCustomDisplayBadges=item=>{
  if(!Array.isArray(item.badges))return [];

  return item.badges
   .filter(badge=>hasValue(getBadgeNumber(badge)))
   .filter(badge=>!isCoreBadge(item,badge))
   .map(badge=>({
    ...badge,
    field:badge.field||badge.coreField||badge.modelField||"",
    key:badge.key||badge.name||badge.title||badge.label,
    label:badge.label||badge.title||badge.name||badge.key,
    value:getBadgeNumber(badge),
    variant:badge.variant||badge.key||badge.name||badge.title||badge.label||"priority"
   }));
 };

 const getDisplayBadges=item=>{
  const coreStatKey=getCoreStatKey(item);
  const config=coreFields[coreStatKey];

  if(coreStatKey==="priorities"){
   const priorityTitleBadges=getPriorityTitleBadges(item);

   if(priorityTitleBadges.length){
    return priorityTitleBadges;
   }

   const customBadges=getCustomDisplayBadges(item);

   if(customBadges.length){
    return customBadges;
   }

   return [];
  }

  if(config===null)return [];

  if(config?.field&&Array.isArray(config.values)){
   return config.values
    .map(value=>({
     field:config.field,
     key:value,
     label:labelMap[value]||value,
     value:getBadgeCount(item,config.field,value),
     variant:value
    }))
    .filter(badge=>hasValue(badge.value));
  }

  if(!Array.isArray(item.badges))return [];

  return item.badges.filter(badge=>hasValue(badge.value??badge.total??badge.count));
 };

 const getBadgeFieldLabel=(item,badge)=>{
  const coreStatKey=getCoreStatKey(item);

  if(coreStatKey==="priorities")return "";

  const field=getCoreField(item,badge);

  return labelMap[field]||field||"";
 };

 const getBadgeValueLabel=badge=>{
  const value=getCoreValue(badge);

  return badge.label||
   badge.title||
   badge.name||
   labelMap[value]||
   badge.valueKey||
   badge.key||
   badge.field||
   "";
 };

 const getBadgeClass=badge=>{
  const badgeKey=getCoreValue(badge);
  const variant=badge.variant||badgeKey;

  return `dashboard-stat-badge-row dashboard-stat-badge-${normalizeKey(variant)||"default"}`;
 };

 const getBadgeIcon=badge=>{
  const badgeKey=normalizeKey(
   getCoreValue(badge)||
   badge.key||
   badge.name||
   badge.title||
   badge.field||
   badge.label
  );

  return getIcon(statIcons[badgeKey]||statIcons[normalizeKey(badge.type)]||"ChartColumnStacked");
 };

 return(
  <section className="dashboard-cards dashboard-cards-compact">
   {stats?.map(item=>{
    const statKey=getStatKey(item);
    const statLabel=getStatLabel(item);
    const statValue=getStatValue(item);
    const displayBadges=getDisplayBadges(item);
    const summaryText=getSummaryText(item);
    const hasStatData=hasValue(statValue)||displayBadges.length>0||hasValue(summaryText);

    return(
     <article key={statKey||statLabel} className="dashboard-card dashboard-card-compact">

      <div className="dashboard-stat-top">
       <span className="dashboard-card-icon dashboard-card-icon-compact">
        {getIcon(statIcons[statKey]||"ChartColumnStacked")}
       </span>

       <span className="dashboard-stat-name">{statLabel}</span>

       <span className="dashboard-stat-total">{statValue}</span>
      </div>

      {hasValue(summaryText)&&(
       <div className="dashboard-stat-summary">
        {summaryText}
       </div>
      )}

      {displayBadges.length>0&&(
       <div className="dashboard-stat-badges">
        {displayBadges.map(badge=>{
         const badgeKey=normalizeKey(badge.key||badge.name||badge.title||badge.field||badge.label);
         const badgeFieldLabel=getBadgeFieldLabel(item,badge);
         const badgeValueLabel=getBadgeValueLabel(badge);
         const badgeValue=badge.value??badge.total??badge.count??0;

         return(
          <div key={`${statKey||statLabel}-${badgeFieldLabel}-${badgeKey}`} className={getBadgeClass(badge)}>
           <span className="dashboard-stat-badge-label">
            {getBadgeIcon(badge)&&(
             <span className="dashboard-stat-badge-icon">
              {getBadgeIcon(badge)}
             </span>
            )}

            <span>
             {badgeFieldLabel?`${badgeFieldLabel}: ${badgeValueLabel}`:badgeValueLabel}
            </span>
           </span>

           <strong>{badgeValue}</strong>
          </div>
         );
        })}
       </div>
      )}

      {!hasStatData&&(
       <div className="dashboard-stat-empty">
        {getEmptyText(item)}
       </div>
      )}

     </article>
    );
   })}
  </section>
 );
}

export default DashboardStats;