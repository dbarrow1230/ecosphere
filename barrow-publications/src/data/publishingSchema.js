// Shared by the forms and API validation. Each stage keeps its own saved details.
const text=(key,label,type="text")=>({key,label,type});
const file=(key,label,directory)=>({key,label,type:"file",directory});
export const workflowFields={
 "acquisitions/submissions":[text("authorEmail","Author email","email"),text("wordCount","Word count","number"),file("manuscriptUrl","Manuscript file","publishing/submissions"),text("synopsis","Synopsis","textarea")],
 "acquisitions/query-review":[text("audience","Target audience"),text("comparables","Comparable titles"),text("fit","Publisher fit","textarea"),text("response","Response notes","textarea")],
 "acquisitions/manuscript-evaluation":[text("reader","Reader"),text("strengths","Strengths","textarea"),text("concerns","Concerns","textarea"),text("recommendation","Recommendation","textarea")],
 "acquisitions/decisions":[text("decision","Decision"),text("decisionDate","Decision date","date"),file("contractUrl","Contract file","publishing/contracts"),text("conditions","Conditions / handoff","textarea")],
 "editorial/developmental-editing":[text("editor","Editor"),text("structure","Structure / chapter notes","textarea"),text("revisionBrief","Revision brief","textarea"),file("editedFile","Edited manuscript","publishing/editorial-files")],
 "editorial/line-editing":[text("editor","Editor"),text("voice","Voice and consistency","textarea"),text("changes","Requested changes","textarea"),file("editedFile","Edited manuscript","publishing/editorial-files")],
 "editorial/copyediting":[text("editor","Copyeditor"),file("styleSheet","Style sheet","publishing/copyedits"),text("queries","Open queries","textarea"),file("editedFile","Copyedited file","publishing/copyedits")],
 "editorial/author-revisions":[text("revisionDue","Revision due","date"),text("requested","Requested revisions","textarea"),file("returnedFile","Returned manuscript","publishing/author-files"),text("approval","Approval notes","textarea")],
 "production/cover-design":[text("designer","Designer"),text("brief","Cover brief","textarea"),file("coverUrl","Cover proof","publishing/cover-files"),text("approval","Approval notes","textarea")],
 "production/interior-layout":[text("trimSize","Trim size"),text("pageCount","Page count","number"),text("typesetter","Typesetter"),file("interiorUrl","Interior proof","publishing/interior-files")],
 "production/proofreading":[text("proofreader","Proofreader"),text("round","Proof round","number"),text("corrections","Corrections / unresolved issues","textarea"),text("signoff","Signoff notes","textarea")],
 "production/files":[file("printUrl","Print PDF","publishing/print-files"),file("ebookUrl","EPUB","publishing/ebook-files"),file("sourceUrl","Source files","publishing/ebook-files"),text("validation","Validation results","textarea")],
 "release/isbn-metadata":[text("isbn","ISBN"),text("bisac","BISAC codes"),text("keywords","Keywords"),text("description","Book description","textarea")],
 "release/schedule":[text("releaseDate","Release date","date"),text("preorderDate","Preorder date","date"),text("milestones","Milestones","textarea"),text("dependencies","Dependencies","textarea")],
 "release/distribution":[text("distributor","Distributor"),text("channels","Channels"),text("territories","Territories"),text("delivery","Delivery / upload notes","textarea")],
 "release/checklist":[text("metadataApproval","Metadata approval"),text("fileApproval","File approval"),text("proofApproval","Proof approval"),text("goLive","Go-live confirmation","textarea")],
 "marketing/campaigns":[text("goal","Campaign goal"),text("channels","Channels"),text("budget","Budget","number"),text("plan","Campaign plan","textarea")],
 "marketing/arc-readers":[text("reviewer","Reviewer"),text("reviewerEmail","Reviewer email","email"),text("sentDate","Copy sent","date"),text("reviewUrl","Review link","url")],
 "marketing/press-kit":[text("bio","Author bio","textarea"),file("sellSheet","Sell sheet","publishing/press-kits"),file("assets","Media assets","publishing/marketing-assets"),text("mediaCopy","Media copy","textarea")],
 "marketing/launch-plan":[text("launchDate","Launch date","date"),text("events","Events","textarea"),text("outreach","Outreach plan","textarea"),text("tasks","Launch tasks","textarea")],
 "sales-rights/channels":[text("channel","Sales channel"),text("units","Units","number"),text("revenue","Revenue","number"),text("currency","Currency")],
 "sales-rights/royalties":[text("payee","Payee"),text("period","Statement period"),text("terms","Royalty terms","textarea"),text("amountDue","Amount due","number"),text("amountPaid","Amount paid","number"),text("currency","Currency")],
 "sales-rights/rights":[text("licensee","Licensee"),text("formats","Formats"),text("territories","Territories"),text("expires","Expiry date","date"),file("agreement","Agreement","publishing/rights-files")],
 "sales-rights/reports":[text("period","Reporting period"),file("reportUrl","Report file","publishing/royalty-reports"),text("findings","Findings","textarea"),text("actions","Follow-up actions","textarea")]
};
export const workflowStatuses=["not-started","in-progress","in-review","blocked","completed","archived"];
export const referenceSections=["editorial-guidelines","style-guide","metadata-guide","production-checklist"];
export const referenceStatuses=["draft","approved","archived"];
export const readable=value=>String(value||"").replaceAll("-"," ");
