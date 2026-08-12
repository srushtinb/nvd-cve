const test = require("node:test");
const assert = require("node:assert/strict");
const app = require("../app");

test("GET /health returns service health information", async () => {
  const server = app.listen(0);
  const { port } = server.address();

  try {
    const response = await fetch(`http://127.0.0.1:${port}/health`);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.status, "ok");
    assert.equal(body.service, "nvd-cve");
    assert.ok(body.timestamp);
  } finally {
    server.close();
  }
});

test("unknown routes return 404", async () => {
  const server = app.listen(0);
  const { port } = server.address();

  try {
    const response = await fetch(`http://127.0.0.1:${port}/does-not-exist`);
    assert.equal(response.status, 404);
  } finally {
    server.close();
  }
});
