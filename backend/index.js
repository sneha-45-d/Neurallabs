import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";

// Routes
import authRoutes from "./routes/AuthRoutes.js";
import contactsRoutes from "./routes/ContactRoutes.js";
import messagesRoutes from "./routes/MessagesRoutes.js";
import channelRoutes from "./routes/ChannelRoutes.js";

// Socket
import setupSocket from "./socket.js";

dotenv.config();

const app = express();

// ENV
const port = process.env.PORT || 5000;
const databaseURL = process.env.DATABASE_URL;
const clientURL = process.env.CLIENT_URL || "http://localhost:5173";

/* ---------------- MIDDLEWARE ---------------- */

// CORS setup
app.use(
  cors({
    origin: clientURL,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  })
);

// Preflight
app.options("*", cors());

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookies
app.use(cookieParser());

// Static files
app.use("/uploads/profiles", express.static("uploads/profiles"));
app.use("/uploads/files", express.static("uploads/files"));

/* ---------------- ROUTES ---------------- */

app.use("/api/auth", authRoutes);
app.use("/api/contacts", contactsRoutes);
app.use("/api/messages", messagesRoutes);
app.use("/api/channel", channelRoutes);

/* ---------------- ERROR HANDLER ---------------- */

app.use((err, req, res, next) => {
  console.error("🔥 Error:", err.message);
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
});

/* ---------------- DB + SERVER START ---------------- */

mongoose
  .connect(databaseURL)
  .then(() => {
    console.log("✅ Database Connected Successfully");

    const server = app.listen(port, () => {
      console.log(`🚀 Server running at http://localhost:${port}`);
    });

    // Socket setup AFTER server starts
    setupSocket(server);
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Failed:", err.message);
  });