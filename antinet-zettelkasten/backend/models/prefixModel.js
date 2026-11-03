import mongoose from "mongoose";

const prefixSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId,  ref: "User",    required: true,  index: true, },
    name: {type: String, required: true, trim: true,},
    code: {type: String, required: true, trim: true,  uppercase: true,},
    recordType: {type: String, required: true,   enum: ["PRJ", "FLT", "SRC", "ENT", "ZTL", "LNK", "STR", "OUT"],  uppercase: true, trim: true, },
    description: {type: String, default: "",   trim: true,},
    isActive: { type: Boolean, default: true,  },
  }, { timestamps: true,collection: "prefixes"}
);

prefixSchema.index({ userId: 1, code: 1 }, { unique: true });
prefixSchema.index({ userId: 1, recordType: 1 });

const Prefix = mongoose.model("Prefix", prefixSchema);

export default Prefix;