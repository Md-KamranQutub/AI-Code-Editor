export const getUser = (req, res)=>{
    try{
        const user = req.user;
        return res.status(200).json(user);
    }catch(err){
        return res.status(500).json({message:`Error in getUser ${err.message}`})
    }
}