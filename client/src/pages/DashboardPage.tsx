import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ProjectCard } from "../components/ProjectCard";
import { Alert, Button, Loading } from "../components/Primitives";
import { useAuth } from "../contexts/AuthContext";
import { api, ApiError } from "../lib/api";
import type { Project } from "../types";

export function DashboardPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api<{ projects: Project[] }>("/projects")
      .then((result) => setProjects(result.projects.slice(0, 3)))
      .catch((caught: unknown) => setError(caught instanceof ApiError ? caught.message : "Projects could not be loaded."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-narrow">
      <section className="welcome-banner">
        <div><span className="eyebrow light-eyebrow">Your CampusConnect</span><h1>Good to see you, {user?.name.split(" ")[0]}.</h1><p>What would you like to make happen today?</p></div>
        <Link className="button button--light" to="/projects/new">Share an idea <span aria-hidden="true">＋</span></Link>
      </section>
      <section className="quick-actions">
        <Link className="quick-action" to="/profile"><span>01</span><strong>Build your profile</strong><small>Let collaborators know what you’re good at</small><b aria-hidden="true">↗</b></Link>
        <Link className="quick-action" to="/discover"><span>02</span><strong>Find teammates</strong><small>Search students by skills and interests</small><b aria-hidden="true">↗</b></Link>
        <Link className="quick-action" to="/projects"><span>03</span><strong>Explore project ideas</strong><small>See what the campus is dreaming up</small><b aria-hidden="true">↗</b></Link>
      </section>
      <div className="section-heading"><div><span className="eyebrow">Fresh from the community</span><h2>Ideas to explore</h2></div><Link className="arrow-link" to="/projects">All ideas <span aria-hidden="true">→</span></Link></div>
      {loading && <Loading label="Finding project ideas..." />}
      {error && <Alert>{error}</Alert>}
      {!loading && !error && projects.length === 0 && <div className="empty-state"><h3>Start the first conversation.</h3><p>No ideas have been shared yet. Put yours out there.</p><Link to="/projects/new"><Button>Share an idea</Button></Link></div>}
      {!loading && projects.length > 0 && <div className="project-grid">{projects.map((project) => <ProjectCard key={project.id ?? project._id} project={project} />)}</div>}
    </div>
  );
}
