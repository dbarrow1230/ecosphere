from pathlib import Path
p=Path('backend/models/gardens/gardenSectionModel.js');s=p.read_text(encoding='utf-8');marker='const gardenSectionSchema=new Schema({'
addition='''const bedCellSchema=new Schema({
 row:{type:Number,min:0,required:true,validate:Number.isInteger},
 column:{type:Number,min:0,required:true,validate:Number.isInteger},
 label:{type:String,trim:true,required:true,maxLength:200},
 sourceType:{type:String,enum:["seed","plant","custom"],default:"custom"},
 sourceId:{type:String,default:""}
},{_id:false});

const bedLayoutSchema=new Schema({
 rows:{type:Number,min:1,max:20,default:4,validate:Number.isInteger},
 columns:{type:Number,min:1,max:20,default:8,validate:Number.isInteger},
 cellSize:{type:Number,min:.01,max:1000,default:1},
 unit:{type:String,enum:["ft","in","m","cm"],default:"ft"},
 cells:{type:[bedCellSchema],default:[]}
},{_id:false});
bedLayoutSchema.pre("validate",function(){
 const occupied=new Set();
 for(const cell of this.cells){
  if(cell.row>=this.rows||cell.column>=this.columns)this.invalidate("cells","Plant placement is outside the bed");
  const key=`${cell.row}:${cell.column}`;
  if(occupied.has(key))this.invalidate("cells","Only one placement is allowed in each cell");
  occupied.add(key);
 }
});

'''
assert marker in s;s=s.replace(marker,addition+marker+'\nbedLayout:{type:bedLayoutSchema,default:()=>({})},');p.write_text(s,encoding='utf-8')
p=Path('backend/controllers/gardens/gardenSectionController.js');s=p.read_text(encoding='utf-8').replace('const section=new GardenSection({','const section=new GardenSection({\nbedLayout:req.body.bedLayout,').replace('const updated=await section.save();','if(req.body.bedLayout!==undefined)section.bedLayout=req.body.bedLayout;\nconst updated=await section.save();');s=s.replace('return res.status(500).json({message:error.message});','return res.status(["ValidationError","CastError"].includes(error.name)?400:500).json({message:error.message});');p.write_text(s,encoding='utf-8')
Path('src/utils/growing/bedLayout.js').write_text('''export function normalizeBedLayout(value){
 return {rows:value?.rows||4,columns:value?.columns||8,cellSize:value?.cellSize||1,unit:value?.unit||"ft",cells:(value?.cells||[]).map(cell=>({row:cell.row,column:cell.column,label:cell.label,sourceType:cell.sourceType||"custom",sourceId:cell.sourceId||""}))};
}

export function placeBedItem(layout,item,row,column,from=null){
 if(!Number.isInteger(row)||!Number.isInteger(column)||row<0||column<0||row>=layout.rows||column>=layout.columns)throw new Error("Choose a cell inside the bed.");
 if(!item?.label?.trim())throw new Error("Choose a plant first.");
 const same=from?.row===row&&from?.column===column;
 if(same)return layout;
 if(layout.cells.some(cell=>cell.row===row&&cell.column===column))throw new Error("That cell is occupied. Move or remove its plant first.");
 const cells=layout.cells.filter(cell=>!from||cell.row!==from.row||cell.column!==from.column);
 return {...layout,cells:[...cells,{row,column,label:item.label.trim(),sourceType:item.sourceType||"custom",sourceId:item.sourceId||""}]};
}

export function resizeBedLayout(layout,rows,columns){
 if(!Number.isInteger(rows)||!Number.isInteger(columns)||rows<1||columns<1||rows>20||columns>20)throw new Error("Use between 1 and 20 rows and columns.");
 if(layout.cells.some(cell=>cell.row>=rows||cell.column>=columns))throw new Error("Move or remove plants outside the smaller grid before resizing.");
 return {...layout,rows,columns};
}
''',encoding='utf-8')
