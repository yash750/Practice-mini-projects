import { db } from '../utils/connectDB.js';
import { usersTable, jobsTable, applicationsTable } from '../models/schema.js';

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

const listAllJobs = async(req, res) => {
    try{
        const activeJobs = await db.select().from(jobsTable).where(eq(jobsTable.isActive, true));
        const unActiveJobs = await db.select().from(jobsTable).where(eq(jobsTable.isActive, false));
        return res.status(200).json({status:true, message:"Jobs fetched successfully", activeJobs, unActiveJobs})
    }catch (error) {
        console.log("Error fetching jobs: ", error);
        return res.status(500).json({status:false, message:"Error fetching jobs"})
    }
}

const listAllApplications = async(req, res) => {
    try{
        const applications = await db.select().from(applicationsTable);
        return res.status(200).json({status:true, message:"Applications fetched successfully", applications})
    }catch (error) {
        console.log("Error fetching applications: ", error);
        return res.status(500).json({status:false, message:"Error fetching applications"})
    }
}

const deleteUser = async(req, res) => {
    const userId = req.params.id;
    if(!userId){
        return res.status(500).json({status:false, message:"User id is missing"})
    }
    try {
        const deletedUser = await db.delete(usersTable).where(eq(usersTable.id, userId));
        if(deletedUser){
            return res.status(200).json({status:true, message:"User deleted successfully"})
        }
    } catch (error) {
        console.log("Error deleting user: ", error);
        return res.status(500).json({status:false, message:"Error deleting user"})
    }
}

const deleteJob = async(req, res) => {
    const jobId = req.params.id;
    if(!jobId){
        return res.status(500).json({status:false, message:"Job id is missing"})
    }
    try {
        const jobs = await db.select().from(jobsTable).where(eq(jobsTable.id, jobId));
        if(jobs.length === 0){
            return res.status(404).json({status:false, message:"Job not found"})
        }
        const deletedJob = await db.delete(jobsTable).where(eq(jobsTable.id, jobId));
        if(deletedJob){
            return res.status(200).json({status:true, message:"Job deleted successfully"})
        }
    } catch (error) {
        console.log("Error deleting job: ", error);
        return res.status(500).json({status:false, message:"Error deleting job"})
    }
}

const deleteApplication = async(req, res) => {
    const applicationId = req.params.id;
    if(!applicationId){
        return res.status(500).json({status:false, message:"Application id is missing"})
    }
    try {
        const applications = await db.select().from(applicationsTable).where(eq(applicationsTable.id, applicationId));
        if(applications.length === 0){
            return res.status(404).json({status:false, message:"Application not found"})
        }
        const deletedApplication = await db.delete(applicationsTable).where(eq(applicationsTable.id, applicationId));
        if(deletedApplication){
            return res.status(200).json({status:true, message:"Application deleted successfully"})
        }
    } catch (error) {
        console.log("Error deleting application: ", error);
        return res.status(500).json({status:false, message:"Error deleting application"})
    }
}


export {getUsers, listAllJobs, listAllApplications, deleteUser, deleteJob, deleteApplication}


    
