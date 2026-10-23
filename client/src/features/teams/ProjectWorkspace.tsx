import { useEffect, useRef, useState } from "react";
import { Alert, Button } from "../../components/Primitives";
import { useAuth } from "../../contexts/AuthContext";
import { entityId, type Project } from "../../types";
import { DiscussionBoard } from "../discussions/DiscussionBoard";
import { ActivityTimeline } from "./ActivityTimeline";
import { StatusControls } from "./StatusControls";
import { TeamPanel } from "./TeamPanel";
import { errorMessage, teamApi, type Activity, type PublicMember } from "./api";
import "./workspace.css";

export function ProjectWorkspace({ project, onProjectChange }: { project: Project; onProjectChange: (project: Project) => void }) {
  const { user } = useAuth();
  const id = entityId(project);
  const userId = user ? entityId(user) : "";
  const ownerId = typeof project.ownerId === "string" ? project.ownerId : entityId(project.ownerId);
  const isOwner = ownerId === userId;
  const isMember = Boolean(userId && project.memberIds.includes(userId));
  const [members, setMembers] = useState<PublicMember[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [memberError, setMemberError] = useState("");
  const [activityError, setActivityError] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);
  const [revision, setRevision] = useState(0);
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setMemberError(""); setActivityError("");
    void Promise.all([
      teamApi.project(id, controller.signal).then((result) => { if (!controller.signal.aborted) onProjectChange(result.project); }).catch((caught: unknown) => { if (!controller.signal.aborted) setMemberError(errorMessage(caught)); }),
      teamApi.members(id, controller.signal).then((result) => { if (!controller.signal.aborted) setMembers(result.members); }).catch((caught: unknown) => { if (!controller.signal.aborted) setMemberError(errorMessage(caught)); }),
      teamApi.activity(id, controller.signal).then((result) => { if (!controller.signal.aborted) setActivities(result.activities); }).catch((caught: unknown) => { if (!controller.signal.aborted) setActivityError(errorMessage(caught)); }),
    ]).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [id, revision, onProjectChange]);
  async function mutate(status?: Project["status"]) {
    setBusy(true); setError(""); setSuccess("");
    try {
      const result = status ? await teamApi.status(id, status) : await teamApi.membership(id, isMember);
      if (!mounted.current) return;
      onProjectChange(result.project); setSuccess(result.message); setRevision((value) => value + 1);
    } catch (caught) { if (mounted.current) { setError(errorMessage(caught)); setRevision((value) => value + 1); } }
    finally { if (mounted.current) setBusy(false); }
  }
  return <div className="workspace-stack">
    {error && <Alert>{error}</Alert>}{success && <Alert kind="success">{success}</Alert>}
    <TeamPanel project={project} members={members} ownerId={ownerId} authenticated={Boolean(user)} isMember={isMember} isOwner={isOwner} loading={loading} error={memberError} busy={busy} onMembership={() => void mutate()} />
    <section className="content-card workspace-section" aria-labelledby="progress-heading"><div className="section-heading"><h2 id="progress-heading">Project progress</h2><Button variant="text" disabled={loading || busy} onClick={() => setRevision((value) => value + 1)}>Refresh activity</Button></div>
      {isOwner ? <StatusControls project={project} busy={busy} onChange={(status) => void mutate(status)} /> : <p className="muted">Only the project owner can update status.</p>}
      <ActivityTimeline project={project} activities={activities} loading={loading} error={activityError} />
    </section>
    <DiscussionBoard key={`${id}:${userId}:${isMember}`} projectId={id} isMember={isMember} />
  </div>;
}
