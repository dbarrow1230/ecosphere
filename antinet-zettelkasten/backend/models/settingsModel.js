// backend/models/settingsModel.js
import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  appName: { type: String, default: "Antinet Zettelkasten", trim: true },
  theme: { type: String, default: "default", trim: true },
  language: { type: String, default: "en", trim: true },
  timezone: { type: String, default: "", trim: true },
  dateFormat: { type: String, default: "MM/DD/YYYY", trim: true },
  timeFormat: { type: String, default: "12h", trim: true },

  defaultProjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", default: null },
  defaultRecordType: { type: String, enum: ["FLT", "SRC", "ENT", "ZTL", "LNK", "STR", "OUT"], default: "FLT" },
  defaultSubtypeId: { type: mongoose.Schema.Types.ObjectId, ref: "RecordSubtype", default: null },

  defaultView: { type: String, enum: ["dashboard", "inbox", "zettels", "sources", "entities", "structure", "graph"], default: "dashboard" },
  recordsPerPage: { type: Number, default: 10 },
  reviewIntervalDays: { type: Number, default: 14, min: 7, max: 14 },

  showArchived: { type: Boolean, default: false },
  enableNotifications: { type: Boolean, default: true },
  enableAutoSave: { type: Boolean, default: true },
  enableGraph: { type: Boolean, default: true },
  defaultGraphDepth: { type: Number, default: 1, min: 1, max: 3 },
}, { timestamps: true, collection: "settings" });

settingsSchema.index({ userId: 1 }, { unique: true });

const Settings = mongoose.model("Settings", settingsSchema);

export default Settings;
