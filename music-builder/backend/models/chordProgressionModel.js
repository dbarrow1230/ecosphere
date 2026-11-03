import mongoose from "mongoose";

const progressionStepSchema = new mongoose.Schema(
  {
    chord: { type: String, trim: true, default: "" },
    numeral: { type: String, trim: true, default: "" },
    playStyle: { type: String, enum: ["chord", "pattern"], default: "chord" },
    noteValue: {
      type: String,
      enum: [
        "whole",
        "half",
        "quarter",
        "eighth",
        "sixteenth",
        "thirty-second",
        "sixty-fourth",
        "one-twenty-eighth",
      ],
      default: "quarter",
    },
    pattern: {
      type: String,
      enum: ["up", "down", "up-down", "alberti"],
      default: "up",
    },
    inversion: {
      type: String,
      enum: ["root", "first", "second", "third"],
      default: "root",
    },
    rightHandNotes: { type: [Number], default: [] },
    leftHandNotes: { type: [Number], default: [] },
    rightStyle: { type: String, enum: ["chord", "pattern"], default: "chord" },
    leftStyle: { type: String, enum: ["chord", "pattern"], default: "chord" },
    rightPattern: {
      type: String,
      enum: ["up", "down", "up-down", "alberti", "random"],
      default: "up",
    },
    leftPattern: {
      type: String,
      enum: ["up", "down", "up-down", "alberti", "random"],
      default: "up",
    },
    rightNoteValue: {
      type: String,
      enum: [
        "whole",
        "half",
        "quarter",
        "eighth",
        "sixteenth",
        "thirty-second",
        "sixty-fourth",
        "one-twenty-eighth",
      ],
      default: "quarter",
    },
    leftNoteValue: {
      type: String,
      enum: [
        "whole",
        "half",
        "quarter",
        "eighth",
        "sixteenth",
        "thirty-second",
        "sixty-fourth",
        "one-twenty-eighth",
      ],
      default: "half",
    },
    rightInversion: { type: Number, min: 0, default: 0 },
    leftInversion: { type: Number, min: 0, default: 0 },
    rightRest: { type: Boolean, default: false },
    leftRest: { type: Boolean, default: false },
  },
  { _id: false },
);

const chordProgressionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: { type: String, trim: true, default: "" },
    key: { type: String, trim: true, default: "" },
    mode: { type: String, trim: true, default: "" },
    chords: { type: [String], default: [] },
    romanNumerals: { type: [String], default: [] },
    steps: { type: [progressionStepSchema], default: [] },
    timeSignature: { type: String, trim: true, default: "" },
    tempo: { type: Number, default: null },
    notes: { type: String, trim: true, default: "" },
    projectIds: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "MusicProject" }],
      default: [],
    },
    relatedChordIds: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "ChordIdea" }],
      default: [],
    },
    relatedProgressionIds: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "ChordProgression" }],
      default: [],
    },
    tags: { type: [String], default: [] },
  },
  { timestamps: true, collection: "chord_progressions" },
);

chordProgressionSchema.index({ userId: 1 });
chordProgressionSchema.index({ projectIds: 1 });
chordProgressionSchema.index({ key: 1 });

const ChordProgression =
  mongoose.models.ChordProgression ||
  mongoose.model("ChordProgression", chordProgressionSchema);
export default ChordProgression;
