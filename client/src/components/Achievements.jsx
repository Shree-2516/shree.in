import { API_BASE_URL } from "../api/api";
export default function Achievements({ data }) {
  const achievements = Array.isArray(data.achievementsList) ? data.achievementsList : [];

  return (
    <section id="achievements" className="achievements">
      <div>
        <h2>Achievements</h2>
        {achievements.length > 0 ? (
          <div className="achievements-grid">
            {achievements.map((item, index) => (
              <article key={`${item.title || "achievement"}-${index}`} className="achievement-card">
                {item.image ? (
                  <div className="achievement-media">
                    <img
                      src={`${API_BASE_URL}${item.image}`}
                      alt={item.title || "Achievement certificate"}
                    />
                    <span className="achievement-image-tag">Preview</span>
                  </div>
                ) : null}
                <h3>{item.title || "Achievement"}</h3>
                {item.description ? <p>{item.description}</p> : null}
                {item.year ? <p className="muted">{item.year}</p> : null}
                {item.link ? (
                  <a href={item.link} target="_blank" rel="noreferrer">
                    View certificate
                  </a>
                ) : null}
              </article>
            ))}
          </div>
        ) : (
          <p>{data.achievements || "No achievements added yet."}</p>
        )}
      </div>
    </section>
  );
}
