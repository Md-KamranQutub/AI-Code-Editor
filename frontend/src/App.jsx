import {BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard.jsx';
import { useEffect } from 'react';
import { getMe } from './features/getme.js';
import { useDispatch } from 'react-redux';
import { setUserData } from './redux/userSlice.js';
import Project from './pages/Project.jsx';
import { getAllProjects, getProject } from './features/project.js';
import { setProjectData } from './redux/projectSlice.js';
import { loader } from '@monaco-editor/react';

const App = () => {
  const dispatch = useDispatch();

  // Configure Monaco before any editor component mounts
loader.config({
  theme: 'clean-hc-black', // Set the default theme to clean-hc-black
});

  
  useEffect(() => {
    const fetch = async()=>{
      const user = await getMe();
      const projects = await getAllProjects();
      dispatch(setUserData(user));
      dispatch(setProjectData(projects));
    }
    fetch();
  }, [])
  
  return (
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<Dashboard/>} />
      <Route path='/project/:projectId' element={<Project/>}/>
    </Routes>
    </BrowserRouter>
  )
}

export default App