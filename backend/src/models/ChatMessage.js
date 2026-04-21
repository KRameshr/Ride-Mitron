import mongoose from "mongoose";

const chatMessageSchema = new mongoose.Schema(
  {
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AGZSession",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    isSystemMessage: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

chatMessageSchema.index({ session: 1, createdAt: 1 });

export default mongoose.model("ChatMessage", chatMessageSchema);
