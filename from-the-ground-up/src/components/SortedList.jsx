import {Fragment} from "react";
import {sortItems} from "../utils/sortItems.js";

export default function SortedList({
 items=[],
 getKey=item=>item._id||item.id||item.value||item.name,
 getLabel=item=>item.label||item.name,
 renderItem,
 className="",
 as:Component="div",
 wrapItems=true,
 sort=true,
 customSort,
 children,
 ...rest
}){

 const sortedItems=sort
  ?customSort
   ?[...items].sort(customSort)
   :sortItems(items,getLabel)
  :items;

 return(
  <Component className={className} {...rest}>
   {sortedItems.length===0 ? children : null}
   {sortedItems.map((item,index)=>{
    const content=renderItem?renderItem(item,index):getLabel(item);
    const key=getKey(item)||index;

    return wrapItems ? (
     <div key={key}>
      {content}
     </div>
    ) : (
     <Fragment key={key}>
      {content}
     </Fragment>
    );
   })}
  </Component>
 );
}
