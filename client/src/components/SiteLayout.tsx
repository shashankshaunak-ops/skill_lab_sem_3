import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export function SiteLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="header-inner">
          <Link className="brand" to="/">Campus<span>Connect</span></Link>
          <nav className="main-nav" aria-label="Main navigation">
            <NavLink to="/projects">Ideas</NavLink>
            <NavLink to="/discover">Find teammates</NavLink>
            {user && <NavLink to="/dashboard">Dashboard</NavLink>}
          </nav>
          <div className="header-actions">
            {user ? (
              <>
                <Link className="profile-link" to="/profile">{user.name}</Link>
                <button className="text-button" onClick={handleLogout}>Log out</button>
              </>
            ) : (
              <>
                <Link className="text-button" to="/login">Log in</Link>
                <Link className="button button--primary header-join" to="/register">Join CampusConnect</Link>
              </>
            )}
          </div>
        </div>
      </header>
      <main className="page-content"><Outlet /></main>
      <footer className="site-footer">
        <span>CampusConnect</span>
        <span>Good ideas grow better together.</span>
      </footer>
    </div>
  );
}
