require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// HTML ROUTES FIRST (FIX FOR JSON ON CLICK)
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));
app.get("/cves/:id", (req, res) => res.sendFile(path.join(__dirname, "public", "detail.html"))); // ← BEFORE API

// API ROUTES AFTER (no conflict)
app.use("/api/cves", require("./server/routes/cveRoutes"));

// DB
mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/cvedb")
  .then(() => console.log("MongoDB Connected — 26,000+ CVEs Ready"))
  .catch(err => console.log(err));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Dashboard Live → http://localhost:${PORT}`));
