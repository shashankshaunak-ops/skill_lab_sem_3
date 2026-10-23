import { api, ApiError } from "../../lib/api";
import type { Project } from "../../types";

export interface PublicMember { _id: string; name: string; bio?: string; skills?: string[]; avatarUrl?: string; }
export interface Activity {
  _id: string;
  actorId: PublicMember | null;
  previousStatus: Project["status"];
  newStatus: Project["status"];
  createdAt: string;
}
export const statusLabels: Record<Project["status"], string> = {
  idea: "Idea", forming: "Forming a team", in_progress: "In progress", completed: "Completed",
};
export const errorMessage = (error: unknown): string => error instanceof ApiError ? error.message : "The request could not be completed. Please try again.";
export const teamApi = {
  project: (id: string, signal?: AbortSignal) => api<{ project: Project }>(`/projects/${id}`, { signal }),
  mine: (signal?: AbortSignal) => api<{ projects: Project[] }>("/teams/mine", { signal }),
  members: (id: string, signal?: AbortSignal) => api<{ members: PublicMember[]; ownerId: string }>(`/teams/${id}/members`, { signal }),
  activity: (id: string, signal?: AbortSignal) => api<{ activities: Activity[] }>(`/teams/${id}/activity`, { signal }),
  membership: (id: string, leave: boolean) => api<{ project: Project; message: string }>(`/teams/${id}/${leave ? "leave" : "join"}`, { method: leave ? "DELETE" : "POST" }),
  status: (id: string, status: Project["status"]) => api<{ project: Project; message: string }>(`/teams/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
};
