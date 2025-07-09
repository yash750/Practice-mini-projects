import { eq } from "drizzle-orm";
import { db } from "../utils/connectDB.js";
import { applicationsTable, jobsTable } from "../models/schema.js";
const applyForJob = async(req, res) => {
    const jobId = req.params.id;
    if(!jobId){
        return res.status(500).json({status:false, message:"Job id is missing"})
    }
    const user = req.user
    if(!user){
        return res.status(401).json({status:false, message:"Unauthorized request"})
    }
    try {
        const jobs = await db.select().from(jobsTable).where(eq(jobsTable.id, jobId));
        if(jobs.length === 0){
            return res.status(404).json({status:false, message:"Job not found"})
        }
        const newApplication = await db.insert(applicationsTable).values({
            jobId,
            seekerId: user.id
        })
        if(newApplication){
            return res.status(200).json({status:true, message:"Application submitted successfully"})
        }
    } catch (error) {
        console.log("Error applying for job: ", error);
        return res.status(500).json({status:false, message:"Error applying for job"})
    }
}

const viewMyApplications = async(req, res) => {
    const user = req.user;
    if(!user){
        return res.status(401).json({status:false, message:"Unauthorized request"})
    }
    try{
        const applications = await db.select().from(applicationsTable).where(eq(applicationsTable.seekerId, user.id));
        return res.status(200).json({status:true, message:"Applications fetched successfully", applications})
    }catch (error) {
        console.log("Error fetching applications: ", error);
        return res.status(500).json({status:false, message:"Error fetching applications"})
    }
}

const getJobApplications = async(req, res) => {
    const jobId = req.params.id;
    if(!jobId){
        return res.status(500).json({status:false, message:"Job id is missing"})
    }
    try{
        const applications = await db.select().from(applicationsTable).where(eq(applicationsTable.jobId, jobId));
        return res.status(200).json({status:true, message:"Applications fetched successfully", applications})
    }catch (error) {
        console.log("Error fetching applications: ", error);
        return res.status(500).json({status:false, message:"Error fetching applications"})
    }
}

const updateApplication = async(req, res) => {
    const applicationId = req.params.id;
    if(!applicationId){
        return res.status(500).json({status:false, message:"Application id is missing"})
    }
    
    try {
        const applications = await db.select().from(applicationsTable).where(eq(applicationsTable.id, applicationId));
        if(applications.length === 0){
            return res.status(404).json({status:false, message:"Application not found"})
        }
        const toAdd = req.body;
        const updatedApplication = await db.update(applicationsTable).set(toAdd).where(eq(applicationsTable.id, applicationId));
        if(updatedApplication){
            return res.status(200).json({status:true, message:"Application updated successfully"})
        }
    } catch (error) {
        console.log("Error updating application: ", error);
        return res.status(500).json({status:false, message:"Error updating application"})
    }
}

export {applyForJob, viewMyApplications, getJobApplications, updateApplication}