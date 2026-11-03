const longField=(key,label,placeholder)=>({key,label,placeholder,long:true});
const shortField=(key,label,placeholder)=>({key,label,placeholder,long:false});

export const ENTITY_TEMPLATES={
 CONCEPT:[longField("definition","Definition","Define the concept clearly."),longField("definingCharacteristics","Defining Characteristics","Describe the qualities that distinguish this concept."),longField("scope","Scope / Boundaries","Explain what the concept includes and excludes."),longField("examples","Examples","Record representative examples."),longField("relevance","Relevance","Explain why this concept matters to your work."),shortField("relatedConcepts","Related Concepts","Related, contrasting, or dependent concepts")],
 CHARACTER:[longField("coreTraits","Core Traits","Describe the character's defining traits."),longField("primaryConflict","Primary Conflict","Describe the character's central conflict."),longField("relationships","Relationships","Describe important character relationships."),shortField("appearsIn","Appears In","Works, chapters, scenes, or projects")],
 PERSON:[shortField("occupationField","Occupation / Field","Occupation, discipline, or field"),shortField("affiliation","Affiliation","Organizations, institutions, or movements"),longField("knownFor","Known For","Describe the person's notable contribution."),longField("relevantWorks","Relevant Works","List or describe relevant works."),longField("relevance","Relevance","Explain why this person matters to your work.")],
 INGREDIENT:[shortField("category","Category","Ingredient category"),longField("culinaryUses","Culinary Uses","Describe common culinary uses."),longField("flavorProfile","Flavor Profile","Describe flavor, aroma, and texture."),shortField("seasonality","Seasonality","Availability or best season"),longField("storage","Storage","Describe storage requirements and shelf life."),longField("yieldWasteConsiderations","Yield / Waste Considerations","Describe usable yield, trim, and waste."),shortField("relatedTechniques","Related Techniques","Related culinary techniques"),shortField("relatedIngredients","Related Ingredients","Related or substitute ingredients")],
 PLACE:[shortField("placeType","Place Type","City, building, region, fictional setting, etc."),shortField("location","Location","Address, coordinates, or local position"),shortField("regionCountry","Region / Country","Region and country"),longField("historicalCulturalRelevance","Historical / Cultural Relevance","Describe historical or cultural relevance."),longField("relatedPeopleOrganizations","Related People / Organizations","Identify related people and organizations.")],
 ORGANIZATION:[shortField("organizationType","Organization Type","Company, institution, association, etc."),shortField("location","Location","Primary location or headquarters"),longField("mission","Mission / Purpose","Describe the organization's mission or purpose."),longField("knownFor","Known For","Describe its notable work or reputation."),longField("relevance","Relevance","Explain why this organization matters to your work.")],
 TECHNIQUE:[shortField("category","Category","Technique category"),longField("purpose","Purpose","Explain what the technique accomplishes."),longField("process","Process","Describe the steps or method."),longField("materialsEquipment","Materials / Equipment","List required materials or equipment."),longField("applications","Applications","Describe where the technique is used."),longField("considerations","Considerations","Record limitations, risks, or quality considerations.")],
 EQUIPMENT:[shortField("category","Category","Equipment category"),longField("purpose","Purpose","Explain what the equipment is used for."),longField("specifications","Specifications","Record important specifications or capabilities."),longField("operation","Operation","Describe how it is operated."),longField("maintenanceSafety","Maintenance / Safety","Record care, maintenance, and safety requirements.")],
 PUBLICATION:[shortField("publicationType","Publication Type","Book, journal, magazine, website, etc."),shortField("creator","Author / Creator","Author, editor, or creator"),shortField("publisher","Publisher","Publisher or issuing organization"),shortField("publicationDate","Publication Date","Date or year"),longField("subject","Subject","Describe the publication's subject and scope."),longField("relevance","Relevance","Explain why this publication matters to your work.")],
 EVENT:[shortField("eventType","Event Type","Conference, historical event, meeting, etc."),shortField("datePeriod","Date / Period","Date, date range, or historical period"),shortField("location","Location","Where the event occurred"),longField("participants","Participants","Identify important participants."),longField("significance","Significance","Explain why the event matters."),longField("outcome","Outcome","Describe the event's outcome or consequences.")]
};

const TYPE_ALIASES={CONC:"CONCEPT",CONCEPT:"CONCEPT",CHAR:"CHARACTER",CHARACTER:"CHARACTER",PERS:"PERSON",PERSON:"PERSON",PEOPLE:"PERSON",INGR:"INGREDIENT",INGREDIENT:"INGREDIENT",PLAC:"PLACE",PLACE:"PLACE",LOCATION:"PLACE",ORG:"ORGANIZATION",ORGANIZATION:"ORGANIZATION",TECH:"TECHNIQUE",TECHNIQUE:"TECHNIQUE",EQUIP:"EQUIPMENT",EQUIPMENT:"EQUIPMENT",PUB:"PUBLICATION",PUBLICATION:"PUBLICATION",EVT:"EVENT",EVENT:"EVENT"};
const normalize=value=>String(value||"").trim().toUpperCase().replace(/[^A-Z0-9]+/g,"-");

export const getEntityTemplate=(typeCode,typeName="")=>{
 const code=normalize(typeCode);
 const name=normalize(typeName);
 if(!code&&!name)return [];
 const key=TYPE_ALIASES[code]||TYPE_ALIASES[name]||Object.keys(ENTITY_TEMPLATES).find(template=>code.includes(template)||name.includes(template));
 return ENTITY_TEMPLATES[key]||[];
};

export const getEntityTemplateLabel=(typeCode,typeName="")=>{
 const code=normalize(typeCode);
 const name=normalize(typeName);
 return TYPE_ALIASES[code]||TYPE_ALIASES[name]||Object.keys(ENTITY_TEMPLATES).find(template=>code.includes(template)||name.includes(template))||name||code;
};
