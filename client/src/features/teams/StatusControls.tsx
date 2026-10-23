import { useEffect, useState, type FormEvent } from "react";
import { Button } from "../../components/Primitives";
import type { Project } from "../../types";
import { statusLabels } from "./api";

export function StatusControls({ project, busy, onChange }: { project: Project; busy: boolean; onChange: (status: Project["status"]) => void }) {
  const [status, setStatus] = useState(project.status);
  useEffect(() => setStatus(project.status), [project.status]);
  function submit(event: FormEvent) { event.preventDefault(); onChange(status); }
  return <form className="workspace-status" onSubmit={submit}>
    <label>Project status<select value={status} disabled={busy || project.status === "completed"} onChange={(event) => setStatus(event.target.value as Project["status"])}>{(Object.keys(statusLabels) as Project["status"][]).map((value) => <option key={value} value={value}>{statusLabels[value]}</option>)}</select></label>
    <Button type="submit" disabled={busy || status === project.status || project.status === "completed"}>{busy ? "Saving..." : "Update status"}</Button>
    {project.status === "completed" && <p className="muted">Completed projects cannot be reopened.</p>}
  </form>;
}
