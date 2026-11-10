import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import proxy from "express-http-proxy";
import { protect } from "./middleware/protect.js";
import { getUser } from "./controllers/user.controller.js";
import http from 'http'
import httpProxy from 'http-proxy'
import { Socket } from "dgram";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;
const server = http.createServer(app);

app.use((req, res, next) => {
  if (req.url.startsWith("/socket.io")) {
    return socketProxy.web(req, res);
  }
  next();
});

app.use(express.json());
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}));
app.use(cookieParser());
app.use(morgan("dev"));

// User Details 
app.get('/api/me', protect, getUser);

// --- Auth Route (Fixed) ---
app.use("/api/auth", proxy(process.env.AUTH_SERVICE_URL, {
  proxyReqPathResolver: (req) => {
    // If auth service expects /login, req.url will be /login after stripping /api/auth
    return req.url; 
  }
}));

// --- Project Route ---
app.use('/api/project', protect, proxy(process.env.PROJECT_SERVICE_URL, {
  proxyReqOptDecorator: (proxyReqOpts, req) => {
    if (req.user) {
      proxyReqOpts.headers["x-user-id"] = req.user._id;
    }
    return proxyReqOpts;
  },
  proxyReqPathResolver: (req) => {
    return req.url;
  }
}));

// --- File Route (Fixed copy-paste bug from your original code) ---
app.use("/api/file", protect, proxy(process.env.FILE_SERVICE_URL, {
  proxyReqOptDecorator: (proxyReqOpts, req) => {
    if (req.user) {
      proxyReqOpts.headers["x-user-id"] = req.user._id;
    }
    return proxyReqOpts;
  },
  proxyReqPathResolver: (req) => {
    return req.url;
  }
}));

app.use("/api/ai", protect, proxy(process.env.AI_SERVICE_URL, {
  proxyReqOptDecorator: (proxyReqOpts, req) => {
    if (req.user) {
      proxyReqOpts.headers["x-user-id"] = req.user._id;
    }
    return proxyReqOpts;
  },
  proxyReqPathResolver: (req) => {
    return req.url;
  }
}));

app.use("/api/terminal", protect, proxy(process.env.TERMINAL_SERVICE_URL, {
  // proxyReqOptDecorator: (proxyReqOpts, req) => {
  //   if (req.user) {
  //     proxyReqOpts.headers["x-user-id"] = req.user._id;
  //   }
  //   return proxyReqOpts;
  // },
  proxyReqPathResolver: (req) => {
    return req.url;
  }
}));

const socketProxy = httpProxy.createProxyServer({
  target: process.env.TERMINAL_SERVICE_URL,
  ws: true,
  changeOrigin: true,
});

socketProxy.on("error", (err, req, res) => {
  console.error("Socket proxy error:", err.message);
  if (res && res.writeHead) {
    res.writeHead(502);
    res.end("Bad gateway");
  }
});

server.on("upgrade", (req, socket, head) => {
  if (req.url.startsWith("/socket.io")) {
    socketProxy.ws(req, socket, head);
  } else {
    socket.destroy();
  }
});

app.get("/", (req, res) => {
  res.send("Hello from the gateway!");
});

server.listen(PORT,"0.0.0.0", () => {
  console.log(`Gateway is running on port ${PORT}`);
});