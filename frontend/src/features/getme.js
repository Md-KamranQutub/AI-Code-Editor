import {api} from '../utils/axios.js'

export const getMe = async()=>{
    try{
        const user = await api.get('/api/me');
        return user.data;
    }
    catch(err){
        return null;
    }
}