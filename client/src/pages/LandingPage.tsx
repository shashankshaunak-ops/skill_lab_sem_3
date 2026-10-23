import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export function LandingPage() {
  const { user } = useAuth();
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow light-eyebrow">Ideas get further together</span>
          <h1>Make your next<br /><em>big idea</em> happen.</h1>
          <p>Meet curious people on your campus, share what you want to build, and find the skills to make it real.</p>
          <div className="hero-actions">
            <Link className="button button--light" to={user ? "/dashboard" : "/register"}>{user ? "Go to your dashboard" : "Find your people"}</Link>
            <Link className="hero-secondary" to="/projects">Explore project ideas <span aria-hidden="true">→</span></Link>
          </div>
          <div className="hero-note"><span className="hero-dot" /> A community built around what you can create</div>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="orbit orbit--one" /><div className="orbit orbit--two" />
          <div className="art-core"><span>CC</span><small>CREATE<br />TOGETHER</small></div>
          <div className="art-note art-note--top"><span>✳</span> share an idea</div>
          <div className="art-note art-note--bottom">✦ find your people</div>
          <div className="art-dot art-dot--one" /><div className="art-dot art-dot--two" />
        </div>
      </section>
      <section className="intro-section">
        <div><span className="eyebrow">The right people change everything</span><h2>Start with an idea.<br />Leave with a team.</h2></div>
        <div className="intro-copy"><p>CampusConnect brings student project ideas and talent into one place. Whether you have a sketch on a napkin or a skill you want to put to work, there’s room to start here.</p><Link className="arrow-link" to="/discover">Meet student collaborators <span aria-hidden="true">→</span></Link></div>
      </section>
      <section className="feature-grid">
        <article className="feature-tile"><span className="feature-number">01</span><span className="feature-symbol">↗</span><h3>Explore ideas</h3><p>Find projects looking for the exact skills you’re excited to use.</p></article>
        <article className="feature-tile"><span className="feature-number">02</span><span className="feature-symbol">◎</span><h3>Show your skills</h3><p>Create a profile that makes it easy for like-minded students to find you.</p></article>
        <article className="feature-tile"><span className="feature-number">03</span><span className="feature-symbol">✳</span><h3>Build together</h3><p>Share what you want to make and find your first collaborators.</p></article>
      </section>
      <section className="closing-cta"><span className="eyebrow light-eyebrow">Your next chapter starts here</span><h2>There’s no better time<br />to make something.</h2><Link className="button button--light" to={user ? "/projects/new" : "/register"}>{user ? "Share a project idea" : "Join the community"} <span aria-hidden="true">→</span></Link></section>
    </>
  );
}
