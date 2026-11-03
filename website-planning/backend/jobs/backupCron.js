import cron from "node-cron";
import BackupSchedule from "../models/backupScheduleModel.js";
import {deleteExpiredAutomaticBackups,runBackupForUser} from "../controllers/backupLogController.js";
import {calculateNextBackupRun} from "../utils/backupScheduleUtils.js";

export function startBackupCron(){
 const task=cron.schedule("* * * * *",async()=>{
  try{
   const staleBefore=new Date(Date.now()-60*60*1000);
   await BackupSchedule.updateMany(
    {isRunning:true,updatedAt:{$lte:staleBefore}},
    {$set:{isRunning:false}}
   );

   while(true){
    const now=new Date();
    const schedule=await BackupSchedule.findOneAndUpdate(
     {status:"active",isRunning:false,nextRunAt:{$lte:now}},
     {$set:{isRunning:true}},
     {returnDocument:"after",sort:{nextRunAt:1}}
    );
    if(!schedule)break;

    try{
     await runBackupForUser({
      user:{userId:String(schedule.userId),objectId:schedule.userId},
      backupType:schedule.backupType,
      backupLocation:schedule.backupLocation,
      scheduleId:schedule._id,
      isAutomatic:true
     });
     await deleteExpiredAutomaticBackups({
      userId:schedule.userId,
      scheduleId:schedule._id,
      retentionDays:schedule.retentionDays
     });
     schedule.lastStatus="completed";
     schedule.lastMessage="Automatic backup completed";
    }catch(error){
     schedule.lastStatus="failed";
     schedule.lastMessage=error.message;
    }

    schedule.lastRunAt=new Date();
    schedule.nextRunAt=calculateNextBackupRun(schedule);
    schedule.isRunning=false;
    await schedule.save();
   }
  }catch(error){
   console.error("Automatic backup scheduler failed",error);
  }
 });

 return task;
}
