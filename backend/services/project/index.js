import express from "express";
import dotenv from "dotenv";
import { connectDb } from "./config/connectDb.js";
import cookieParser from "cookie-parser";
import router from "./router/project.route.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8002;
app.use(express.json());
app.use(cookieParser());

app.use('/',router);

app.listen(PORT, () => {
  connectDb();
  console.log(`Project Service is running on port ${PORT}`);
});