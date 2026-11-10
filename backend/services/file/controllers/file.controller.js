import File from '../models/file.js'

export const createRootFolder = async(req, res)=>{
    try{
         const user = req.headers['x-user-id'];
        if(!user)
            return res.status(401).json({message : "UnAuthorised User"});

        const {projectId, projectName} = req.body;
        console.log(req.body);
        if( !projectId || !projectName)
            return res.status(402).json({message:"Parent Id or name of the folder is required"});

        let rootFolder = await File.findOne({owner:user, project:projectId, isDeleted:false});

        if(rootFolder){
            return res.status(200).json(rootFolder);
        }
        
         rootFolder = await File.create({
            owner: user,
            project: projectId,
            name: projectName,
            type:"folder",
        });

        return res.status(200).json(rootFolder);
    }catch(err){
        console.log(err.message);
        return res.status(500).json({message: "Error in creating root folder"});
    }
}

export const getNodes = async(req, res)=>{
    try{
        const {projectId} = req.params;
        const user = req.headers['x-user-id'];
        
        if(!user)
            return res.status(200).json({message:"User not authorised"});

        // const token = `nodes-${projectId}`
        // let nodes = await redis.get(token);

        // if(nodes)
        //     return res.status(200).json(JSON.parse(nodes));
        
        const nodes = await File.find({
            owner:user,
            project:projectId,
            isDeleted:false,
        });

        // await redis.set(token, JSON.stringify(nodes));

        return res.status(200).json(nodes);
    }catch(err){
        console.log(err.message);
        return res.status(500).json({message:"Error in fetching nodes"})
    }
}
export const createFolder = async (req, res) => {
    try{
        const user = req.headers['x-user-id'];
        if(!user)
            return res.status(401).json({message : "UnAuthorised User"});

        const {name, parentId, projectId} = req.body;
        if(!parentId || !name || !projectId)
            return res.status(401).json({message:"Parent Id or name of the folder is required"});

        console.log("Project Id", projectId)
        console.log("Parent Id", parentId)
        
        const folder = await File.create({
            owner: user,
            project: projectId,
            parent: parentId,
            name,
            type:"folder",
        });

        return res.status(200).json(folder);
    }catch(err){
        console.log(err);
        return res.status(500).json(err);
    }
}

export const createFile = async (req, res) => {
    try{
        const user = req.headers['x-user-id'];
        if(!user)
            return res.status(401).json({message : "UnAuthorised User"});

        const {name, parentId, projectId, language="", content=""} = req.body;
        if(!parentId || !name || !projectId)
            return res.status(402).json({message:"Parent Id or name of the folder is required"});
        

        const extension = name.includes(".") ? name.split(".").pop(): "";
        const file = await File.create({
            owner: user,
            project: projectId,
            parent: parentId,
            name,
            language,
            content,
            extension,
            type:"file",
        });

        return res.status(200).json(file);
    }catch(err){
        console.log(err.message)
        return res.status(500).json(err);
    }
}

export const deleteNode = async(req, res)=>{
    try{
        const {fileId} = req.params;

        const file = await File.findById(fileId);
        file.isDeleted = true;

        if(file.type === "folder")
        {
           File.updateMany({parent:fileId},{isDeleted:true});
          
        }


        await file.save();

        return res.status(200).json({message:"File or Folder succesfully deleted"});
    }catch(err){
        console.log(err)
        return res.status(500).json({message:`Error in deleting file or folder ${err.message}`});
    }
}

export const updateFile = async(req, res)=>{
    try{
        const user = req.headers['x-user-id'];
        if(!user){
            return res.status(401).json({message: "Unauthourised access"});
        }
        const {fileId, name, content} = req.body;
        console.log("fileId", fileId)
        console.log("content", content)

        if(!name && !content){
            return res.status(403).json({message: "File id and new name is mandatory"});
        }

        const file = await File.findById(fileId);
        if(!file)
            return res.status(404).json({message: "File not found"});


        if(name){
            file.name = name;
        }
        
        if(content){
            file.content = content;
        }

        await file.save();
        return res.status(200).json(file);
    }catch(err){
        return res.status(500).json({message: `Error in renaming ${err.message}`});
    }
}

// export const saveInFile = async(req, res)=>{
//     try{
//         const user = req.headers['x-user-id'];
//         if(!user)
//             return res.status(401).json({message:"Unauthorised user"});

//         const {fileId, content=""} = req.body;

//         if(!fileId)
//             return res.status(404).json({message:"File id is mandatory "})

//         const file = await File.findById(fileId);
//         if(!file)
//             return res.satus(404).json({message:"File not found"});

//         file.content = content;
//         await file.save();
//         return res.status().json({message:"Content saved succesfully!"});
//     }catch(err){
//         return res.status(500).json({message:err.message});
//     }
// }


export const getFile = async(req, res)=>{
    try{
        const user = req.headers['x-user-id'];
        if(!user)
            return res.status(401).json({message:"Unauthorised user"});

        const {fileId} = req.params;
        if(!fileId)
            return res.status(404).json({message:"File id is mandatory "})

        const file = await File.findById(fileId);
        if(!file)
            return res.status(404).json({message:"File not found"});    

        return res.status(200).json(file);
    }catch(err){
        return res.status(500).json({message:err.message});
    }
}