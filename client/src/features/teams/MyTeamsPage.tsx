import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Alert, Button, Loading } from "../../components/Primitives";
import { ProjectCard } from "../../components/ProjectCard";
import { entityId, type Project } from "../../types";
import { errorMessage, teamApi } from "./api";

export function MyTeamsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError("");
    teamApi.mine(controller.signal).then((result) => { if (!controller.signal.aborted) setProjects(result.projects); })
      .catch((caught: unknown) => { if (!controller.signal.aborted) setError(errorMessage(caught)); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [revision]);
  return <div className="page-narrow"><div className="page-title page-title--row"><div><span className="eyebrow">Your collaborations</span><h1>My Teams</h1><p>Keep building with the teams you belong to.</p></div><Button variant="secondary" disabled={loading} onClick={() => setRevision((value) => value + 1)}>Refresh</Button></div>
    {loading ? <Loading label="Loading your teams..." /> : error ? <Alert>{error}</Alert> : projects.length ? <div className="project-grid">{projects.map((project) => <ProjectCard key={entityId(project)} project={project} />)}</div> : <div className="empty-state"><h2>You haven’t joined a team yet.</h2><p>Find an idea you’d like to help build.</p><Link className="button button--primary" to="/projects">Browse project ideas</Link></div>}
  </div>;
}
