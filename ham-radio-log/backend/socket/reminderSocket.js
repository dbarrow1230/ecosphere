// backend/socket/reminderSocket.js
const onlineUsers=new Map();

export function registerReminderSocket(io){
 io.on("connection",socket=>{
  socket.on("registerUser",userId=>{
   if(!userId) return;
   const key=String(userId);
   socket.userId=key;
   onlineUsers.set(key,socket.id);
   socket.join(key);
  });

  socket.on("disconnect",()=>{
   if(socket.userId){
    onlineUsers.delete(String(socket.userId));
   }
  });
 });
}

export function isUserOnline(userId){
 return onlineUsers.has(String(userId));
}