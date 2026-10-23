import type { ButtonHTMLAttributes, ReactNode } from "react";
import { statusLabels, type ProjectStatus } from "../data";

export function Button({ children, variant = "primary", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" }) {
  return <button {...props} className={`button button--${variant}`}>{children}</button>;
}

export function Alert({ children, kind = "error" }: { children: ReactNode; kind?: "error" | "success" }) {
  return <div className={`alert alert--${kind}`} role="status">{children}</div>;
}

export function StatusBadge({ status }: { status: ProjectStatus }) {
  return <span className={`status-badge status-badge--${status}`}>{statusLabels[status]}</span>;
}

export function SkillList({ skills }: { skills: string[] }) {
  return skills.length ? <div className="tag-list">{skills.map((skill) => <span className="tag" key={skill}>{skill}</span>)}</div> : <span className="muted">No specific skills needed</span>;
}
