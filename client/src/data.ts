// All data in this app is fictional. There are no accounts or server requests.
export type ProjectStatus = "idea" | "forming" | "in_progress" | "completed";

export interface Project {
  id: string;
  title: string;
  description: string;
  requiredSkills: string[];
  owner: string;
  members: string[];
  maxMembers: number;
  status: ProjectStatus;
}

export const demoStudent = "Demo Student";
export const statusLabels: Record<ProjectStatus, string> = {
  idea: "Idea", forming: "Forming a team", in_progress: "In progress", completed: "Completed",
};
const storageKey = "campusconnect.demo.projects.v1";

export const sampleProjects: Project[] = [
  {
    id: "campus-events", title: "Campus Events Board",
    description: "A simple website to display upcoming college events in one place. Students can browse workshops, club meetings and competitions without missing an announcement.",
    requiredSkills: ["HTML", "CSS", "JavaScript"], owner: "Aarav", members: ["Aarav", "Diya"], maxMembers: 4, status: "forming",
  },
  {
    id: "study-buddy", title: "Study Buddy",
    description: "Build a small study planner that helps students organise subjects, set daily goals and keep track of assignments. Start with a weekly timetable and a checklist.",
    requiredSkills: ["React", "CSS"], owner: "Meera", members: ["Meera"], maxMembers: 3, status: "idea",
  },
  {
    id: "canteen-menu", title: "Digital Canteen Menu",
    description: "A mobile-friendly menu for our college canteen, with food categories, prices and daily specials. This sample team is full, so you can try the capacity restriction.",
    requiredSkills: ["HTML", "CSS"], owner: "Rohan", members: ["Rohan", "Ananya"], maxMembers: 2, status: "in_progress",
  },
];

// Check saved data before using it, so an invalid localStorage value cannot break the page.
function isProject(value: unknown): value is Project {
  if (typeof value !== "object" || value === null) return false;
  const project = value as Project;
  return typeof project.id === "string" && typeof project.title === "string"
    && typeof project.description === "string" && typeof project.owner === "string"
    && Array.isArray(project.requiredSkills) && project.requiredSkills.every((skill) => typeof skill === "string")
    && Array.isArray(project.members) && project.members.every((member) => typeof member === "string")
    && Number.isInteger(project.maxMembers) && project.maxMembers >= 1 && project.maxMembers <= 20
    && Object.prototype.hasOwnProperty.call(statusLabels, project.status);
}

export function loadProjects(): Project[] {
  try {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      const projects: unknown = JSON.parse(saved);
      if (Array.isArray(projects) && projects.every(isProject)) return projects;
    }
  } catch { /* Use sample data if storage is blocked or invalid. */ }
  return sampleProjects;
}

export function saveProjects(projects: Project[]): boolean {
  try {
    localStorage.setItem(storageKey, JSON.stringify(projects));
    return true;
  } catch {
    return false;
  }
}
