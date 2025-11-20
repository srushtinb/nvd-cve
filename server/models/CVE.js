const mongoose = require("mongoose");

const cveSchema = new mongoose.Schema({
  cveId: { type: String, required: true, unique: true },
  sourceIdentifier: String,
  publishedDate: Date,
  lastModifiedDate: Date,
  vulnStatus: String,
  description: String,
  cvssV3Score: Number,
  cvssV2Score: Number,
  year: Number,
});

module.exports = mongoose.model("CVE", cveSchema);
