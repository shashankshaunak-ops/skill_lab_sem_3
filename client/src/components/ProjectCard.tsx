import { Link } from "react-router-dom";
import type { Project } from "../types";
import { entityId } from "../types";
import { SkillList, StatusBadge } from "./Primitives";

export function ProjectCard({ project }: { project: Project }) {
  const owner = typeof project.ownerId === "string" ? "Campus student" : project.ownerId.name;
  return (
    <article className="content-card project-card">
      <div className="card-topline"><StatusBadge status={project.status} /><span className="muted">by {owner}</span></div>
      <h3><Link to={`/projects/${entityId(project)}`}>{project.title}</Link></h3>
      <p className="clamp-copy">{project.description}</p>
      <div className="card-section">
        <span className="eyebrow">Looking for</span>
        <SkillList skills={project.requiredSkills} />
      </div>
      <div className="card-footer">
        <span className="muted">{project.memberIds.length}/{project.maxMembers} members</span>
        <Link className="arrow-link" to={`/projects/${entityId(project)}`}>View idea <span aria-hidden="true">→</span></Link>
      </div>
    </article>
  );
}
