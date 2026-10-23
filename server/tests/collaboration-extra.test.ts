import assert from "node:assert/strict";
import { afterEach, mock, test } from "node:test";
import { Types } from "mongoose";
import { Project } from "../src/models/Project.js";
import { User } from "../src/models/User.js";
import { DiscussionMessage } from "../src/models/DiscussionMessage.js";
import { ProjectActivity } from "../src/models/ProjectActivity.js";
import { changeStatus, getProject, leaveTeam, TeamError } from "../src/services/team.service.js";
import { listMessages, postMessage } from "../src/services/discussion.service.js";

const ownerId = new Types.ObjectId();
const memberId = new Types.ObjectId();
const id = new Types.ObjectId().toString();
afterEach(() => mock.restoreAll());
test("User serialization excludes password hash and database version", () => {
  const user = new User({ name: "Safe User", email: "safe@example.test", passwordHash: "not-a-real-hash" });
  const json = user.toJSON();
  assert.equal("passwordHash" in json, false);
  assert.equal("__v" in json, false);
  assert.equal(json.name, "Safe User");
});
test("missing project returns a clear 404", async () => {
  mock.method(Project, "findById", async () => null as never);
  await assert.rejects(getProject(id), (error: unknown) => error instanceof TeamError && error.status === 404);
});
test("member leave uses atomic membership and owner guards", async () => {
  const update = mock.method(Project, "findOneAndUpdate", async () => ({ populate: async () => ({ memberIds: [ownerId] }) }) as never);
  await leaveTeam(id, memberId.toString());
  const [filter, operation] = update.mock.calls[0].arguments as unknown as [Record<string, unknown>, Record<string, unknown>];
  assert.deepEqual(filter.ownerId, { $ne: memberId.toString() });
  assert.equal(filter.memberIds, memberId.toString());
  assert.ok("$pull" in operation);
});
test("member post stores trimmed content with trusted actor and safe projection", async () => {
  mock.method(Project, "findById", async () => ({ memberIds: [ownerId, memberId] }) as never);
  let projection = "";
  const create = mock.method(DiscussionMessage, "create", async () => ({ populate: async (_path: string, fields: string) => { projection = fields; return { content: "Hello" }; } }) as never);
  await postMessage(id, memberId.toString(), { content: "  Hello  " });
  assert.deepEqual(create.mock.calls[0].arguments[0], { projectId: id, authorId: memberId.toString(), content: "Hello" });
  assert.equal(projection, "name bio skills avatarUrl");
});
test("message list uses safe projection, deterministic order and latest 100", async () => {
  mock.method(Project, "findById", async () => ({ memberIds: [memberId] }) as never);
  let order: unknown;
  let cap = 0;
  mock.method(DiscussionMessage, "find", () => ({ populate: (_field: string, fields: string) => {
    assert.equal(fields, "name bio skills avatarUrl");
    return { sort: (value: unknown) => { order = value; return { limit: async (value: number) => { cap = value; return [{ content: "new" }, { content: "old" }]; } }; } };
  } }) as never);
  const result = await listMessages(id, memberId.toString());
  assert.deepEqual(order, { createdAt: -1, _id: -1 }); assert.equal(cap, 100);
  assert.equal(result[0].content, "old");
});
test("legacy status timestamp matches absent stored field without rewriting model", async () => {
  const snapshot = { ownerId, memberIds: [ownerId], status: "idea", statusUpdatedAt: new Date(0), $isDefault: () => true };
  const query = { populate: () => ({ orFail: async () => ({ ...snapshot, status: "forming" }) }), then: (resolve: (value: unknown) => unknown) => Promise.resolve(snapshot).then(resolve) };
  mock.method(Project, "findById", () => query as never);
  const update = mock.method(Project, "findOneAndUpdate", async () => snapshot as never);
  mock.method(ProjectActivity, "create", async () => ({}) as never);
  await changeStatus(id, ownerId.toString(), "forming");
  const filter = update.mock.calls[0].arguments[0] as unknown as Record<string, unknown>;
  assert.deepEqual(filter.statusUpdatedAt, { $exists: false });
});
