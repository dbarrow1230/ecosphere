// backend/socket/employeeAlertSocket.js
const onlineUsers=new Map();

export function registerEmployeeAlertSocket(io){
 io.on("connection",socket=>{
  socket.on("registerUser",userId=>{
   if(!userId)return;
   const key=String(userId);
   socket.userId=key;
   onlineUsers.set(key,socket.id);
   socket.join(key);
  });

  socket.on("employeeAlerts:join",userId=>{
   if(!userId)return;
   socket.join(String(userId));
  });

  socket.on("disconnect",()=>{
   if(socket.userId){
    onlineUsers.delete(String(socket.userId));
   }
  });
 });
}

export function emitEmployeeAlert(io,{userIds=[],alert}){
 const payload={
  id:String(alert._id),
  title:alert.title,
  message:alert.message,
  severity:alert.severity,
  sentAt:alert.sentAt
 };

 if(userIds.length){
  for(const userId of userIds){
   io.to(String(userId)).emit("employeeAlert",payload);
  }
  return;
 }

 io.emit("employeeAlert",payload);
}
