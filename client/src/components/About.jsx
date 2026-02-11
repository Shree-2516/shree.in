export default function About({ data }) {
  const highlights = Array.isArray(data.aboutFocusItems) && data.aboutFocusItems.length
    ? data.aboutFocusItems
    : [
        "Computer Engineering Student",
        "Full-Stack Python + MERN",
        "Focused on DSA & System Design",
        "Exploring AI/ML Projects",
      ];
  const kicker = data.aboutKicker || "Get to know me";
  const title = data.aboutTitle || "About Me";
  const focusTitle = data.aboutFocusTitle || "Current Focus";
  const quote = data.aboutQuote || "Building meaningful software and improving every single day.";

  return (
    <section id="about">
      <div className="about-layout">
        <article className="about-main">
          <p className="about-kicker">{kicker}</p>
          <h2>{title}</h2>
          <p>{data.about}</p>
        </article>

        <aside className="about-side">
          <div className="about-card">
            <h3>{focusTitle}</h3>
            <ul>
              {highlights.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="about-quote">
            <p>"{quote}"</p>
          </div>
        </aside>
      </div>
    </section>
  );
}
