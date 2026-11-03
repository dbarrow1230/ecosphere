import {
 BookOpen,
 CalendarDays,
 CheckCircle2,
 ClipboardList,
 FileText,
 Megaphone,
 PenLine,
 Search,
 ShieldCheck,
 Store,
 Users
} from "lucide-react";

export const publishingWorkflowSections=[
 {
  id:"acquisitions",
  label:"Acquisitions",
  path:"/publishing/acquisitions",
  kicker:"Intake",
  icon:Search,
  summary:"Track submissions from first query through acceptance decision.",
  items:[
   {label:"Submissions",path:"/publishing/acquisitions/submissions",meta:"Incoming queries, manuscript packets, author details, and intake status."},
   {label:"Query Review",path:"/publishing/acquisitions/query-review",meta:"Screen fit, genre, audience, comp titles, and response notes."},
   {label:"Manuscript Evaluation",path:"/publishing/acquisitions/manuscript-evaluation",meta:"Reader notes, editorial scorecards, market fit, and viability review."},
   {label:"Acquisition Decisions",path:"/publishing/acquisitions/decisions",meta:"Accept, reject, revise-and-resubmit, contract, and handoff decisions."}
  ]
 },
 {
  id:"editorial",
  label:"Editorial",
  path:"/publishing/editorial",
  kicker:"Manuscript",
  icon:PenLine,
  summary:"Move accepted manuscripts through editing and author revisions.",
  items:[
   {label:"Developmental Editing",path:"/publishing/editorial/developmental-editing",meta:"Structure, story, argument, chapter flow, and macro-edit notes."},
   {label:"Line Editing",path:"/publishing/editorial/line-editing",meta:"Voice, clarity, rhythm, sentence-level improvements, and style decisions."},
   {label:"Copyediting",path:"/publishing/editorial/copyediting",meta:"Grammar, consistency, house style, citations, and final editorial cleanup."},
   {label:"Author Revisions",path:"/publishing/editorial/author-revisions",meta:"Revision requests, returned files, outstanding questions, and approvals."}
  ]
 },
 {
  id:"production",
  label:"Production",
  path:"/publishing/production",
  kicker:"Book Build",
  icon:BookOpen,
  summary:"Prepare cover, interior, proofing, and final publication files.",
  items:[
   {label:"Cover Design",path:"/publishing/production/cover-design",meta:"Brief, drafts, approvals, final art, and platform-ready cover files."},
   {label:"Interior Layout",path:"/publishing/production/interior-layout",meta:"Trim size, typography, print layout, ebook formatting, and corrections."},
   {label:"Proofreading",path:"/publishing/production/proofreading",meta:"Proof rounds, errata, final corrections, and signoff status."},
   {label:"Print & Ebook Files",path:"/publishing/production/files",meta:"PDF, EPUB, MOBI, source files, validation, and delivery readiness."}
  ]
 },
 {
  id:"release",
  label:"Publishing",
  path:"/publishing/release",
  kicker:"Release",
  icon:CalendarDays,
  summary:"Coordinate metadata, ISBNs, schedule, distribution, and release readiness.",
  items:[
   {label:"ISBN & Metadata",path:"/publishing/release/isbn-metadata",meta:"ISBNs, BISAC, keywords, descriptions, contributors, and imprint data."},
   {label:"Release Schedule",path:"/publishing/release/schedule",meta:"Milestones, launch date, preorder windows, and dependency tracking."},
   {label:"Distribution",path:"/publishing/release/distribution",meta:"Retailers, wholesalers, print partners, ebook channels, and territories."},
   {label:"Publication Checklist",path:"/publishing/release/checklist",meta:"Final approvals, file uploads, metadata checks, and go-live confirmation."}
  ]
 },
 {
  id:"marketing",
  label:"Marketing",
  path:"/publishing/marketing",
  kicker:"Audience",
  icon:Megaphone,
  summary:"Plan campaigns, ARC outreach, press materials, and launch tasks.",
  items:[
   {label:"Campaign Planning",path:"/publishing/marketing/campaigns",meta:"Campaign goals, channels, budget, timeline, and creative assets."},
   {label:"ARC Readers",path:"/publishing/marketing/arc-readers",meta:"Reviewer lists, copy delivery, review status, and follow-ups."},
   {label:"Press Kit",path:"/publishing/marketing/press-kit",meta:"Author bio, sell sheet, cover images, excerpts, media copy, and links."},
   {label:"Launch Plan",path:"/publishing/marketing/launch-plan",meta:"Launch events, email, social, partner outreach, and release-week tasks."}
  ]
 },
 {
  id:"sales-rights",
  label:"Sales & Rights",
  path:"/publishing/sales-rights",
  kicker:"Revenue",
  icon:Store,
  summary:"Track sales channels, royalties, rights, licensing, and reporting.",
  items:[
   {label:"Sales Channels",path:"/publishing/sales-rights/channels",meta:"Retail, direct, wholesale, library, school, event, and bulk sales channels."},
   {label:"Royalties",path:"/publishing/sales-rights/royalties",meta:"Royalty terms, statements, balances, payments, and exceptions."},
   {label:"Rights Management",path:"/publishing/sales-rights/rights",meta:"Format, translation, audio, territory, subsidiary rights, and licenses."},
   {label:"Reports",path:"/publishing/sales-rights/reports",meta:"Sales performance, campaign results, inventory movement, and royalty exports."}
  ]
 }
];

export const publishingReferencePages=[
 {
  slug:"editorial-guidelines",
  title:"Editorial Guidelines",
  icon:ClipboardList,
  items:[
   "House style and manuscript standards",
   "Developmental, line, copyedit, and proof stages",
   "Author revision and approval expectations"
  ]
 },
 {
  slug:"style-guide",
  title:"Style Guide",
  icon:FileText,
  items:[
   "Imprint voice, punctuation, capitalization, and formatting rules",
   "Series consistency and recurring brand decisions",
   "Exceptions and project-specific notes"
  ]
 },
 {
  slug:"metadata-guide",
  title:"Metadata Guide",
  icon:ShieldCheck,
  items:[
   "ISBN, BISAC, keywords, contributors, and descriptions",
   "Retail platform fields and required assets",
   "Release status, territories, pricing, and availability"
  ]
 },
 {
  slug:"production-checklist",
  title:"Production Checklist",
  icon:CheckCircle2,
  items:[
   "Cover, interior, ebook, and source file readiness",
   "Proof corrections and final approvals",
   "Distribution upload and publication signoff"
  ]
 }
];

export const publishingDashboardStats=[
 {label:"Workflow Stages",value:publishingWorkflowSections.length,detail:"Acquisitions through sales and rights",icon:ClipboardList},
 {label:"Active Checkpoints",value:publishingWorkflowSections.reduce((total,section)=>total+section.items.length,0),detail:"Routable workflow pages for testing",icon:CheckCircle2},
 {label:"Reference Pages",value:publishingReferencePages.length,detail:"Guides wired from the Reference menu",icon:FileText},
 {label:"Admin Areas",value:12,detail:"Business, users, settings, and reference data",icon:Users}
];
