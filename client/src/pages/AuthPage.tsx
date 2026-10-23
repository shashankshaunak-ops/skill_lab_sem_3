import { useState, type FormEvent } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { ApiError } from "../lib/api";
import { Alert, Button } from "../components/Primitives";

export function AuthPage({ mode }: { mode: "login" | "register" }) {
  const { user, login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const isRegister = mode === "register";

  if (user) return <Navigate to="/dashboard" replace />;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (isRegister) await register(name, email, password);
      else await login(email, password);
      const next = (location.state as { from?: string } | null)?.from ?? "/dashboard";
      navigate(next, { replace: true });
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="auth-wrap">
      <div className="auth-card">
        <span className="eyebrow">Your campus, connected</span>
        <h1>{isRegister ? "Create your account" : "Welcome back"}</h1>
        <p className="muted">{isRegister ? "Meet your next collaborator and bring an idea to life." : "Pick up where your next big idea begins."}</p>
        {error && <Alert>{error}</Alert>}
        <form className="form-stack" onSubmit={handleSubmit}>
          {isRegister && (
            <label>
              Name
              <input autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} required maxLength={80} />
            </label>
          )}
          <label>
            College email
            <input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required maxLength={254} />
          </label>
          <label>
            Password
            <input type="password" autoComplete={isRegister ? "new-password" : "current-password"} value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} maxLength={128} />
            {isRegister && <span className="field-help">Use at least 8 characters.</span>}
          </label>
          <Button type="submit" disabled={busy}>{busy ? "Please wait..." : isRegister ? "Create account" : "Log in"}</Button>
        </form>
        <p className="auth-switch">
          {isRegister ? "Already part of the community?" : "New to CampusConnect?"}{" "}
          <Link to={isRegister ? "/login" : "/register"}>{isRegister ? "Log in" : "Create an account"}</Link>
        </p>
      </div>
    </section>
  );
}
