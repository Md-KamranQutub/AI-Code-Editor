import express from "express";
import dotenv from "dotenv";
import { connectDb } from "./config/connectDb.js";
import http from 'http'
import { Server } from "socket.io";
import os, { userInfo } from "os"
import fs from 'fs/promises'
import pty from 'node-pty'
import { exitCode } from "process";
import path from 'path'

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8005;
app.use(express.json());

const fileServiceUrl = process.env.FILE_SERVICE_URL || "http://localhost:8003"

const WORK_SPACE_ROOT = path.join(os.tmpdir(),"kiln");

const SHELL = process.platform == "win32"?"powershell.exe":"bash";

const server = http.createServer(app);

const io = new Server(server,
  {
    cors:{
      origin:true,
      credentials:true
    }
  }
)


const sessions = new Map();

const send = (socket , data)=>{
  if(!socket)
    return ;

  socket.emit("terminal:data",String(data || []));
}

const safeName = (name)=>{
  if(!name || name === ".." || name === "." || name.includes("/") || name.includes("\\"))
    throw new Error(`Invalid file or folder name ${name}`);
  
  return name;
}

const workspace = (projectId)=>{
  return path.join(WORK_SPACE_ROOT,String(projectId));
}

const normaliseCols = (cols)=>{
  const value = Number(cols);
  if(!Number.isFinite(value))
    return 80;

  return Math.max(20,Math.min(Math.floor(value),500));
}

const normaliseRows = (rows)=>{
  const value = Number(rows);
  if(!Number.isFinite(value))
    return 30;

  return Math.max(5,Math.min(Math.floor(value),200));
}

export const createTree = (nodes = []) => {
  const map = {};
  let root = null;

  nodes.forEach((node) => {
    map[String(node._id)] = { ...node, children: [] };
  });

  nodes.forEach((node) => {
    const id = String(node._id);
    const parent = node.parent != null ? String(node.parent) : null;
    if (parent && map[parent]) {
      map[parent]?.children.push(map[id]);
    } else if (!parent) {
      root = map[id];
    }
  });

  return root;
};

const getTree = async(projectId, userId)=>{
  const url = fileServiceUrl+"/get-nodes";
    const response = await fetch(`${fileServiceUrl}/get-nodes/${projectId}`, {
     method: "GET",
     headers: { "Content-Type": "application/json", "x-user-id": String(userId) },
   });
   if (!response.ok) throw new Error(`File service returned ${response.status}`);
   const json = await response.json();
   const tree = createTree(json.data ?? json);
   return tree;
  }

const writeNodes = async(nodes, directory)=>{
  if(!Array.isArray(nodes))
    return ;

  for (const node of nodes) {
    const name = safeName(node.name);
    const target = path.join(directory,name);
    if(node.type === "folder"){
      await fs.mkdir(target,{recursive:true});
      await writeNodes(node.children || [], target);
      continue;
    }
    if(node.type === "file"){
      await fs.mkdir(path.dirname(target),{recursive:true});
      await fs.writeFile(target, node.content || "", "utf8");
    }
  }
}

const syncProject = async(projectId, userId)=>{
  const tree = await getTree(projectId, userId);
  const root = workspace(projectId);
  fs.mkdir(root, {recursive: true});
  await writeNodes(tree.children || [], root);

  return {tree, root};
}

io.on("connection", async(socket)=>{
  console.log("Terminal connected ",socket.id);

  socket.on("terminal:init",async({projectId, userId, cols = 80, rows = 20})=>{
    try{
    projectId = String(projectId);
    userId = String(userId);

  if(!projectId || !userId)
    throw new Error("ProjectId and userId required");

  const existingSession = sessions.get(socket.id);
  if(existingSession){
    try{
      existingSession.ptyProcess.kill();
    }catch{
      sessions.delete(socket.id);
    }
  }

  cols = normaliseCols(cols);
  rows = normaliseRows(rows);
  const {root} = await syncProject(projectId, userId);

  const ptyProcess = pty.spawn(SHELL , [],
  {
    name:"xterm-256color",
    cols,
    rows,
    cwd:root,
    env:{
      ...process.env,
      FORCE_COLOR:"1"
    }
  })

  ptyProcess.onData((data)=>send(socket, data));

  ptyProcess.onExit((exitCode)=>{send(socket, `\r\n\x1b[90m[shell exited:${exitCode}]\x1b[0m\r\n`)
  const session = sessions.get(socket.id);
  if(session?.ptyProcess == ptyProcess){
    sessions.delete(socket.id);
  }
})

sessions.set(socket.id,{
  projectId,
  userId,
  cwd:root,
  ptyProcess
})

socket.emit("terminal:ready",{cols,rows});
}catch(error){
  console.log("Error in terminal ready",error.message);
  send(socket, `\r\n\x1b[31m${error.message}]\x1b[0m\r\n`);
 }
})

  socket.on("terminal:write", (data)=>{
    const session = sessions.get(socket.id);
    if(!session)
      return;

    session.ptyProcess.write(String(data));
  })

  socket.on("terminal:resize",({cols, rows})=>{
    const session = sessions.get(socket.id);
    if(!session)
      return;

    rows = Number(rows);
    cols = Number(cols);

    if(!Number.isFinite(cols) || !Number.isFinite(rows))
      return ;

    cols = normaliseCols(cols);
    rows = normaliseRows(rows);

    session.ptyProcess.resize(cols,rows);

  })

  socket.on("disconnect",()=>{
    const session = sessions.get(socket.id);
    if(session){
      try{
        session.ptyProcess.kill();
      }catch{}
      sessions.delete(socket.id);
    }
  })

})

app.get("/health",(req, res)=>{
  return res.json({success:true, service:"terminal"});
})


server.listen(PORT, () => {
  connectDb();
  console.log(`Terminal Service is running on port ${PORT}`);
});