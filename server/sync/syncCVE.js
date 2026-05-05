// server/sync/syncCVE.js
require("dotenv").config();
const mongoose = require("mongoose");
const axios = require("axios");
const CVE = require("../models/CVE");

const BASE_URL = "https://services.nvd.nist.gov/rest/json/cves/2.0";

async function sync(fullSync = true, maxTotal = 50000) {
  // fullSync=true for all; false for recent only
  await mongoose.connect(process.env.MONGODB_URI);
  console.log(
    fullSync
      ? "Full Sync Started (All CVEs, oldest first)..."
      : "Recent Sync Started (2020+)..."
  );

  let startIndex = 0;
  const limit = 2000;
  let total = 0;

  while (total < maxTotal) {
    console.log(
      `Fetching batch ${Math.floor(startIndex / limit) + 1}: ${startIndex} - ${
        startIndex + limit - 1
      }`
    );

    try {
      const params = { startIndex, resultsPerPage: limit };
      if (!fullSync) {
        params.pubStartDate = "2020-01-01T00:00:00.000"; // Recent only if not full
      }

      const res = await axios.get(BASE_URL, { params, timeout: 30000 });

      const items = res.data.vulnerabilities;
      if (!items || items.length === 0) {
        console.log("No more data – sync complete!");
        break;
      }

      // Batch process + cleanse (trim desc, dedup via upsert)
      const updates = items.map((item) => {
        const c = item.cve;
        const desc = (
          c.descriptions?.find((d) => d.lang === "en")?.value ||
          "No description available."
        )
          .substring(0, 1000)
          .trim();

        // SAFE score/severity extraction (handles missing/old metrics)
        let score = 0;
        let severity = "NONE";

        // Prefer V3.1
        if (c.metrics?.cvssMetricV31?.[0]?.cvssData) {
          const cvssData = c.metrics.cvssMetricV31[0].cvssData;
          score = cvssData.baseScore || 0;
          severity = cvssData.baseSeverity || "NONE";
        }
        // Fallback V3.0
        else if (c.metrics?.cvssMetricV30?.[0]?.cvssData) {
          const cvssData = c.metrics.cvssMetricV30[0].cvssData;
          score = cvssData.baseScore || 0;
          severity = cvssData.baseSeverity || "NONE";
        }
        // Fallback V2 (old CVEs – NO 'severity' field, so safe check)
        else if (c.metrics?.cvssMetricV2?.[0]?.cvssData) {
          const cvssData = c.metrics.cvssMetricV2[0].cvssData;
          score = cvssData.baseScore || 0;
          // V2 has no baseSeverity – derive from score or set NONE
          severity = "NONE"; // Fixed: No .severity access
        }

        const refs = (c.references || [])
          .slice(0, 10)
          .map((r) => r.url)
          .filter((url) => url && url.startsWith("http"))
          .filter(Boolean); // Clean valid URLs only
        const configs = (c.configurations?.[0]?.nodes?.[0]?.cpeMatch || [])
          .map((m) => m.criteria)
          .filter(Boolean); // Array of CPEs, skip empty

        return {
          updateOne: {
            filter: { cveId: c.id },
            update: {
              $set: {
                cveId: c.id,
                sourceIdentifier: c.sourceIdentifier || "cve@mitre.org",
                published: new Date(c.published),
                lastModified: new Date(c.lastModified),
                vulnStatus: c.vulnStatus || "Analyzed",
                description: desc,
                baseScore: score,
                baseSeverity: severity,
                references: refs,
                configurations: configs,
              },
            },
            upsert: true, // Dedup + insert if new
          },
        };
      });

      // Batch upsert for efficiency
      if (updates.length > 0) {
        await CVE.bulkWrite(updates);
      }

      total += items.length;
      console.log(
        `Saved ${items.length} CVEs (e.g., ${items[0].cve.id} to ${
          items[items.length - 1].cve.id
        }) → Total: ${total}`
      );
      startIndex += limit;

      if (total >= maxTotal) {
        console.log(
          `Hit limit of ${maxTotal} – stopping. Run again with higher maxTotal for more.`
        );
        break;
      }

      // Rate limit respect (5 req/30s free tier → ~6s wait)
      await new Promise((r) => setTimeout(r, 6000));
    } catch (err) {
      console.error("Error:", err.message);
      if (err.response?.status === 429 || err.code === "ECONNABORTED") {
        console.log("Rate limited – waiting 30s...");
        await new Promise((r) => setTimeout(r, 30000));
      } else {
        console.log("Non-rate error, retrying in 10s...");
        await new Promise((r) => setTimeout(r, 10000));
      }
    }
  }

  console.log(
    `SYNC FINISHED: ${total} CVEs stored (unique via upsert). Check DB: use mongo shell 'db.cves.countDocuments()'.`
  );
  mongoose.disconnect();
  process.exit(0);
}

// Run full sync by default (change to sync(false, 20000) for recent only)
sync(true, 50000);
