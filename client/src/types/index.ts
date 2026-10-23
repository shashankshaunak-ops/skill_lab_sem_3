export interface Student {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  bio: string;
  skills: string[];
  avatarUrl?: string;
  createdAt?: string;
}

export interface Project {
  id?: string;
  _id?: string;
  title: string;
  description: string;
  tags: string[];
  requiredSkills: string[];
  ownerId: string | { id?: string; _id?: string; name: string };
  memberIds: string[];
  maxMembers: number;
  status: "idea" | "forming" | "in_progress" | "completed";
  statusUpdatedAt: string;
  createdAt: string;
  updatedAt: string;
}

export function entityId(entity: { id?: string; _id?: string }): string {
  return entity.id ?? entity._id ?? "";
}
