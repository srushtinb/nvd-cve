require("dotenv").config();

const express = require("express");
const path = require("path");
const cors = require("cors");
const { exec } = require("child_process");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Liveness/health endpoint for container and deployment checks.
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "nvd-cve",
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use("/api/cves", require("./server/routes/cveRoutes"));

// SYNC ROUTE
app.get("/sync", async (req, res) => {
  exec("node server/sync/syncCVE.js", (error, stdout, stderr) => {
    if (error) {
      console.error(error);
      return res.status(500).send("Sync failed");
    }

    console.log(stdout);
    console.error(stderr);

    res.send("CVE Sync Started Successfully");
  });
});

// Detail page
app.get("/cve/:id", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "detail.html"));
});

// Home page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

module.exports = app;
