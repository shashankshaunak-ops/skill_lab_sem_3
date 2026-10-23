import assert from "node:assert/strict";
import { afterEach, test, mock } from "node:test";
import { Types } from "mongoose";
import { Project } from "../src/models/Project.js";
import { ProjectActivity } from "../src/models/ProjectActivity.js";
import { DiscussionMessage } from "../src/models/DiscussionMessage.js";
import { changeStatus, joinTeam, leaveTeam, projectId, requireMember, statusSchema, TeamError } from "../src/services/team.service.js";
import { listMessages, messageSchema, postMessage } from "../src/services/discussion.service.js";

const owner = new Types.ObjectId();
const student = new Types.ObjectId();
const id = new Types.ObjectId().toString();
function current(overrides = {}) {
  return { _id: id, ownerId: owner, memberIds: [owner], maxMembers: 2, status: "idea", statusUpdatedAt: new Date(0), ...overrides };
}
function failure(status: number, text: RegExp) {
  return (error: unknown) => error instanceof TeamError && error.status === status && text.test(error.message);
}
afterEach(() => mock.restoreAll());
test("validates IDs, statuses, and trimmed message bounds", () => {
  assert.throws(() => projectId("not-an-id"));
  assert.equal(projectId(id), id);
  assert.throws(() => statusSchema.parse("archived"));
  assert.throws(() => messageSchema.parse({ content: "   " }));
  assert.throws(() => messageSchema.parse({ content: "x".repeat(2001) }));
  assert.throws(() => messageSchema.parse({ content: "ok", authorId: owner }));
  assert.equal(messageSchema.parse({ content: " hello " }).content, "hello");
});
test("join uses atomic capacity, status, and duplicate predicates", async () => {
  const updated = { ...current(), populate: async () => current() };
  const update = mock.method(Project, "findOneAndUpdate", async () => updated as never);
  await joinTeam(id, student.toString());
  const [filter, operation] = update.mock.calls[0].arguments as unknown as [Record<string, unknown>, Record<string, unknown>];
  assert.deepEqual(filter.memberIds, { $ne: student.toString() });
  assert.deepEqual(filter.status, { $ne: "completed" });
  assert.deepEqual(filter.$expr, { $lt: [{ $size: { $ifNull: ["$memberIds", []] } }, "$maxMembers"] });
  assert.ok("$addToSet" in operation);
});
for (const [name, snapshot, pattern] of [
  ["duplicate", current({ memberIds: [owner, student] }), /already belong/],
  ["owner", current(), /already belong/],
  ["full", current({ maxMembers: 1 }), /full/],
  ["completed", current({ status: "completed" }), /Completed/],
] as const) {
  test(`join rejects ${name}`, async () => {
    mock.method(Project, "findOneAndUpdate", async () => null as never);
    mock.method(Project, "findById", async () => snapshot as never);
    await assert.rejects(joinTeam(id, name === "owner" ? owner.toString() : student.toString()), failure(409, pattern));
  });
}
test("owner cannot leave and nonmember cannot leave", async () => {
  mock.method(Project, "findOneAndUpdate", async () => null as never);
  mock.method(Project, "findById", async () => current() as never);
  await assert.rejects(leaveTeam(id, owner.toString()), failure(403, /owner cannot leave/));
  await assert.rejects(leaveTeam(id, student.toString()), failure(409, /do not belong/));
});
test("nonmember cannot read or post discussion", async () => {
  mock.method(Project, "findById", async () => current() as never);
  const create = mock.method(DiscussionMessage, "create", async () => { throw new Error("must not write"); });
  await assert.rejects(requireMember(id, student.toString()), failure(403, /Only project team members/));
  await assert.rejects(listMessages(id, student.toString()), failure(403, /Only project team members/));
  await assert.rejects(postMessage(id, student.toString(), { content: "hello" }), failure(403, /Only project team members/));
  assert.equal(create.mock.callCount(), 0);
});
test("non-owner cannot update status", async () => {
  mock.method(Project, "findById", async () => current() as never);
  await assert.rejects(changeStatus(id, student.toString(), "forming"), failure(403, /Only the project owner/));
});
test("completed and redundant status changes are rejected", async () => {
  mock.method(Project, "findById", async () => current({ status: "completed" }) as never);
  await assert.rejects(changeStatus(id, owner.toString(), "idea"), failure(409, /cannot be reopened/));
  await assert.rejects(changeStatus(id, owner.toString(), "completed"), failure(409, /already has/));
});
test("status compare-and-set rejects a competing update", async () => {
  mock.method(Project, "findById", async () => current() as never);
  mock.method(Project, "findOneAndUpdate", async () => null as never);
  await assert.rejects(changeStatus(id, owner.toString(), "forming"), failure(409, /project changed/));
});
test("status change records actor and transition and reloads project", async () => {
  const snapshot = current();
  const query = { populate: () => ({ orFail: async () => ({ ...snapshot, status: "forming" }) }), then: (resolve: (value: unknown) => unknown) => Promise.resolve(snapshot).then(resolve) };
  mock.method(Project, "findById", () => query as never);
  mock.method(Project, "findOneAndUpdate", async () => ({ ...snapshot, status: "forming" }) as never);
  const create = mock.method(ProjectActivity, "create", async () => ({}) as never);
  const result = await changeStatus(id, owner.toString(), "forming");
  assert.equal(result.status, "forming");
  const record = create.mock.calls[0].arguments[0] as unknown as Record<string, unknown>;
  assert.equal(record.previousStatus, "idea"); assert.equal(record.newStatus, "forming");
  assert.equal(record.actorId, owner.toString()); assert.ok(record.createdAt instanceof Date);
});
test("history failure attempts conditional rollback", async () => {
  mock.method(Project, "findById", async () => current() as never);
  mock.method(Project, "findOneAndUpdate", async () => current({ status: "forming" }) as never);
  mock.method(ProjectActivity, "create", async () => { throw new Error("history unavailable"); });
  const rollback = mock.method(Project, "updateOne", async () => ({}) as never);
  await assert.rejects(changeStatus(id, owner.toString(), "forming"), /history unavailable/);
  assert.equal(rollback.mock.callCount(), 1);
});
