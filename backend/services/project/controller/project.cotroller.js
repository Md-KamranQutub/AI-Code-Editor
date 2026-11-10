import Project from "../models/project.js";
import redis from '../../../shared/redis/redis.js'

export const createProject = async(req, res)=>{
    try{
        const {name, description} = req.body;
        const userId = req.headers["x-user-id"];
        const key = `projects-${userId}`;
        await redis.del(key);

        const project = await Project.create({
            owner:userId,
            name: name,
            description: description,
        });

        return res.status(200).json(project);
    }catch(err){
        console.log(err);
        return res.status(500).json({message:`Error in creating Project ${err.message}`});
    }
}

export const getProject = async(req, res)=>{
    try{
        const {projectId} = req.params;
        const project = await Project.findById(projectId);
        if(!project){
            return res.status(404).json({message:"Project not found"});
        }
        project.lastOpenedAt = new Date();
        await project.save();
        return res.status(200).json(project);
    }catch(err){
        return res.status(500).json({message:`Error in getting Project ${err.message}`});
    }
}

export const getAllProjects = async(req, res)=>{
    try{
        const userId = req.headers["x-user-id"];

        const key = `projects-${userId}`;
        const result = await redis.get(key);

        if(result){
            return res.status(200).json(JSON.parse(result));
        }

        const projects = await Project.find({owner:userId}).sort({lastOpenedAt:-1});

        await redis.set(key, JSON.stringify(projects));

        return res.status(200).json(projects);
    }catch(err){
        return res.status(500).json({message:`Unable to fetch all Projects ${err.message}`});
    }
}

export const toggleStar = async(req,res)=>{
    try{
        const {projectId} = req.params;
        console.log("Project Id", projectId);
        const userId = req.headers['x-user-id']
        const project = await Project.findById(projectId);
        const currentStarredStatus = project.starred ? false : true;
        project.starred = currentStarredStatus;
        await project.save();
        await redis.del(`starred-projects-${userId}`)
        await redis.del(`projects-${userId}`);

        return res.status(202).json({message:"Project Updated Successfully!"});
    }catch(err){
        console.log(err);
        return res.status(500).json({message:`Error in marking starred ${err.message}`});
    }
}

export const getStarredProjects = async(req, res)=>{
    try{
        const userId = req.headers['x-user-id'];
        const key = `starred-projects-${userId}`;
        const result = await redis.get(key);
        if(result){
            return res.status(200).json(JSON.parse(result));
        }
        const starredProjects = await Project.find({owner:userId, starred:true});
        redis.set(key, JSON.stringify(starredProjects));
        return res.status(200).json(starredProjects);
    }catch(err){
        return res.status.json({mesage:`Error in fetching starred projects ${err.message}`});
    }
}

export const deleteProject = async(req, res)=>{
    try{
    const {projectId} = req.params;
    const userId = req.headers['x-user-id'];

    await Project.findByIdAndDelete(projectId);
    await redis.del(`projects-${userId}`);

    return res.status(200).json({message:"Project deleted Succesfully"});
    }catch(err){
        return res.status(500).json({message:`Error in deleting Project ${err.message}`})
    }
}