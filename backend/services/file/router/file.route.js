import express from 'express';
import { createFile, createFolder, createRootFolder, deleteNode, getNodes, updateFile, getFile } from '../controllers/file.controller.js';

const router = express.Router();

router.get('/get-nodes/:projectId', getNodes)
router.get('/get-file/:fileId', getFile)
router.post('/create-root-folder', createRootFolder)
router.post('/create-folder/' , createFolder);
router.post('/create-file/', createFile);
router.delete('/delete-node/:fileId', deleteNode)
router.patch('/update-file/', updateFile);


export default router