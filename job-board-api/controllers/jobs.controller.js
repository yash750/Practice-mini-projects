import { jobsTable } from "../models/schema.js";
import { db } from "../utils/connectDB.js";
import { eq } from "drizzle-orm";

const getJobs = async(req, res) => {
    const user = req.user;
    if(!user){
        return res.status(401).json({status:false, message:"Unauthorized request"})
    }
    try{
        const jobs = await db.select().from(jobsTable);
        return res.status(200).json({status:true, message:"Jobs fetched successfully", jobs})
    }catch (error) {
        console.log("Error fetching jobs: ", error);
        return res.status(500).json({status:false, message:"Error fetching jobs"})
    }
}

const addJob = async(req,res) => {
    try{
        const user = req.user;
        if(!user){
            return res.status(401).json({status:false, message:"User not mentioned in request"})
        }
        const {title, description, location, salary, category} = req.body;
        const newJob = await db.insert(jobsTable).values({
            title,
            description,
            location,
            salary_range: salary,
            category,
            employerId: user.id
        })
        if(newJob){
            return res.status(200).json({status:true, message:"Job added successfully"})
        }
    }catch(err){
        console.log("Error adding job: ", err);
        return res.status(500).json({status:false, message:"Error adding job"})
    }
}

const getJob = async(req, res) => {
    const jobId = req.params.id;
    console.log(jobId);
    if(!jobId){
        return res.status(500).json({status:false, message:"Job id is missing"})
    }
    try{
        const jobs = await db.select().from(jobsTable).where(eq(jobsTable.id, jobId));
        if(jobs.length === 0){
            return res.status(404).json({status:false, message:"Job not found"})
        }
        const job = jobs[0];
        return res.status(200).json({status:true, message:"Job fetched successfully", job})
    }catch (error) {
        console.log("Error fetching job: ", error);
        return res.status(500).json({status:false, message:"Error fetching job"})
    }
}

const updateJob = async(req, res) => {
    const jobId = req.params.id;
    if(!jobId){
        return res.status(500).json({status:false, message:"Job id is missing"})
    }
    try {
        const jobs = await db.select().from(jobsTable).where(eq(jobsTable.id, jobId));
        if(jobs.length === 0){
            return res.status(404).json({status:false, message:"Job not found"})
        }
        const toAdd = req.body;
        const updatedJob = await db.update(jobsTable).set(toAdd).where(eq(jobsTable.id, jobId));
        if(updatedJob){
            return res.status(200).json({status:true, message:"Job updated successfully"})
        }
    } catch (error) {
        console.log("Error updating job: ", error);
        return res.status(500).json({status:false, message:"Error updating job"})
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


export {getJobs, addJob, getJob, updateJob, deleteJob}