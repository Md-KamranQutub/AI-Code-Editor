import redis from "../../shared/redis/redis.js";

export const protect = async(req, res, next)=>{
    try{
        const sessionId = req.cookies.session;
        console.log(sessionId)
        if(!sessionId){
            return res.status(401).json({message:"Unauthorized User"})
        }

        const result = await redis.get(`session-${sessionId}`);
        console.log("result",result);
        if(!result){
            return res.status(401).json({message : "Session expired"});
        }
        const user = JSON.parse(result);
        req.user = user;
        next();
    }
    catch(error){
        return res.status(500).json({message:`Error in middleware ${error.message}`})
    }
}