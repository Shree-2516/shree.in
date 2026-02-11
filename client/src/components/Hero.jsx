const fallbackTagline = "Python + AI/ML Builder";

export default function Hero({ data }) {
  const staticTagline = (data?.tagline || fallbackTagline).trim();

  const projectCount = Array.isArray(data?.projects) ? data.projects.length : 0;
  const achievementCount = Array.isArray(data?.achievementsList) ? data.achievementsList.length : 0;
  const experienceCount = Array.isArray(data?.experiences) ? data.experiences.length : 0;
  const heroSkills = Array.isArray(data?.heroSkills) ? data.heroSkills : [];
  const topSkills = heroSkills.length > 0
    ? heroSkills
    : Array.isArray(data?.skills)
    ? data.skills.slice(0, 4)
    : [];

  const profilePhotoUrl = data?.profilePhoto ? `http://localhost:5000${data.profilePhoto}` : "";
  const resumeUrl = data?.resume ? `http://localhost:5000${data.resume}` : "";

  return (
    <section id="home">
      <div>
        <div className="home-hero-shell">
          <span className="home-ambient home-ambient-one" aria-hidden="true" />
          <span className="home-ambient home-ambient-two" aria-hidden="true" />

          <div className="home-hero-grid">
            <div className="home-avatar-wrap">
              <div className="avatar">
                {profilePhotoUrl ? (
                  <img src={profilePhotoUrl} alt="Profile" />
                ) : (
                  <div className="home-avatar-fallback">SP</div>
                )}
              </div>
            </div>

            <div className="home-content">
              <p className="home-kicker">Overview</p>
              <h1>{data?.name || "Your Name"}</h1>
              <p className="home-rotating-tagline">{staticTagline}</p>

              <div className="home-cta-row">
                {resumeUrl ? (
                  <a href={resumeUrl} target="_blank" rel="noreferrer" className="btn">
                    Download Resume
                  </a>
                ) : null}
                <a href="#projects" className="btn btn-secondary">
                  View Projects
                </a>
              </div>

              <div className="home-social-row">
                {data?.github ? (
                  <a
                    href={data.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary btn-icon"
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                      <path d="M12 .5a12 12 0 0 0-3.79 23.39c.6.11.82-.26.82-.58v-2.2c-3.34.73-4.04-1.41-4.04-1.41-.55-1.39-1.33-1.76-1.33-1.76-1.09-.75.08-.74.08-.74 1.2.09 1.83 1.24 1.83 1.24 1.08 1.84 2.82 1.31 3.5 1 .11-.78.42-1.31.76-1.61-2.66-.3-5.47-1.35-5.47-6a4.7 4.7 0 0 1 1.24-3.26c-.12-.3-.54-1.53.12-3.19 0 0 1.01-.33 3.3 1.24a11.3 11.3 0 0 1 6 0c2.28-1.57 3.29-1.24 3.29-1.24.66 1.66.24 2.89.12 3.19a4.7 4.7 0 0 1 1.24 3.26c0 4.67-2.81 5.69-5.49 5.99.43.37.82 1.11.82 2.24v3.32c0 .32.21.7.82.58A12 12 0 0 0 12 .5Z" />
                    </svg>
                    <span>GitHub</span>
                  </a>
                ) : null}
                {data?.linkedin ? (
                  <a
                    href={data.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary btn-icon"
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                      <path d="M6.94 8.5a2.2 2.2 0 1 1 0-4.4 2.2 2.2 0 0 1 0 4.4ZM4.9 19.5h4.08V9.8H4.9v9.7Zm6.35 0h4.07v-5.24c0-1.38.26-2.72 1.97-2.72 1.68 0 1.7 1.58 1.7 2.81v5.15H23v-5.95c0-2.92-.63-5.17-4.04-5.17-1.64 0-2.73.9-3.18 1.75h-.05V9.8h-3.9c.05.86 0 9.7 0 9.7Z" />
                    </svg>
                    <span>LinkedIn</span>
                  </a>
                ) : null}
              </div>

              <div className="home-metrics">
                <article className="home-metric-card">
                  <span className="home-metric-value">{projectCount}+</span>
                  <span className="home-metric-label">Projects</span>
                </article>
                <article className="home-metric-card">
                  <span className="home-metric-value">{achievementCount}+</span>
                  <span className="home-metric-label">Achievements</span>
                </article>
                <article className="home-metric-card">
                  <span className="home-metric-value">{experienceCount}+</span>
                  <span className="home-metric-label">Experience</span>
                </article>
              </div>

              <div className="home-skill-strip">
                {(topSkills.length ? topSkills : ["MERN", "Python", "AI/ML", "System Design"]).map((skill) => (
                  <span key={skill} className="home-skill-chip">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <a href="#about" className="home-scroll-cue" aria-label="Scroll to About section">
          <span>Scroll</span>
          <span className="home-scroll-dot" />
        </a>
      </div>
    </section>
  );
}
