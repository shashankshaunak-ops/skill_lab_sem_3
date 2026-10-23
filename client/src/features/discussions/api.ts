import { api } from "../../lib/api";
import type { PublicMember } from "../teams/api";

export interface DiscussionMessage { _id: string; authorId: PublicMember | null; content: string; createdAt: string; }
export const discussionApi = {
  list: (id: string, signal?: AbortSignal) => api<{ messages: DiscussionMessage[] }>(`/projects/${id}/messages`, { signal }),
  post: (id: string, content: string) => api<{ message: DiscussionMessage }>(`/projects/${id}/messages`, { method: "POST", body: JSON.stringify({ content }) }),
};
