// server/models/CVE.js
const mongoose = require("mongoose");

const cveSchema = new mongoose.Schema({
  cveId: { type: String, required: true, unique: true },
  sourceIdentifier: String,
  published: Date,
  lastModified: Date,
  vulnStatus: String,
  description: String,
  baseScore: Number,
  baseSeverity: String,
  references: [String],
  configurations: [String],
});

module.exports = mongoose.model("CVE", cveSchema);
