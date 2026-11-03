import {sortItems} from "../utils/sortItems.js";

export default function SortedList({
 items=[],
 getKey=item=>item._id||item.id||item.value||item.name,
 getLabel=item=>item.label||item.name,
 renderItem,
 className=""
}){

 const sortedItems=sortItems(items,getLabel);

 return(
  <div className={className}>
   {sortedItems.map(item=>(
    <div key={getKey(item)}>
     {renderItem?renderItem(item):getLabel(item)}
    </div>
   ))}
  </div>
 );
}