import { useEffect, useState, type FormEvent } from "react";
import { Link, Navigate, NavLink, Route, Routes, useNavigate, useParams } from "react-router-dom";
import { Alert, Button, SkillList, StatusBadge } from "./components/Primitives";
import { ProjectCard } from "./components/ProjectCard";
import { demoStudent, loadProjects, saveProjects, statusLabels, type Project, type ProjectStatus } from "./data";

// App owns the data. Pages receive it through props and send changes back with callbacks.
export default function App() {
  const [projects, setProjects] = useState<Project[]>(loadProjects);
  const [storageError, setStorageError] = useState(false);

  useEffect(() => {
    setStorageError(!saveProjects(projects));
  }, [projects]);

  function updateProject(updated: Project) {
    setProjects((current) => current.map((project) => project.id === updated.id ? updated : project));
  }

  return <div className="app-shell">
    <header className="site-header"><div className="header-inner">
      <Link className="brand" to="/projects">Campus<span>Connect</span></Link>
      <nav className="main-nav" aria-label="Main navigation"><NavLink to="/projects" end>Projects</NavLink><NavLink to="/projects/new">Create project</NavLink></nav>
      <span className="muted">Course demo</span>
    </div></header>
    <main className="page-content"><div className="page-narrow">
      <p className="demo-notice">Demo only · You are trying this website as <strong>{demoStudent}</strong>. Changes are saved in this browser, not on a server.</p>
      {storageError && <Alert>Browser storage is unavailable. You can still try the demo, but changes will be lost when you reload.</Alert>}
      <Routes>
        <Route path="/" element={<Navigate to="/projects" replace />} />
        <Route path="/projects" element={<ProjectsPage projects={projects} />} />
        <Route path="/projects/new" element={<CreateProjectPage onCreate={(project) => setProjects((current) => [...current, project])} />} />
        <Route path="/projects/:id" element={<ProjectDetailPage projects={projects} onUpdate={updateProject} />} />
        <Route path="*" element={<div className="empty-state"><h1>Page not found</h1><Link className="arrow-link" to="/projects">Back to projects</Link></div>} />
      </Routes>
    </div></main>
    <footer className="site-footer"><span>CampusConnect</span><span>A simple Skill Lab project.</span></footer>
  </div>;
}

function ProjectsPage({ projects }: { projects: Project[] }) {
  const [search, setSearch] = useState("");
  const visibleProjects = projects.filter((project) => `${project.title} ${project.description} ${project.requiredSkills.join(" ")}`.toLowerCase().includes(search.toLowerCase().trim()));
  return <>
    <div className="page-title page-title--row"><div><span className="eyebrow">Campus idea board</span><h1>Good ideas start here.</h1><p>Explore sample ideas, try joining a team, or share your own project.</p></div><Link className="button button--primary" to="/projects/new">Create project</Link></div>
    <label className="search-field">Search projects<input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by title or skill" type="search" /></label>
    {visibleProjects.length ? <div className="project-grid">{visibleProjects.map((project) => <ProjectCard key={project.id} project={project} />)}</div> : <div className="empty-state"><h2>No projects found.</h2><p>Try another search or create a new project.</p></div>}
  </>;
}

function ProjectDetailPage({ projects, onUpdate }: { projects: Project[]; onUpdate: (project: Project) => void }) {
  const { id } = useParams();
  const project = projects.find((item) => item.id === id);
  const [notice, setNotice] = useState("");
  useEffect(() => setNotice(""), [id]);
  if (!project) return <div className="empty-state"><h1>Project not found</h1><Link className="arrow-link" to="/projects">Back to projects</Link></div>;

  const isMember = project.members.includes(demoStudent);
  const isOwner = project.owner === demoStudent;
  const isFull = project.members.length >= project.maxMembers;

  function toggleMembership() {
    if (!project || isOwner) return;
    if (!isMember && (isFull || project.status === "completed")) return;
    const members = isMember ? project.members.filter((name) => name !== demoStudent) : [...project.members, demoStudent];
    onUpdate({ ...project, members });
    setNotice(isMember ? "You left the demo team." : "You joined the demo team.");
  }

  return <>
    <Link className="arrow-link back-link" to="/projects">← All projects</Link>
    <article className="project-detail">
      <StatusBadge status={project.status} /><h1>{project.title}</h1><p className="muted">Started by {project.owner}</p>
      <p className="detail-copy">{project.description}</p>
      <section className="detail-metadata"><div><span className="eyebrow">Skills we’re looking for</span><SkillList skills={project.requiredSkills} /></div><div><span className="eyebrow">Team size</span><p>{project.members.length} of {project.maxMembers} members</p></div></section>
    </article>
    <section className="content-card team-section"><h2>Project team</h2>
      <ul className="member-list">{project.members.map((name) => <li key={name}><span>{name}</span><span className="muted">{name === project.owner ? "Owner" : "Member"}</span></li>)}</ul>
      {notice && <Alert kind="success">{notice}</Alert>}
      {isOwner ? <p className="muted">You created this project and are already on its team.</p> : <Button variant={isMember ? "secondary" : "primary"} onClick={toggleMembership} disabled={!isMember && (isFull || project.status === "completed")}>{isMember ? "Leave team" : project.status === "completed" ? "Project completed" : isFull ? "Team is full" : "Join team"}</Button>}
      <div className="status-control"><label>Project status<select value={project.status} onChange={(event) => { onUpdate({ ...project, status: event.target.value as ProjectStatus }); setNotice("Project status updated."); }}>{(Object.keys(statusLabels) as ProjectStatus[]).map((status) => <option key={status} value={status}>{statusLabels[status]}</option>)}</select></label><p className="field-help">For this demo, you can change any project’s status. No login or permissions are needed.</p></div>
    </section>
  </>;
}

function CreateProjectPage({ onCreate }: { onCreate: (project: Project) => void }) {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const title = String(form.get("title") ?? "").trim();
    const description = String(form.get("description") ?? "").trim();
    const maxMembers = Number(form.get("maxMembers"));
    if (title.length < 3 || description.length < 10 || !Number.isInteger(maxMembers) || maxMembers < 1 || maxMembers > 20) {
      setError("Use a title of at least 3 characters, a description of at least 10 characters, and a team size from 1 to 20."); return;
    }
    const project: Project = {
      id: crypto.randomUUID(), title, description,
      requiredSkills: [...new Set(String(form.get("skills") ?? "").split(",").map((skill) => skill.trim()).filter(Boolean))],
      owner: demoStudent, members: [demoStudent], maxMembers, status: "idea",
    };
    onCreate(project);
    navigate(`/projects/${project.id}`);
  }
  return <>
    <div className="page-title"><span className="eyebrow">Put it out there</span><h1>Create a project</h1><p>A small idea is a good place to start.</p></div>
    <form className="content-card form-stack" onSubmit={submit}>
      {error && <Alert>{error}</Alert>}
      <label>Project title<input name="title" required minLength={3} maxLength={120} placeholder="Give your idea a name" /></label>
      <label>Description<textarea name="description" required minLength={10} maxLength={2000} rows={5} placeholder="What would you like to build?" /></label>
      <label>Skills (comma-separated)<input name="skills" maxLength={200} placeholder="HTML, CSS, React" /></label>
      <label>Maximum team size<input name="maxMembers" type="number" min={1} max={20} defaultValue={4} required /></label>
      <p className="field-help">The project starts as an Idea, with Demo Student as its owner and first member.</p>
      <div className="form-actions"><Link className="button button--secondary" to="/projects">Cancel</Link><Button type="submit">Create project</Button></div>
    </form>
  </>;
}
