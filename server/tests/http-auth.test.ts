import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";

// Test-only process environment, never written to a credentials file.
process.env.MONGODB_URI ??= "mongodb://127.0.0.1:27017/campusconnect_test";
process.env.JWT_SECRET ??= "test-only-signing-secret-not-for-production-12345";
let server: Server;
let base: string;
before(async () => {
  const { app } = await import("../src/app.js");
  await new Promise<void>((resolve) => { server = app.listen(0, "127.0.0.1", resolve); });
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}/api`;
});
after(async () => { await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve())); });
for (const [method, path] of [
  ["GET", "/teams/mine"], ["POST", "/teams/000000000000000000000001/join"],
  ["DELETE", "/teams/000000000000000000000001/leave"], ["PATCH", "/teams/000000000000000000000001/status"],
  ["GET", "/projects/000000000000000000000001/messages"], ["POST", "/projects/000000000000000000000001/messages"],
] as const) {
  test(`${method} ${path} requires authentication`, async () => {
    const response = await fetch(base + path, { method });
    assert.equal(response.status, 401);
    assert.match((await response.json() as { message: string }).message, /Authentication is required/);
  });
}
test("invalid token is rejected without database access", async () => {
  const response = await fetch(base + "/teams/mine", { headers: { Authorization: "Bearer invalid" } });
  assert.equal(response.status, 401);
});
test("existing health endpoint remains available", async () => {
  const response = await fetch(base + "/health");
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: "ok" });
});
