import { api } from "../utils/axios"

export const createRootFolder = async(projectId, projectName)=>{
    try {
        const rootFolder = api.post('/api/file/create-root-folder',{projectId, projectName});
        return rootFolder;
    } catch (error) {
        console.log("Error in creating root folder", error.messsage);
    }
}

export const createFolder = async(projectId, parentId, name)=>{
    try {
        const folder = await api.post('/api/file/create-folder', {projectId, parentId, name});
        return folder;
    } catch (error) {
        console.log("Error in creating folder", error.messsage);
    }
}

export const createFile = async(projectId, parentId, name)=>{
    try {
        const file = await api.post('/api/file/create-file', {projectId, parentId, name});
        return file;
    } catch (error) {
        console.log("Error in creating file", error);
    }
}

export const getNodes = async(projectId)=>{
    try {
        const nodes = await api.get(`/api/file/get-nodes/${projectId}`);
        return nodes;
    } catch (error) {
        console.log("Error in getting nodes");
    }
}

export const renameNode = async(fileId, name)=>{
    try {
        const node = await api.patch(`/api/file/rename-file`,{fileId, name});
        return node;
    } catch (error) {
        console.log("Error in renamin node", error.messsage);
    }
}

export const deleteFile = async(nodeId)=>{
    try {
        const node = await api.delete(`/api/file/delete-node/${nodeId}`);
        return node;
    } catch (error) {
        console.log("Error in deleting node", error.messsage);
    }
}

export const updateFileContent = async(fileId, content)=>{
    try {
        const node = await api.patch(`/api/file/update-file`,{fileId, content});
        return node;
    } catch (error) {
        console.log("Error in updating file content", error.messsage);
    }
}
