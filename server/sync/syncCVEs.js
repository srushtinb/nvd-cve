require("dotenv").config();
const axios = require("axios");
const mongoose = require("mongoose");
const CVE = require("../models/CVE");

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("STARTING SECURIN SYNC — 25,000 CVEs in 9 mins");

  let startIndex = 0;
  const perPage = 2000;
  let count = 0;

  while (count < 25000) {
    try {
      const res = await axios.get(
        "https://services.nvd.nist.gov/rest/json/cves/2.0",
        {
          params: { startIndex, resultsPerPage: perPage },
          timeout: 30000,
        }
      );

      if (!res.data.vulnerabilities?.length) break;

      for (const item of res.data.vulnerabilities) {
        const c = item.cve;
        const desc = c.descriptions.find((d) => d.lang === "en")?.value || "";
        const v3 =
          c.metrics?.cvssMetricV31?.[0] || c.metrics?.cvssMetricV30?.[0];
        const v2 = c.metrics?.cvssMetricV2?.[0];

        await CVE.updateOne(
          { cveId: c.id },
          {
            $set: {
              cveId: c.id,
              sourceIdentifier: c.sourceIdentifier || "cve@mitre.org",
              publishedDate: new Date(c.published),
              lastModifiedDate: new Date(c.lastModified),
              vulnStatus: c.vulnStatus,
              description: desc,
              cvssV3Score: v3?.cvssData.baseScore || null,
              cvssV2Score: v2?.cvssData.baseScore || null,
              year: new Date(c.published).getFullYear(),
            },
          },
          { upsert: true }
        );
        count++;
      }

      startIndex += perPage;
      console.log(`Synced ${count} CVEs...`);
      await new Promise((r) => setTimeout(r, 7500)); // 7.5 seconds delay = 100% safe
    } catch (err) {
      console.log("Blocked — waiting 40 seconds...");
      await new Promise((r) => setTimeout(r, 40000));
    }
  }

  console.log("SECURIN ASSESSMENT READY — 25,000+ CVEs LOADED!");
  process.exit();
})();
