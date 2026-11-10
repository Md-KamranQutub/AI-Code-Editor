import express from 'express';
import { createProject, deleteProject, getAllProjects, getProject, toggleStar } from '../controller/project.cotroller.js';

const router = express.Router();

router.post('/create-project', createProject);
router.get('/project/:projectId', getProject);
router.get('/get-all-projects', getAllProjects);
router.delete('/delete-project/:projectId', deleteProject);
router.patch('/toggle-star/:projectId', toggleStar);

export default router