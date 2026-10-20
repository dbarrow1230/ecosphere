from pathlib import Path

def edit(path,old,new):
 p=Path(path);s=p.read_text(encoding='utf-8');assert old in s,(path,old);p.write_text(s.replace(old,new),encoding='utf-8')
# seeding log belongs to an existing growing run
runfields=[('sourceName','Source','text'),('seedCost','Seed cost','number'),('sownCount','Number sown','number'),('sproutedDate','Sprouted date','date'),('sproutedCount','Number sprouted','number'),('transplantedDate','Transplanted date','date'),('transplantedCount','Number transplanted','number'),('soilNotes','Soil / growing medium','text'),('sunNotes','Sun exposure','text')]
for key,label,typ in runfields:
 schema='Date,default:null' if typ=='date' else 'Number,min:0,default:0' if typ=='number' else 'String,trim:true,default:""'
 edit('backend/models/plants/plantingModel.js','instanceName:{',f'{key}:{{type:{schema}}},\ninstanceName:{{')
 cleaner='cleanDate' if typ=='date' else 'cleanNumber' if typ=='number' else 'cleanString'
 edit('backend/controllers/plants/plantingController.js','instanceName:data.instanceName',f'{key}:data.{key}!==undefined?{cleaner}(data.{key}):{cleaner}(existing.{key}),\ninstanceName:data.instanceName')
 edit('src/pages/plantings/PlantingsPage.jsx','const defaultInstanceForm={',f'const defaultInstanceForm={{{key}:"",')
 edit('src/pages/plantings/PlantingsPage.jsx','   quantity:item.quantity ?? 1,',f'   {key}:{"formatDateForInput(item."+key+")" if typ=="date" else "item."+key+"??\"\""},\n   quantity:item.quantity ?? 1,')
 edit('src/pages/plantings/PlantingsPage.jsx','    quantity:formData.quantity',f'    {key}:{"formData."+key+"||null" if typ=="date" else "Number(formData."+key+")||0" if typ=="number" else "formData."+key},\n    quantity:formData.quantity')
 edit('src/pages/plantings/PlantingsPage.jsx','      <Col md={12}>\n       <InputGroup>\n        <InputGroup.Text>Outcome',f'      <Col md={{6}}><Form.Group controlId="run-{key}"><Form.Label>{label}</Form.Label><Form.Control type="{typ}" {"min=\"0\" step=\"any\"" if typ=="number" else ""} name="{key}" value={{formData.{key}}} onChange={{onChange}}/></Form.Group></Col>\n      <Col md={{12}}>\n       <InputGroup>\n        <InputGroup.Text>Outcome')
edit('src/pages/plantings/PlantingsPage.jsx','       {item.outcomeNotes&&(','''       {item.runKind!=="hydro"&&<p>Seeding: {item.sownCount??0} sown; {item.sproutedCount??0} sprouted{item.sproutedDate?` on ${formatDate(item.sproutedDate)}`:""}; {item.transplantedCount??0} transplanted{item.transplantedDate?` on ${formatDate(item.transplantedDate)}`:""}. Success: {item.sownCount>0?`${((item.sproutedCount||0)/item.sownCount*100).toFixed(1)}%`:"Not recorded"}</p>}
       {item.outcomeNotes&&(''')
# seed inventory
for key,label,typ in [('inventoryYear','Inventory year','number'),('germinationRate','Germination rate (%)','number'),('buyMore','Buy more','checkbox')]:
 schema='Boolean,default:false' if typ=='checkbox' else 'Number,min:0,max:100,default:null' if key=='germinationRate' else 'Number,min:0,default:null'
 edit('backend/models/seeds/seedCollectionModel.js','\tseed:{',f'\t{key}:{{type:{schema}}},\n\tseed:{{')
 edit('backend/controllers/seeds/seedCollectionController.js','const cleanCollectionData=data=>({',f'const cleanCollectionData=data=>({{\n {key}:{"data."+key+"===true" if typ=="checkbox" else "cleanNumber(data."+key+")"},')
 edit('src/pages/forms/seeds/SeedCollectionForm.jsx','const emptyForm={',f'const emptyForm={{{key}:{"false" if typ=="checkbox" else chr(34)+chr(34)},')
 edit('src/pages/forms/seeds/SeedCollectionForm.jsx','\t\t\t\tseed:getId(initialCollection.seed),',f'                {key}:initialCollection.{key}??{"false" if typ=="checkbox" else chr(34)+chr(34)},\n\t\t\t\tseed:getId(initialCollection.seed),')
 control=f'<Form.Check label="Buy more" name="{key}" checked={{form.{key}}} onChange={{handleChange}}/>' if typ=='checkbox' else f'<Form.Label>{label}</Form.Label><Form.Control type="number" min="0" {"max=\"100\" step=\"any\"" if key=="germinationRate" else ""} name="{key}" value={{form.{key}}} onChange={{handleChange}}/>'
 edit('src/pages/forms/seeds/SeedCollectionForm.jsx','<Row className="g-3">',f'<Row className="g-3">\n<Col md={{4}}><Form.Group controlId="collection-{key}">{control}</Form.Group></Col>')
edit('src/pages/forms/seeds/SeedCollectionForm.jsx','const {name,value}=e.target;\n\t\tsetForm(prev=>({...prev,[name]:value}));','const {name,value,type,checked}=e.target;\n\t\tsetForm(prev=>({...prev,[name]:type==="checkbox"?checked:value}));')
# harvest store valuation with explicit count/unit (no ambiguous mass conversion)
for key,label,typ in [('harvestQuantity','Harvested quantity','number'),('quantityUnit','Quantity unit (each, bunch, lb, etc.)','text'),('storeUnitValue','Store value per quantity unit','number'),('currency','Currency','text')]:
 schema='Number,min:0,default:0' if typ=='number' else 'String,trim:true,default:""'
 edit('backend/models/harvest/harvestModel.js','harvestDate:{',f'{key}:{{type:{schema}}},\nharvestDate:{{')
 edit('backend/controllers/harvest/harvestController.js','const harvest=new Harvest({',f'const harvest=new Harvest({{\n{key}:req.body.{key},')
 edit('backend/controllers/harvest/harvestController.js','const updated=await harvest.save();',f'if(req.body.{key}!==undefined)harvest.{key}=req.body.{key};\nconst updated=await harvest.save();')
 edit('src/pages/harvest/HarvestPage.jsx','const defaultHarvestForm={',f'const defaultHarvestForm={{{key}:"",')
 edit('src/pages/harvest/HarvestPage.jsx','   planting:getObjectId(item.planting),',f'   {key}:item.{key}??"",\n   planting:getObjectId(item.planting),')
 edit('src/pages/harvest/HarvestPage.jsx','    planting:formData.planting,',f'    {key}:{"numberOrZero(formData."+key+")" if typ=="number" else "formData."+key},\n    planting:formData.planting,')
 edit('src/pages/harvest/HarvestPage.jsx','      <WeightInputs title="Harvest Amount"',f'      <Col md={{6}}><Form.Group controlId="harvest-{key}"><Form.Label>{label}</Form.Label><Form.Control type="{typ}" {"min=\"0\" step=\"any\"" if typ=="number" else ""} name="{key}" value={{formData.{key}}} onChange={{onChange}}/></Form.Group></Col>\n      <WeightInputs title="Harvest Amount"')
edit('src/pages/harvest/HarvestPage.jsx','<span><strong>Days Since Last:</strong>','<span><strong>Store value:</strong> {((item.harvestQuantity||0)*(item.storeUnitValue||0)).toFixed(2)} {item.currency} ({item.harvestQuantity||0} {item.quantityUnit} × {item.storeUnitValue||0})</span>\n        <span><strong>Days Since Last:</strong>')
# soil amendment records in fertilizer applications
for key,label,typ in [('plantName','Plant','text'),('location','Location','text'),('problem','Soil problem','textarea'),('applicationDate','Treatment date','date'),('treatment','Treatment / dosage','textarea'),('results','Results','textarea')]:
 schema='Date,default:null' if typ=='date' else 'String,trim:true,default:""'
 edit('backend/models/fertilizers/fertilizerApplicationModel.js','\tname:{',f'\t{key}:{{type:{schema}}},\n\tname:{{')
 edit('backend/controllers/fertilizers/fertilizerApplicationController.js','const application=new FertilizerApplication({',f'const application=new FertilizerApplication({{\n{key}:req.body.{key}||{"null" if typ=="date" else chr(34)+chr(34)},')
 edit('backend/controllers/fertilizers/fertilizerApplicationController.js','const updated=await application.save();',f'if(req.body.{key}!==undefined)application.{key}=req.body.{key}||{"null" if typ=="date" else chr(34)+chr(34)};\nconst updated=await application.save();')
 edit('src/pages/fertilizers/FertilizerApplicationsPage.jsx','const fields=[',f'const fields=[\n {{name:"{key}",label:"{label}",type:"{typ}",md:6}},')
edit('backend/models/fertilizers/fertilizerApplicationModel.js',"ref:'Fertilizer',required:true","ref:'Fertilizer',default:null")
edit('backend/controllers/fertilizers/fertilizerApplicationController.js','if(!fertilizer){','if(!fertilizer&&!req.body.treatment){')
edit('backend/controllers/fertilizers/fertilizerApplicationController.js','fertilizer is required','A fertilizer or soil treatment is required')
edit('backend/controllers/fertilizers/fertilizerApplicationController.js','fertilizer,\nname,','fertilizer:fertilizer||null,\nname,')
edit('backend/controllers/fertilizers/fertilizerApplicationController.js','application.fertilizer=fertilizer;','application.fertilizer=fertilizer||null;')
edit('src/pages/fertilizers/FertilizerApplicationsPage.jsx','optionsKey:"fertilizers",required:true','optionsKey:"fertilizers"')
edit('src/pages/fertilizers/FertilizerApplicationsPage.jsx','title="Fertilizer Applications"','title="Fertilizer & Soil Amendments"')
edit('src/pages/fertilizers/FertilizerApplicationsPage.jsx',' {key:"method",label:"Method"},',' {key:"method",label:"Method"},\n {key:"applicationDate",label:"Date"},\n {key:"plantName",label:"Plant"},\n {key:"location",label:"Location"},\n {key:"problem",label:"Problem"},\n {key:"treatment",label:"Treatment"},\n {key:"results",label:"Results"},')
