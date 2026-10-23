import { Alert, Loading, StatusBadge } from "../../components/Primitives";
import type { Project } from "../../types";
import type { Activity } from "./api";

export function ActivityTimeline({ project, activities, loading, error }: { project: Project; activities: Activity[]; loading: boolean; error: string }) {
  return <div><h3>Project activity</h3>
    {loading ? <Loading label="Loading project activity..." /> : error ? <Alert>{error}</Alert> : activities.length ? <ol className="workspace-list">{activities.map((activity) => <li className="activity-entry" key={activity._id}><p><strong>{activity.actorId?.name ?? "Former student"}</strong> changed <StatusBadge status={activity.previousStatus} /> to <StatusBadge status={activity.newStatus} /></p><time className="muted" dateTime={activity.createdAt}>{new Date(activity.createdAt).toLocaleString()}</time></li>)}</ol> : <p className="muted">No status changes recorded yet. Current status was set {new Date(project.statusUpdatedAt).toLocaleString()}.</p>}
  </div>;
}
