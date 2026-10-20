from pathlib import Path
p=Path('src/pages/forms/planning/CompanionPlantingForm.jsx');s=p.read_text(encoding='utf-8')
s=s.replace('const rows=record?.companions?.length?record.companions:', 'const rows=record?.companions?.length?record.companions.filter(row=>!row.inherited):')
s=s.replace(':[emptyCompanion()];',':record?.libraryId?[]:[emptyCompanion()];')
s=s.replace('({record,onSave,onCancel,saving,error})','({record,library=[],onSave,onCancel,saving,error})')
s=s.replace(' const [name,setName]=useState(record?.name||"");',''' const [name,setName]=useState(record?.name||"");
 const [libraryKey,setLibraryKey]=useState(record?.libraryKey||(record?.libraryId?`${record.libraryType}:${record.libraryId}`:""));
 const catalogEntry=library.find(item=>item.libraryKey===libraryKey);
 const inherited=catalogEntry?.companions||[];
 const selectPlant=key=>{
  setLibraryKey(key);
  const entry=library.find(item=>item.libraryKey===key);
  setName(entry?.name||"");
  setCompanions(entry?.companions.length?[]:[emptyCompanion()]);
 };''')
s=s.replace('onSave({name,notes,companions:', 'onSave({name,notes,...(catalogEntry?{libraryType:catalogEntry.libraryType,libraryId:catalogEntry.libraryId}:{}),companions:')
old='<Form.Control value={name} onChange={event=>setName(event.target.value)} placeholder="For example, Tomato" required disabled={saving}/>'
new='''<Form.Select value={libraryKey} onChange={event=>selectPlant(event.target.value)} required={!record?._id} disabled={saving||!!record?._id}><option value="">{record?._id&&!record.libraryId?name:"Select a plant or seed"}</option>{["plant","seed"].map(type=><optgroup key={type} label={type==="plant"?"Plant Catalog":"Seed Catalog"}>{library.filter(item=>item.libraryType===type).map(item=><option key={item.libraryKey} value={item.libraryKey}>{item.name}</option>)}</optgroup>)}</Form.Select>'''
assert old in s;s=s.replace(old,new)
s=s.replace('  <h3 className="h5">Companion plants</h3>','''  {!!inherited.length&&<Card className="mb-3"><Card.Body><h3 className="h5">Existing library companions</h3><p>These relationships come from the seed or plant catalog. Update them in the catalog.</p><ul>{inherited.map(row=><li key={`${row.name}-${row.relationship}`}><strong>{row.name}</strong> · {row.relationship} · {row.source}</li>)}</ul></Card.Body></Card>}
  <h3 className="h5">Additional companions</h3>''')
s=s.replace('<Form.Control value={row.name}', '<Form.Control list="companion-library-names" value={row.name}')
s=s.replace('  <Button type="button" variant="outline-primary" className="mt-3"','  <datalist id="companion-library-names">{[...new Set(library.map(item=>item.name))].map(name=><option key={name} value={name}/>)}</datalist>\n  <Button type="button" variant="outline-primary" className="mt-3"')
p.write_text(s,encoding='utf-8')
p=Path('src/pages/planning/CompanionPlantingPage.jsx');s=p.read_text(encoding='utf-8');s=s.replace(' const [rows,setRows]=useState([]);',' const [rows,setRows]=useState([]);\n const [library,setLibrary]=useState([]);')
a=s.index('  try{const response=await fetch(endpoint)');b=s.index('\n  catch(error)',a)
s=s[:a]+'''  try{
   const [response,libraryResponse]=await Promise.all([fetch(endpoint),fetch(`${endpoint}/library`)]);
   const [data,catalog]=await Promise.all([response.json(),libraryResponse.json()]);
   if(!response.ok)throw new Error(data.message||"Unable to load companion planting");
   if(!libraryResponse.ok)throw new Error(catalog.message||"Unable to load plant and seed libraries");
   setRows(data);setLibrary(catalog);
  }''' +s[b:]
s=s.replace('editing?`${endpoint}/${editing._id}`:endpoint','editing?._id?`${endpoint}/${editing._id}`:endpoint').replace('method:editing?"PUT":"POST"','method:editing?._id?"PUT":"POST"')
s=s.replace('setRows(previous=>editing?previous.map(row=>row._id===data._id?data:row):[data,...previous]);','setRows(previous=>{const others=previous.filter(row=>data.libraryKey?row.libraryKey!==data.libraryKey:row._id!==data._id);return [data,...others].sort((a,b)=>a.name.localeCompare(b.name));});')
s=s.replace('<Card key={row._id}>','<Card key={row._id||row.libraryKey}>')
s=s.replace('<Button size="sm" variant="outline-danger" onClick={()=>remove(row)}>Delete</Button>','{row._id&&<Button size="sm" variant="outline-danger" onClick={()=>remove(row)}>Remove saved list</Button>}')
s=s.replace('setRows(previous=>previous.filter(row=>row._id!==record._id));setNotice("Plant companion list deleted.");','await load();setNotice("Saved additions removed. Existing library relationships remain available.");')
s=s.replace('Keep each plant with all of its companions. Record compatibility, attraction, repelling, sources, and observations for each companion.','Existing companions load from your seed and plant catalogs. Select a library plant to add further relationships and observations.')
s=s.replace('<td>{companion.source||"�"}</td>','<td>{companion.source||"Not listed"}{companion.inherited&&" (library)"}</td>').replace('<td>{companion.notes||"�"}</td>','<td>{companion.notes||"Not listed"}</td>')
s=s.replace('key={editing?._id||"new"} record={editing}','key={editing?._id||editing?.libraryKey||"new"} record={editing} library={library}')
s=s.replace('{editing?"Edit":"Add"} Plant Companions','{editing?._id?"Edit":"Add"} Plant Companions')
p.write_text(s,encoding='utf-8')
