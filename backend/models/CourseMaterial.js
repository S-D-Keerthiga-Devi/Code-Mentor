import mongoose from "mongoose";

const courseMaterialSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  filename: {
    type: String,
    required: true,
  },
  filePath: {
    type: String,
    required: true,
  },
  extractedText: {
    type: String,
    required: false,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

const CourseMaterial = mongoose.model("CourseMaterial", courseMaterialSchema);

export default CourseMaterial;
