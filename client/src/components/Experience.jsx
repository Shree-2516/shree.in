export default function Experience({ data }) {
  const hasExperienceList = data.experiences && data.experiences.length > 0;

  return (
    <section id="experience" className="experience">
      <div className="experience-shell">
        <div className="experience-head">
          <p className="experience-kicker">Career Path</p>
          <h2>Experience</h2>
        </div>

        {hasExperienceList ? (
          <div className="experience-list">
            {data.experiences.map((exp, i) => (
              <article
                key={`${exp.company}-${exp.role}-${i}`}
                className="experience-item"
                style={{ "--delay": `${i * 120}ms` }}
              >
                <div className="experience-dot" aria-hidden="true" />
                <div className="experience-body">
                  <div className="experience-top">
                    <h3 className="experience-role">{exp.role}</h3>
                    <span className="experience-type">{exp.type || "Experience"}</span>
                  </div>
                  {exp.companyLink ? (
                    <p className="experience-company">
                      <a
                        href={exp.companyLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="experience-company-link"
                      >
                        {exp.company}
                      </a>
                    </p>
                  ) : (
                    <p className="experience-company">{exp.company}</p>
                  )}
                  <span className="experience-year">{exp.year}</span>
                  {exp.description ? (
                    <p className="experience-description">{exp.description}</p>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="experience-fallback">{data.experience}</p>
        )}
      </div>
    </section>
  );
}
