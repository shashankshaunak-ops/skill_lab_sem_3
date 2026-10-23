import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Alert, Button, Loading, SkillList } from "../components/Primitives";
import { useAuth } from "../contexts/AuthContext";
import { api, ApiError } from "../lib/api";
import type { Student } from "../types";
import { entityId } from "../types";

function errorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : "The profile could not be loaded.";
}

export function ProfilePage({ own = false }: { own?: boolean }) {
  const { id } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    api<{ user: Student }>(own ? "/users/me" : `/users/${encodeURIComponent(id ?? "")}`)
      .then((result) => setProfile(result.user))
      .catch((caught: unknown) => setError(errorMessage(caught)))
      .finally(() => setLoading(false));
  }, [id, own]);

  if (loading) return <div className="page-narrow"><Loading label="Loading student profile..." /></div>;
  if (error || !profile) return <div className="page-narrow"><Alert>{error || "The student profile could not be found."}</Alert></div>;

  const isOwnProfile = own || (user && entityId(user) === entityId(profile));
  return (
    <div className="page-narrow">
      <div className="profile-heading">
        <div className="avatar">{profile.avatarUrl ? <img src={profile.avatarUrl} alt="" /> : profile.name.slice(0, 1).toUpperCase()}</div>
        <div className="profile-title"><span className="eyebrow">Student profile</span><h1>{profile.name}</h1><p className="muted">{profile.email}</p></div>
        {isOwnProfile && <Link className="button button--secondary" to="/profile/edit">Edit profile</Link>}
      </div>
      <section className="content-card profile-card">
        <div className="section-heading"><h2>A little about me</h2></div>
        <p className="profile-bio">{profile.bio || "This student hasn’t added a bio yet."}</p>
        <div className="card-section"><span className="eyebrow">Skills & interests</span><SkillList skills={profile.skills} /></div>
      </section>
      <Link className="arrow-link back-link" to="/discover">← Back to student discovery</Link>
    </div>
  );
}

export function EditProfilePage() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name ?? "");
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api<{ user: Student }>("/users/me")
      .then(({ user: current }) => {
        setName(current.name);
        setBio(current.bio);
        setSkills(current.skills.join(", "));
        setAvatarUrl(current.avatarUrl ?? "");
      })
      .catch((caught: unknown) => setError(errorMessage(caught)))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setSaved(false);
    try {
      await api<{ user: Student }>("/users/me", {
        method: "PATCH",
        body: JSON.stringify({
          name,
          bio,
          skills: skills.split(",").map((skill) => skill.trim()).filter(Boolean),
          avatarUrl,
        }),
      });
      await refreshUser();
      setSaved(true);
      navigate("/profile");
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <div className="page-narrow"><Loading label="Loading your profile..." /></div>;

  return (
    <div className="page-narrow">
      <div className="page-title"><span className="eyebrow">Make it yours</span><h1>Edit your profile</h1><p>Help people discover what you can bring to a project.</p></div>
      <form className="content-card form-stack edit-form" onSubmit={handleSubmit}>
        {error && <Alert>{error}</Alert>}
        {saved && <Alert kind="success">Your changes have been saved.</Alert>}
        <label>Name<input value={name} onChange={(event) => setName(event.target.value)} required maxLength={80} /></label>
        <label>College email<input value={user?.email ?? ""} disabled /><span className="field-help">Email addresses can’t be changed here.</span></label>
        <label>Short bio<textarea rows={5} value={bio} onChange={(event) => setBio(event.target.value)} maxLength={500} placeholder="What are you curious about? What would you love to build?" /></label>
        <label>Skills, separated by commas<input value={skills} onChange={(event) => setSkills(event.target.value)} placeholder="React, Python, UI/UX" /></label>
        <label>Avatar image URL <span className="field-help">Optional; use a publicly accessible image URL.</span><input type="url" value={avatarUrl} onChange={(event) => setAvatarUrl(event.target.value)} placeholder="https://example.com/photo.jpg" /></label>
        <div className="form-actions"><Link className="button button--secondary" to="/profile">Cancel</Link><Button type="submit" disabled={busy}>{busy ? "Saving..." : "Save profile"}</Button></div>
      </form>
    </div>
  );
}
