import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../api/api";
import "./Projects.css";

export default function Projects({ data }) {
  const navigate = useNavigate();

  // Prevent rendering if no projects exist
  if (!data || !data.projects || data.projects.length === 0) return null;

  return (
    <section id="projects" className="projects-section">
      <div>
        <h2 className="section-title">Projects</h2>

        <div className="projects-grid">
          {data.projects.map((p, i) => (
            <article
              key={i}
              className="project-card-link"
              style={{ "--delay": `${i * 110}ms` }}
              onClick={() => navigate(`/projects/${i}`)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  navigate(`/projects/${i}`);
                }
              }}
              role="button"
              tabIndex={0}
            >
              <div className="project-card">
                {/* Show project thumbnail if image path exists */}
                {p.image && (
                  <div className="project-media">
                    <img
                      src={`${API_BASE_URL}${p.image}`}
                      alt={p.title}
                      className="project-image"
                    />
                    <span className="project-image-tag">Preview</span>
                  </div>
                )}

                <h3>{p.title}</h3>

                <p className="project-desc">{p.description}</p>

                <p className="project-tech">
                  <strong>Tech:</strong> {p.tech}
                </p>

                <div className="project-links">
                  {p.liveLink || p.link ? (
                    <a
                      href={p.liveLink || p.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Live
                    </a>
                  ) : null}
                  {p.repoLink ? (
                    <a
                      href={p.repoLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="project-link-secondary"
                      onClick={(e) => e.stopPropagation()}
                    >
                      GitHub
                    </a>
                  ) : null}
                  {/* Visual link button */}
                  <span className="view-project-btn">View Project</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
