import {app} from "../config/firebase.js";
import {getAuth} from "firebase-admin/auth";
import User from "../models/User.js";
import crypto from "crypto";
import redis from "../../../shared/redis/redis.js";

export const login = async(req, res)=>{
    try{
        const { token } = req.body;
        const decodedToken = await getAuth(app).verifyIdToken(token);
        const uid = decodedToken?.uid;
        let user = await User.findOne({firebaseUid: uid});
        if(!user){
            user = await User.create({
                firebaseUid: uid,
                username:decodedToken?.name,
                avatar:decodedToken?.picture,
                email:decodedToken?.email
            });
        }

        const sessionId = crypto.randomUUID();

            res.cookie("session", sessionId, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite:process.env.NODE_ENV === "production" ? "none" : "strict",
            maxAge: 7*24*60*60*1000 // 7 days in milliseconds
        });

        await redis.set(`session-${sessionId}`, JSON.stringify({
            _id: user._id,
            name: user.username,
            email: user.email,
            avatar: user.avatar
        }),"EX",7*24*60*60); // Set session to expire in 7 days
        
        res.status(200).json(user);

    }catch(error){
        console.log(error);
        res.status(500).send({message:`Error in authenticating ${error.message}`});
    }
}


export const logout = async(req, res)=>{
    try{
        const sessionId = req.cookies.session;
        if(sessionId){
            await redis.del(`session-${sessionId}`);
            res.clearCookie("session");
        }
        res.status(200).send({message:"Logged out successfully"});
    }catch(error){
        res.status(500).send({message:`Error in logging out ${error.message}`});
    }
}