// backend/socket/reminderSocket.js
const onlineUsers=new Map();

export function registerReminderSocket(io){
 io.on("connection",socket=>{
  socket.on("registerUser",userId=>{
   if(!userId) return;
   const key=String(userId);
   socket.userId=key;
   const sockets=onlineUsers.get(key)||new Set();
   sockets.add(socket.id);
   onlineUsers.set(key,sockets);
   socket.join(key);
  });

  socket.on("disconnect",()=>{
   if(socket.userId){
    const key=String(socket.userId);
    const sockets=onlineUsers.get(key);
    sockets?.delete(socket.id);
    if(!sockets?.size)onlineUsers.delete(key);
   }
  });
 });
}

export function isUserOnline(userId){
 return Boolean(onlineUsers.get(String(userId))?.size);
}
