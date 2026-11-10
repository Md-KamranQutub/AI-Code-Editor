import express from "express";
import dotenv from "dotenv";
import { connectDb } from "./config/connectDb.js";
import { login, logout } from "./controllers/auth.controller.js";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8001;
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Hello from the auth service!");
});

app.post("/login", login);
app.post('/logout', logout);

app.listen(PORT, () => {
  connectDb();
  console.log(`Auth Service is running on port ${PORT}`);
});