import jwt from "jsonwebtoken";
import { usersTable } from "../models/schema.js";
import { db } from "../utils/connectDB.js";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";

import dotenv from "dotenv";
dotenv.config({path:"../env"})


const register = async (req, res) => {
    const {name, email, password, role} = req.body;
    if(!name || !email || !password || !role){
        return res.status(500).json({status:false, message:"All credentials are required"})
    }
    if(password.length < 6){
        return res.status(501).json({status:false, message:"Password length is too short"})
    }
    const user = await db.select().from(usersTable).where(eq(usersTable.email, email));
    if(user.length > 0){
        return res.status(500).json({status:false, message:"User already exists"})
    }
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = await db.insert(usersTable).values({
            name,
            email,
            password: hashedPassword,
            role
        })
        if(newUser){
            return res.status(200).json({status:true, message:"User created successfully and login to continue"})
        }
    }catch (error) {
        return res.status(401).json({status:false, message:"Error creating user"})
    }  
}

const login = async(req, res) => {
    const {email, password} = req.body;
    const users = await db.select().from(usersTable).where(eq(usersTable.email, email));
    const user = users[0];
    if(!email || !password){
        return res.status(500).json({status:false, messsage:"Email or password is missing"})    
    }
    if(!user){
        return res.status(400).json({status:false, message:"User does not exists, first Register yourself to continue"})
    }
    try {
        const isValid = await bcrypt.compare(password, user.password);
        if(!isValid){
            return res.status(500).json({status:false, message:"Invalid credentials"})
        }
        const refreshtoken = jwt.sign({id: user.id}, process.env.JWT_SECRET, {expiresIn:process.env.JWT_EXPIRY});
        res.cookie("refreshtoken", refreshtoken, { httpOnly: true })
        await db.update(usersTable).set({refreshtoken}).where(eq(usersTable.id, user.id));
    
        return res.status(200).json({status:true, message:"User logged in successfully", refreshtoken})
    } catch (error) {
        console.log("Error logging in user: ", error);
        return res.status(500).json({status:false, message:"Error logging in user"})
    }
}

const logout = async(req, res) => {
    const token = req.cookies.refreshtoken;
    if(!token){
        return res.status(401).json({status:false, message:"Unauthorized request"})
    }
    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await db.select().from(usersTable).where(eq(usersTable.id, decoded.id));
        if(!user){
            return res.status(401).json({status:false, message:"user not found"})
        }
        await db.update(usersTable).set({refreshtoken: null}).where(eq(usersTable.id, user.id));
        res.clearCookie("refreshtoken");

        return res.status(200).json({status:true, message:"User logged out successfully"})
    }catch (error) {
        console.log("Error logging out user: ", error);
        return res.status(500).json({status:false, message:"Error logging out user"})
    }
}

export {register, login, logout}