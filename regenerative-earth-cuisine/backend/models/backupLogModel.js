import mongoose from "mongoose";

const backupLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, immutable: true, index: true },
  backupId: { type: String, required: true, immutable: true, trim: true },
  backupType: {
    type: String,
    enum: ["full", "notes", "favorites", "archived", "tags"],
    required: true,
    immutable: true,
    trim: true,
  },
  fileName: { type: String, default: "", trim: true },
  filePath: { type: String, default: "", trim: true },
  backupDirectory: { type: String, default: "", trim: true },
  recordCount: { type: Number, default: 0, min: 0 },
  status: { type: String, enum: ["started", "completed", "failed"], default: "started", index: true },
  message: { type: String, default: "", trim: true },
  completedAt: { type: Date, default: null },
  isAutomatic: { type: Boolean, default: false, index: true },
  scheduleId: { type: mongoose.Schema.Types.ObjectId, ref: "BackupSchedule", default: null, index: true },
}, { timestamps: true, collection: "backup_logs" });

backupLogSchema.index({ userId: 1, backupId: 1 }, { unique: true });
backupLogSchema.index({ userId: 1, backupType: 1, createdAt: -1 });
backupLogSchema.index({ userId: 1, status: 1, createdAt: -1 });

const BackupLog = mongoose.model("BackupLog", backupLogSchema);

export default BackupLog;
