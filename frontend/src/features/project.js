import {api} from '../utils/axios.js'

export const createProject = async(name, description)=>{
    try{
        const result = await api.post('/api/project/create-project', {name, description});
        return result.data;
    }catch(err){
        console.log("Error in getting all projects" , err.message);
        return [];
    }
}

export const getProject = async(projectId)=>{
    try{
        const result = await api.get(`/api/project/get-project/${projectId}`, {name, description});
        return result.data;
    }catch(err){
        return err.message;
    }
}

export const getAllProjects = async()=>{
    try{
        const result = await api.get(`/api/project/get-all-projects`);
        return result.data;
    }catch(err){
        return err.message;
    }
}

export const toggleStar = async(projectId)=>{
    try{
        const result = await api.patch(`/api/project/toggle-star/${projectId}`);
        return result.data;
    }catch(err){
        return err.message;
    }
}

export const getStarredProjects = async()=>{
    try{
        const result = await api.put(`/api/project/get-starred-projects`);
        return result.data;
    }catch(err){
        return err.message;
    }
}

export const deleteProject = async(projectId)=>{
    try{
        const result = await api.delete(`/api/project/delete-project/${projectId}`);
        return result.data;
    }catch(err){
        return err.message;
    }
}

