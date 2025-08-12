import mongoose from "mongoose";

const uploadedFileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    filename: {
        type: String,
        required: true
    },
    originalName: {
        type: String,
        required: true
    },
    fileType: {
        type: String,
        enum: ['pdf', 'video'],
        required: true
    },
    filePath: {
        type: String,
        required: true
    },
    fileSize: {
        type: Number,
        required: true
    },
    collectionName: {
        type: String,
        required: true
    },
    isIndexed: {
        type: Boolean,
        default: false
    },
    fileHash: {
        type: String,
        required: true,
        unique: true
    }
}, { timestamps: true });

// Compound index to prevent duplicate files per user
uploadedFileSchema.index({ userId: 1, fileHash: 1 }, { unique: true });

const UploadedFile = mongoose.model("UploadedFile", uploadedFileSchema);
export default UploadedFile;