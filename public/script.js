// public/script.js
let currentPage = 1;

async function load(page = 1) {
  currentPage = page;
  const search = document.getElementById("search").value.trim();
  const limit = document.getElementById("limit").value;

  const params = new URLSearchParams({
    page,
    limit,
    cveId: search,
  });

  const res = await fetch(`/api/cves/list?${params}`);
  const data = await res.json();

  document.getElementById("total").textContent = data.total;

  const tbody = document.querySelector("#cveTable tbody");
  tbody.innerHTML = data.cves
    .map(
      (cve) => `
    <tr onclick="location.href='/cve/${cve.cveId}'">
      <td><strong style="color:#1e40af">${cve.cveId}</strong></td>
      <td>${cve.sourceIdentifier || "cve@mitre.org"}</td>
      <td>${new Date(cve.published).toISOString().split("T")[0]}</td>
      <td>${new Date(cve.lastModified).toISOString().split("T")[0]}</td>
      <td><span style="color:#dc2626">${cve.vulnStatus}</span></td>
    </tr>
  `
    )
    .join("");

  // Smart pagination (like real apps: << 1 2 ... 48 49 50 ... 100 >>)
  const pagination = document.getElementById("pagination");
  let html = "";

  const totalPages = data.pages;
  const maxButtons = 9;
  let startPage = Math.max(1, currentPage - 4);
  let endPage = Math.min(totalPages, startPage + maxButtons - 1);

  if (endPage - startPage + 1 < maxButtons) {
    startPage = Math.max(1, endPage - maxButtons + 1);
  }

  // Previous
  html += `<button onclick="load(${currentPage - 1})" ${
    currentPage === 1 ? "disabled" : ""
  }>« Previous</button> `;

  // First page
  if (startPage > 1) {
    html += `<button onclick="load(1)">1</button> ... `;
  }

  // Middle pages
  for (let i = startPage; i <= endPage; i++) {
    html += `<button onclick="load(${i})" ${
      i === currentPage ? 'class="active"' : ""
    }>${i}</button> `;
  }

  // Last page
  if (endPage < totalPages) {
    html += `... <button onclick="load(${totalPages})">${totalPages}</button> `;
  }

  // Next
  html += `<button onclick="load(${currentPage + 1})" ${
    currentPage === totalPages ? "disabled" : ""
  }>Next »</button>`;

  pagination.innerHTML = html;
}

// Load on start
load(1);
