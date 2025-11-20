const CVE = require('../models/CVE');

exports.listCVEs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';

    let query = {};
    if (search) query.cveId = { $regex: search, $options: 'i' };

    const total = await CVE.countDocuments(query);

    const cves = await CVE.find(query)
      .select('cveId sourceIdentifier publishedDate lastModifiedDate vulnStatus')
      .sort({ publishedDate: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(); // Fast query

    res.json({
      totalRecords: total,
      cves: cves.map(c => ({
        cveId: c.cveId,
        sourceIdentifier: c.sourceIdentifier || 'cve@mitre.org',
        publishedDate: c.publishedDate.toISOString().split('T')[0],
        lastModifiedDate: c.lastModifiedDate.toISOString().split('T')[0],
        vulnStatus: c.vulnStatus
      }))
    });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getCVE = async (req, res) => {
  try {
    const cve = await CVE.findOne({ cveId: req.params.id }).lean();
    if (!cve) return res.status(404).json({ error: 'Not found' });
    res.json({
      cveId: cve.cveId,
      sourceIdentifier: cve.sourceIdentifier || 'cve@mitre.org',
      publishedDate: cve.publishedDate.toISOString().split('T')[0],
      lastModifiedDate: cve.lastModifiedDate.toISOString().split('T')[0],
      vulnStatus: cve.vulnStatus,
      description: cve.description || 'No description',
      cvssV3Score: cve.cvssV3Score,
      cvssV2Score: cve.cvssV2Score,
      references: cve.references || [],
      year: cve.year
    });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
};
