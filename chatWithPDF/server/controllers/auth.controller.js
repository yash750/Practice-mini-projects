import dotenv from "dotenv";
dotenv.config({ path: "../.env" });
import bcrypt from "bcrypt";
import crypto from "crypto";
import User from "../models/User.model.js";
import jwt from "jsonwebtoken";
import { sendMailForVerification } from "../services/mailService.js";
const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if(!name || !email || !password){
            return res.status(400).json({status: false, message: "All fields are required" });
        }
        if(password.length < 6){
            return res.status(400).json({ message: "Password must be at least 6 characters long" });
        }
        
        const user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationToken = crypto.randomBytes(20).toString("hex");
        const verificationTokenExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            verificationToken,
            verificationTokenExpiry
        })

        await newUser.save();
        if(!newUser){
            return res.status(400).json({ status: false, message: "User registration failed" });
        }

        const verificationLink = `http://localhost:5000/api/auth/verify/${verificationToken}`;
        try{
            await sendMailForVerification(email, verificationLink);
            res.status(201).json({ 
                status: true,
                message: "User registered successfully",
                user: {
                    id: newUser._id,
                    name: newUser.name,
                    email: newUser.email,
                    isVerified: newUser.isVerified
                },
                Verification_Link: verificationLink 
            });

        }catch(err){
            console.log("Error sending verification email:", err);
            throw err;
        }

    } catch (error) {
        console.log("Error registering user:", error);
        return res.status(500).json({ status: false, message: error.message });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if(!email || !password){
            return res.status(400).json({ message: "All fields are required" });
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }
        if(!user.isVerified){
            return res.status(401).json({status:false, message:"Please verify your email to login"});
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        const accessToken = jwt.sign({ id: user._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRY });
        const refreshToken = jwt.sign({ id: user._id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRY });
        
        user.refreshToken = refreshToken;

        // send the token in a cookie or as a response
        res.cookie("accessToken", accessToken, { httpOnly: true });
        res.cookie("refreshToken", refreshToken, { httpOnly: true });

        await user.save();
        return res.status(200).json({ status: true, message: "User logged in successfully", accessToken });
    } catch (error) {
        console.log("Error logging in user:", error);
        return res.status(500).json({ message: error.message });
    }
};

// add verify method for verifying user
const verify = async (req, res) => {
    try {
        const { token } = req.params;
        const user = await User.findOne({ verificationToken: token, verificationTokenExpiry: { $gt: Date.now() } });
        if (!user) {
            return res.status(404).json({ status: false, message: "Invalid or expired verification token" });
        }
        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpiry = undefined;
        await user.save();

        return res.status(200).json({ status: true, message: "User verified successfully" });

    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
};
//add logout method for logging out user
const logout = async (req, res) => {
    const token = req.cookies.refreshToken;
    if(!token){
        console.log("No token found in cookie for logging out user");
        return res.status(401).json({ message: "Unauthorised acess" });
    }
    try {
        const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findOne({ _id: decoded.id  });
        if(!user){
            return res.status(404).json({ status: false, message: "User not found" });
        }
        user.refreshToken = null;

        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");

        await user.save();
        return res.status(200).json({ status: true, message: "User logged out successfully" });
    } catch (error) {
        console.log("Error logging out user:", error);
        return res.status(500).json({ message: error.message });
    }
};

const getProfile = async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.user.id }).select("-password");
        if(!user){
            return res.status(404).json({ status: false, message: "User not found" });
        }
        return res.status(200).json({
            status: true,
            message: "User profile fetched successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isVerified: user.isVerified
            } 
        });
    } catch (error) {
        console.log("Error fetching user profile:", error);
        return res.status(500).json({ status: false, message: error.message });
    }
};

export { register, login, verify, logout, getProfile };