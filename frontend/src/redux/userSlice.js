import { createSlice } from "@reduxjs/toolkit"


const userSlice = createSlice({
  name: 'user',
  initialState:{
    userData:null,
  },
  reducers: {
    setUserData : (state, actions)=>{
        state.userData = actions.payload
    }
  }
})

export const { setUserData } = userSlice.actions

export default userSlice.reducer;
