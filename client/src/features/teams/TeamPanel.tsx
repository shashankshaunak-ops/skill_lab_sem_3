import { Link } from "react-router-dom";
import { Alert, Button, Loading } from "../../components/Primitives";
import type { Project } from "../../types";
import type { PublicMember } from "./api";

interface Props {
  project: Project; members: PublicMember[]; ownerId: string; authenticated: boolean;
  isMember: boolean; isOwner: boolean; busy: boolean; loading: boolean; error: string;
  onMembership: () => void;
}
export function TeamPanel({ project, members, ownerId, authenticated, isMember, isOwner, busy, loading, error, onMembership }: Props) {
  const available = Math.max(0, project.maxMembers - project.memberIds.length);
  return <section className="content-card workspace-section" aria-labelledby="team-heading">
    <div className="section-heading"><div><span className="eyebrow">Project workspace</span><h2 id="team-heading">Team members</h2></div><span className="muted">{project.memberIds.length}/{project.maxMembers} members · {available} places available</span></div>
    {loading ? <Loading label="Loading team members..." /> : error ? <Alert>{error}</Alert> : <ul className="workspace-list">{members.map((member) => <li key={member._id} className="workspace-member"><Link className="text-link" to={`/students/${member._id}`}>{member.name}</Link><span className="muted">{member._id === ownerId ? "Owner" : "Member"}</span></li>)}</ul>}
    {!authenticated ? <Link className="button button--primary" to="/login" state={{ from: `/projects/${project._id ?? project.id}` }}>Log in to join</Link>
      : isOwner ? <p className="muted">You own this project and are already a member. Owners cannot leave their team.</p>
      : isMember ? <p className="muted">You belong to this team.</p> : null}
    {authenticated && isMember && !isOwner && <Button variant="secondary" disabled={busy} onClick={onMembership}>{busy ? "Updating..." : "Leave team"}</Button>}
    {authenticated && !isMember && <Button disabled={busy || !available || project.status === "completed"} onClick={onMembership}>{busy ? "Joining..." : project.status === "completed" ? "This project is completed" : !available ? "Team is full" : "Join team"}</Button>}
  </section>;
}
