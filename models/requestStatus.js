import mongoose from "mongoose";

const RequestSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ["Department", "College", "HR", "vice president"],
      default: "Department",
    },
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: [true, "Please provide user"],
    },
    purpose: {
      type: String,
      required: [true, "please provide purpose"],
    },
  },
  { timestamps: true }
);

export default mongoose.model("Status",RequestSchema)
