import express from "express";
import dotenv from "dotenv";
import { connectDb } from "./config/connectDb.js";
import cookieParser from "cookie-parser";
import router from "./router/file.route.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8003;
app.use(express.json());
app.use(cookieParser());

app.use('/', router);

app.get('/',(req, res)=>{
  res.send({message: "hello from file service"});
})
app.listen(PORT, () => {
  connectDb();
  console.log(`File Service is running on port ${PORT}`);
});