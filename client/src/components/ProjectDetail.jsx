import { useEffect, useMemo } from "react";
import { API_BASE_URL } from "../api/api";
import { useNavigate, useParams } from "react-router-dom";
import "./ProjectDetail.css";

export default function ProjectDetail({ data }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const projectIndex = Number.parseInt(id, 10);
  const project = Array.isArray(data?.projects) ? data.projects[projectIndex] : null;
  const liveLink = project?.liveLink || project?.link || "";
  const repoLink = project?.repoLink || "";

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [id]);

  const techItems = useMemo(
    () =>
      (project?.tech || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    [project?.tech]
  );

  if (!project) {
    return (
      <section className="project-detail-page">
        <div className="project-detail-shell project-detail-empty">
          <p>Project not found.</p>
          <button type="button" className="project-back-btn" onClick={() => navigate(-1)}>
            Back
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="project-detail-page">
      <div className="project-detail-shell">
        <div className="project-detail-actions">
          <button type="button" className="project-back-btn" onClick={() => navigate(-1)}>
            Back to Projects
          </button>
        </div>

        <div className="project-detail-grid">
          <div className="project-detail-media">
            {project.image ? (
              <img src={`${API_BASE_URL}${project.image}`} alt={project.title} />
            ) : (
              <div className="project-detail-no-image">No preview image</div>
            )}
            {(liveLink || repoLink) ? (
              <div className="project-detail-link-row">
                {liveLink ? (
                  <a href={liveLink} target="_blank" rel="noopener noreferrer" className="project-detail-link-btn">
                    Open Live
                  </a>
                ) : null}
                {repoLink ? (
                  <a
                    href={repoLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="project-detail-link-btn project-detail-link-btn-secondary"
                  >
                    GitHub Repo
                  </a>
                ) : null}
              </div>
            ) : null}
          </div>

          <article className="project-detail-content">
            <p className="project-detail-kicker">Project Details</p>
            <h1>{project.title}</h1>
            {project.problemStatement ? (
              <div className="project-detail-problem">
                <h3>Problem Statement</h3>
                <p>{project.problemStatement}</p>
              </div>
            ) : null}
            <p className="project-detail-summary">{project.description}</p>

            {techItems.length > 0 ? (
              <div className="project-detail-stack">
                <h3>Tech Stack</h3>
                <div className="project-tech-list">
                  {techItems.map((item) => (
                    <span key={item} className="project-tech-pill">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

          </article>
        </div>

        {project.detailedInfo ? (
          <div className="project-detail-more project-detail-more-full">
            <h3>Detailed Project Info</h3>
            <p>{project.detailedInfo}</p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
