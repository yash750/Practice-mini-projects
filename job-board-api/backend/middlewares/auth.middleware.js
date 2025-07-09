import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { db } from "../../utils/connectDB.js";
import { usersTable } from "../../models/schema.js";
import { eq } from "drizzle-orm";

dotenv.config({path:"../env"});

const authenticate = async (req, res, next) => {
    try{
        const token = req.headers.authorization?.split(' ')[1];
        if(!token){
            return res.status(401).json({status:false, message:"Unauthorized request"})
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    }catch(error){
        console.log("Error authenticating user: ", error);
        return res.status(500).json({status:false, message:"Error authenticating user"})
    }
}

const authorize = (role) => async(req, res, next) => {
    const users = await db.select().from(usersTable).where(eq(usersTable.id, req.user.id));
    const user = users[0];
    if(role !== user.role){
        return res.status(401).json({status:false, message:"Access denied"})
    }
    next();
}   

export {authenticate, authorize}