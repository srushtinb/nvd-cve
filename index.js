require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");
const { exec } = require("child_process");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Connect DB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("DB Error:", err));

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

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`List: http://localhost:${PORT}`);
  console.log(`Detail example: http://localhost:${PORT}/cve/CVE-1999-0095`);
});
