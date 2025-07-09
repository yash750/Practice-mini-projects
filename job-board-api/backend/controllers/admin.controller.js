import { db } from '../utils/connectDB.js';
import { usersTable } from '../models/schema.js';

// give separated users as : employers and users
const getUsers = async(req, res) => {
    
    try{
        const employers = await db.select({
            id: usersTable.id,
            name: usersTable.name,
            email: usersTable.email,
            role: usersTable.role
        }).from(usersTable).where(eq(usersTable.role, "employer"));
        const users = await db.select({
            id: usersTable.id,
            name: usersTable.name,
            email: usersTable.email,
            role: usersTable.role
        }).from(usersTable).where(eq(usersTable.role, "user"));

        return res.status(200).json({status:true, message:"Users fetched successfully", employers, users})
    }catch (error) {
        console.log("Error fetching users: ", error);
        return res.status(500).json({status:false, message:"Error fetching users"})
    }
}

export {getUsers}


    
