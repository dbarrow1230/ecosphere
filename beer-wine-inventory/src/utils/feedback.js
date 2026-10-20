export function notify(message,variant="danger"){
 if(message)window.dispatchEvent(new CustomEvent("app:notice",{detail:{message,variant}}));
}
export function confirmAction(message){
 return new Promise(resolve=>window.dispatchEvent(new CustomEvent("app:confirm",{detail:{message,resolve}})));
}
