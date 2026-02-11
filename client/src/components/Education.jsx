export default function Education({ data }) {
  const hasEducationList = data.educations && data.educations.length > 0;

  return (
    <section id="education" className="education">
      <div className="education-shell">
        <div className="education-head">
          <p className="education-kicker">Academic Journey</p>
          <h2>Education</h2>
        </div>

        {hasEducationList ? (
          <div className="education-list">
            {data.educations.map((edu, i) => (
              <article
                key={`${edu.school}-${edu.course}-${i}`}
                className="education-item"
                style={{ "--delay": `${i * 120}ms` }}
              >
                <div className="education-dot" aria-hidden="true" />
                <div className="education-body">
                  <div className="education-row">
                    <h3 className="education-school">{edu.school}</h3>
                    <span className="education-year">{edu.year}</span>
                  </div>
                  <p className="education-course">{edu.course}</p>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="education-fallback">{data.education}</p>
        )}
      </div>
    </section>
  );
}
