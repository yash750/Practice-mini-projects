import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user",
    },
    isVerified: {
        type: Boolean,
        default: false,
    },

    refreshToken: String,
    verificationToken: String,
    resetPasswordToken: String,
    resetPasswordTokenExpiry: Date,
    verificationTokenExpiry: Date,

} , { timestamps: true });

const User = mongoose.model("User", userSchema);
export default User;
