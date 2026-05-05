// server/sync/cleanCVE.js
require("dotenv").config();
const mongoose = require("mongoose");
const CVE = require("../models/CVE");

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  await CVE.deleteMany({});
  console.log("All CVEs deleted");
  process.exit();
});
