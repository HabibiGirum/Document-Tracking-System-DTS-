import mongoose from 'mongoose';


const RequestSchema = new mongoose.Schema(
  {
    from: {
      type: String,
      ref: "User",
      required: [true, "Please provide department"],
    },
    by: {
      type: String,
      ref: "User",
      required: [true, "Please provide name"],
    },
    DocumentType: {
      type: String,
      required: [true, "Please provide document type"],
      enum: ["Leave", "Recruitment", "Promotion"],
      // default:'none'
    },
    purpose: {
      type: String,
      required: [true, "Please provide purpose"],
      maxlength: 100,
    },
    To: {
      type: String,
      required: [true, "Please select you want to send"],
      enum: ["","Department", "College", "HR", "vice president"],
      default: "none",
    },
    filename: {
      type: String,
      required: [true, "Please Provide the filename"],
    },
    
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: [true, "Please provide user"],
    },
  },
  { timestamps: true }
);

export default mongoose.model('Request', RequestSchema);