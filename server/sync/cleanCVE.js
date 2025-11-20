module.exports.cleanCVE = (item) => {
  const c = item.cve;
  const desc =
    c.descriptions.find((d) => d.lang === "en")?.value || "No description";
  const v3 = c.metrics?.cvssMetricV31?.[0] || c.metrics?.cvssMetricV30?.[0];
  const v2 = c.metrics?.cvssMetricV2?.[0];

  return {
    cveId: c.id,
    sourceIdentifier: c.sourceIdentifier || "cve@mitre.org",
    publishedDate: new Date(c.published),
    lastModifiedDate: new Date(c.lastModified),
    vulnStatus: c.vulnStatus,
    description: desc,
    cvssV3Score: v3?.cvssData.baseScore || null,
    cvssV2Score: v2?.cvssData.baseScore || null,
    references: c.references?.map((r) => r.url) || [],
    configurations:
      c.configurations?.flatMap((n) =>
        n.nodes.flatMap((node) => node.cpeMatch?.map((m) => m.criteria) || [])
      ) || [],
    year: new Date(c.published).getFullYear(),
  };
};
