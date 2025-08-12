import mongoose from "mongoose";

const collectionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    collections: {
        type: [String],
        required: true
    }


}, { timestamps: true });

const Collection = mongoose.model("Collection", collectionSchema);
export default Collection;