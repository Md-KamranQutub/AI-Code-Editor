import express from "express";
import dotenv from "dotenv";
import { connectDb } from "./config/connectDb.js";
import router from "./router/ai.route.js"

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8004;
app.use(express.json());

app.use('/',router);

app.get("/", (req, res) => {
  res.send("Hello from the AI service!");
});


app.listen(PORT, () => {
  connectDb();
  console.log(`AI Service is running on port ${PORT}`);
});