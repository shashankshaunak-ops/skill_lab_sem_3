import { Link } from "react-router-dom";
import type { Project } from "../data";
import { SkillList, StatusBadge } from "./Primitives";

export function ProjectCard({ project }: { project: Project }) {
  return <article className="content-card project-card">
    <div className="card-topline"><StatusBadge status={project.status} /><span className="muted">by {project.owner}</span></div>
    <h2><Link to={`/projects/${project.id}`}>{project.title}</Link></h2>
    <p className="clamp-copy">{project.description}</p>
    <div className="card-section"><span className="eyebrow">Looking for</span><SkillList skills={project.requiredSkills} /></div>
    <div className="card-footer"><span className="muted">{project.members.length}/{project.maxMembers} members</span><Link className="arrow-link" to={`/projects/${project.id}`}>View project →</Link></div>
  </article>;
}
