import type { ButtonHTMLAttributes, ReactNode } from "react";
import type { Project } from "../types";

export function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "secondary" | "text";
}) {
  return (
    <button className={`button button--${variant} ${className}`.trim()} {...props}>
      {children}
    </button>
  );
}

export function Alert({ children, kind = "error" }: { children: ReactNode; kind?: "error" | "success" }) {
  return <div className={`alert alert--${kind}`} role="status">{children}</div>;
}

export function Loading({ label = "Loading..." }: { label?: string }) {
  return <p className="muted" role="status">{label}</p>;
}

const statusLabels: Record<Project["status"], string> = {
  idea: "Idea",
  forming: "Forming a team",
  in_progress: "In progress",
  completed: "Completed",
};

export function StatusBadge({ status }: { status: Project["status"] }) {
  return <span className={`status-badge status-badge--${status}`}>{statusLabels[status]}</span>;
}

export function SkillList({ skills }: { skills: string[] }) {
  if (!skills.length) return <span className="muted">No skills added yet</span>;
  return (
    <div className="tag-list">
      {skills.map((skill) => <span className="tag" key={skill}>{skill}</span>)}
    </div>
  );
}
