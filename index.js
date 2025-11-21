require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public")); // This serves all files in /public

// Connect DB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("DB Error:", err));

// API Routes
app.use("/api/cves", require("./server/routes/cveRoutes"));

// THIS IS THE MOST IMPORTANT LINE – Serves detail.html for every /cve/CVE-XXXXX
app.get("/cve/:id", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "detail.html"));
});

// Home page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`List: http://localhost:${PORT}`);
  console.log(`Detail example: http://localhost:${PORT}/cve/CVE-1999-0095`);
});
