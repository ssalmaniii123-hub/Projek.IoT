import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { Server } from "socket.io";
import { initializeDatabase } from "./db.js";
import { createRoutes } from "./routes.js";

const serverRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
dotenv.config({ path: path.resolve(serverRoot, "..", ".env") });
dotenv.config({ path: path.resolve(serverRoot, ".env"), override: false });

const port = Number.parseInt(process.env.PORT || "3001", 10);
const host = process.env.HOST || "0.0.0.0";
const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: clientUrl,
    methods: ["GET", "POST"]
  }
});

app.use(cors({ origin: clientUrl }));
app.use(express.json({ limit: "1mb" }));
app.use(createRoutes(io));

app.use((req, res) => {
  res.status(404).json({ ok: false, error: `Route not found: ${req.method} ${req.path}` });
});

app.use((error, _req, res, _next) => {
  const status = error.status || 500;
  console.error(error);
  res.status(status).json({
    ok: false,
    error: status === 500 ? "Internal server error" : error.message
  });
});

io.on("connection", (socket) => {
  socket.emit("connection:ready", { connected: true, socketId: socket.id });
});

await initializeDatabase();

server.listen(port, host, () => {
  console.log(`RFID attendance server running at http://localhost:${port}`);
  console.log(`RFID attendance server listening on ${host}:${port}`);
});
