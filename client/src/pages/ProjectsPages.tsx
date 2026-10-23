import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ProjectCard } from "../components/ProjectCard";
import { Alert, Button, Loading, SkillList, StatusBadge } from "../components/Primitives";
import { api, ApiError } from "../lib/api";
import type { Project } from "../types";
import { entityId } from "../types";

function messageFor(error: unknown): string {
  return error instanceof ApiError ? error.message : "The request could not be completed.";
}

export function ProjectsPage() {
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState("");
  const [skill, setSkill] = useState("");
  const [status, setStatus] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function search(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    setLoading(true);
    setError("");
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (tag.trim()) params.set("tag", tag.trim());
    if (skill.trim()) params.set("skill", skill.trim());
    if (status) params.set("status", status);
    try {
      const result = await api<{ projects: Project[] }>(`/projects${params.size ? `?${params}` : ""}`);
      setProjects(result.projects);
    } catch (caught) {
      setError(messageFor(caught));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void search(); }, []);

  return (
    <div className="page-narrow">
      <div className="page-title page-title--row"><div><span className="eyebrow">Campus idea board</span><h1>Good ideas start here.</h1><p>Find a project to join or share the one you can’t stop thinking about.</p></div><Link className="button button--primary" to="/projects/new">Share an idea <span aria-hidden="true">＋</span></Link></div>
      <form className="filter-panel" onSubmit={search}>
        <label className="filter-search">Search ideas<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Title or description" /></label>
        <label>Tag<input value={tag} onChange={(event) => setTag(event.target.value)} placeholder="e.g. sustainability" /></label>
        <label>Skill needed<input value={skill} onChange={(event) => setSkill(event.target.value)} placeholder="e.g. React" /></label>
        <label>Status<select value={status} onChange={(event) => setStatus(event.target.value)}><option value="">Any status</option><option value="idea">Idea</option><option value="forming">Forming a team</option><option value="in_progress">In progress</option><option value="completed">Completed</option></select></label>
        <Button type="submit">Search</Button>
      </form>
      {error && <Alert>{error}</Alert>}
      {loading ? <Loading label="Finding project ideas..." /> : (
        projects.length
          ? <div className="project-grid">{projects.map((project) => <ProjectCard key={entityId(project)} project={project} />)}</div>
          : !error && <div className="empty-state"><h2>No ideas match those filters.</h2><p>Try a different search, or share a new idea with your campus.</p><Link to="/projects/new"><Button>Share an idea</Button></Link></div>
      )}
    </div>
  );
}

export function CreateProjectPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [skills, setSkills] = useState("");
  const [maxMembers, setMaxMembers] = useState("5");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const result = await api<{ project: Project }>("/projects", {
        method: "POST",
        body: JSON.stringify({
          title,
          description,
          tags: tags.split(",").map((tag) => tag.trim()).filter(Boolean),
          requiredSkills: skills.split(",").map((skill) => skill.trim()).filter(Boolean),
          maxMembers: Number(maxMembers),
        }),
      });
      navigate(`/projects/${entityId(result.project)}`);
    } catch (caught) {
      setError(messageFor(caught));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page-narrow">
      <div className="page-title"><span className="eyebrow">Put it out there</span><h1>Share a project idea</h1><p>Every great collaboration starts with an invitation.</p></div>
      <form className="content-card form-stack edit-form" onSubmit={handleSubmit}>
        {error && <Alert>{error}</Alert>}
        <label>Project title<input value={title} onChange={(event) => setTitle(event.target.value)} required minLength={3} maxLength={120} placeholder="Give your idea a name" /></label>
        <label>What do you want to build?<textarea value={description} onChange={(event) => setDescription(event.target.value)} required minLength={10} maxLength={5000} rows={7} placeholder="Describe the problem, your idea, and what you hope to make..." /></label>
        <label>Tags <span className="field-help">Separate tags with commas.</span><input value={tags} onChange={(event) => setTags(event.target.value)} placeholder="education, sustainability, mobile app" /></label>
        <label>Skills you’re looking for <span className="field-help">Separate skills with commas.</span><input value={skills} onChange={(event) => setSkills(event.target.value)} placeholder="React, Python, UI/UX" /></label>
        <label>Maximum team size<input type="number" value={maxMembers} onChange={(event) => setMaxMembers(event.target.value)} required min={1} max={20} /></label>
        <p className="field-help">Your account will be added as the project owner and first member. The project will start with “Idea” status.</p>
        <div className="form-actions"><Link className="button button--secondary" to="/projects">Cancel</Link><Button type="submit" disabled={busy}>{busy ? "Sharing..." : "Share idea"}</Button></div>
      </form>
    </div>
  );
}

export function ProjectDetailPage() {
  const { id } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    api<{ project: Project }>(`/projects/${encodeURIComponent(id ?? "")}`)
      .then((result) => setProject(result.project))
      .catch((caught: unknown) => setError(messageFor(caught)))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="page-narrow"><Loading label="Loading project idea..." /></div>;
  if (!project) return <div className="page-narrow"><Alert>{error || "The project idea could not be found."}</Alert><Link className="arrow-link" to="/projects">← Browse all ideas</Link></div>;

  const owner = typeof project.ownerId === "string" ? null : project.ownerId;
  const ownerId = owner ? entityId(owner) : "";
  return (
    <div className="page-narrow">
      <Link className="arrow-link back-link" to="/projects">← All project ideas</Link>
      <article className="project-detail">
        <div className="detail-topline"><StatusBadge status={project.status} /><span className="muted">Shared {new Date(project.createdAt).toLocaleDateString()}</span></div>
        <h1>{project.title}</h1>
        <p className="detail-owner">Started by {owner ? <Link to={`/students/${ownerId}`}>{owner.name}</Link> : "a campus student"}</p>
        <div className="detail-copy">{project.description}</div>
        <div className="detail-metadata">
          <section><span className="eyebrow">Skills we’re looking for</span><SkillList skills={project.requiredSkills} /></section>
          <section><span className="eyebrow">Topics</span><SkillList skills={project.tags} /></section>
          <section><span className="eyebrow">Team size</span><p>{project.memberIds.length} of {project.maxMembers} members</p></section>
        </div>
      </article>
      <section className="phase-two-slot">
        <span className="eyebrow">Project workspace</span>
        <p>Team membership, project updates, and discussions can be added here in Phase 2.</p>
      </section>
    </div>
  );
}
