import { createSlice } from "@reduxjs/toolkit"


const projectSlice = createSlice({
  name: 'project',
  initialState:{
    projectData:[],
    currentProject: null,
  },
  reducers: {
    setProjectData : (state, actions)=>{
        state.projectData = actions.payload
    },
    setCurrentProject: (state, actions)=>{
        state.currentProject = actions.payload
    },
    addProject : (state, actions)=>{
      state.projectData.push(actions.payload);
    },
    removeProject : (state, actions)=>{
      state.projectData = state.projectData.filter((project)=>{
        if(project._id != actions.payload)
          return project;
      })
    }
  }
})

export const { setProjectData, setCurrentProject } = projectSlice.actions

export default projectSlice.reducer;