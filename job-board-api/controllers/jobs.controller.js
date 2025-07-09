import { jobsTable } from "../models/schema.js";
import { db } from "../utils/connectDB.js";

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


export {getJobs, addJob}