// server/controllers/cveController.js
const CVE = require("../models/CVE");

exports.getList = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};

    if (req.query.cveId) {
      filter.cveId = new RegExp(req.query.cveId, "i");
    }
    if (req.query.year) {
      const y = parseInt(req.query.year);
      filter.published = {
        $gte: new Date(`${y}-01-01`),
        $lt: new Date(`${y + 1}-01-01`),
      };
    }
    if (req.query.score) {
      filter.baseScore = { $gte: parseFloat(req.query.score) };
    }
    if (req.query.days) {
      const date = new Date();
      date.setDate(date.getDate() - parseInt(req.query.days));
      filter.lastModified = { $gte: date };
    }

    const total = await CVE.countDocuments(filter);
    const cves = await CVE.find(filter)
      .sort({ lastModified: -1 })
      .skip(skip)
      .limit(limit)
      .lean(); // ← This makes it faster

    res.json({
      cves,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("Error in getList:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getById = async (req, res) => {
  try {
    const cve = await CVE.findOne({ cveId: req.params.id });
    if (!cve) return res.status(404).json({ error: "CVE not found" });
    res.json(cve);
  } catch (err) {
    console.error("Error in getById:", err);
    res.status(500).json({ error: "Server error" });
  }
};
