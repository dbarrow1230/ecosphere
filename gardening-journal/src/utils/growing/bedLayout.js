export function normalizeBedLayout(value){
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
