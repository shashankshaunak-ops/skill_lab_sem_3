import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Alert, Button, Loading, SkillList } from "../components/Primitives";
import { api, ApiError } from "../lib/api";
import type { Student } from "../types";
import { entityId } from "../types";

export function DiscoverPage() {
  const [skills, setSkills] = useState("");
  const [query, setQuery] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSearched(true);
    const params = new URLSearchParams();
    if (skills.trim()) params.set("skills", skills.split(",").map((skill) => skill.trim()).filter(Boolean).join(","));
    if (query.trim()) params.set("q", query.trim());
    try {
      const result = await api<{ users: Student[] }>(`/users?${params.toString()}`);
      setStudents(result.users);
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Student profiles could not be loaded.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-narrow">
      <div className="page-title"><span className="eyebrow">People make the project</span><h1>Find your kind of curious.</h1><p>Look for students with the skills your project needs, or discover someone whose interests match yours.</p></div>
      <form className="discover-search" onSubmit={search}>
        <label>Skills to find <span className="field-help">Add one or more, separated by commas.</span><input value={skills} onChange={(event) => setSkills(event.target.value)} placeholder="React, Python, UI/UX" /></label>
        <label>Name or interest<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search a name or bio" /></label>
        <Button type="submit">Find students <span aria-hidden="true">→</span></Button>
      </form>
      {error && <Alert>{error}</Alert>}
      {loading && <Loading label="Searching student profiles..." />}
      {!loading && searched && !error && students.length === 0 && <div className="empty-state"><h2>No students found yet.</h2><p>Try another skill or search term. Students with a completed profile are easier to discover.</p></div>}
      {!loading && students.length > 0 && <section className="student-results"><div className="section-heading"><h2>Students to meet</h2><span className="muted">{students.length} matching profiles</span></div><div className="student-grid">{students.map((student) => (
        <article className="content-card student-card" key={entityId(student)}>
          <div className="student-card-head"><div className="avatar avatar--small">{student.avatarUrl ? <img src={student.avatarUrl} alt="" /> : student.name.slice(0, 1).toUpperCase()}</div><div><h3>{student.name}</h3><span className="muted">{student.email}</span></div></div>
          <p className="clamp-copy">{student.bio || "This student is ready to meet new collaborators."}</p>
          <SkillList skills={student.skills} />
          <Link className="arrow-link" to={`/students/${entityId(student)}`}>View profile <span aria-hidden="true">→</span></Link>
        </article>
      ))}</div></section>}
    </div>
  );
}
