import {api} from '../utils/axios.js';
export const login = async (token) => {
    try{
    const result = await api.post('/api/auth/login',{token});
    return result.data;
    }catch(err){
        throw err.response?.data || err ;
    }
}

export const logout = async()=>{
    try{
        await api.post('/api/auth/logout');
    }catch(err){
        console.log("Error in logging Out", err.message);
    }
}
