const key="recipe-management-costing-updated";
export function notifyRecipeCostingUpdated(recipe,business){
 const detail={recipe,business,updatedAt:Date.now()};
 try{localStorage.setItem(key,JSON.stringify(detail));}catch{}
 window.dispatchEvent(new CustomEvent(key,{detail}));
}
export function onRecipeCostingUpdated(callback){
 const local=()=>callback();
 const remote=event=>{if(event.key===key&&event.newValue)callback();};
 window.addEventListener(key,local);
 window.addEventListener("storage",remote);
 return()=>{window.removeEventListener(key,local);window.removeEventListener("storage",remote);};
}
