export default function Skills({ data }) {
  const skills = Array.isArray(data?.skills) ? data.skills : [];
  const skillCategories = Array.isArray(data?.skillCategories)
    ? data.skillCategories
        .filter((item) => typeof item === "object" && item !== null)
        .map((item) => ({
          category: item.category || "",
          items: Array.isArray(item.items)
            ? item.items.filter((skill) => typeof skill === "string" && skill.trim())
            : [],
        }))
        .filter((item) => item.category || item.items.length > 0)
    : [];
  const hasSkillCategories = skillCategories.length > 0;
  const totalSkills = hasSkillCategories
    ? skillCategories.reduce((sum, item) => sum + item.items.length, 0)
    : skills.length;

  return (
    <section id="skills" className="skills">
      <div className="skills-shell">
        <div className="skills-head">
          <p className="skills-kicker">Core Toolkit</p>
          <h2>Skills</h2>
          <p className="skills-subtitle">
            Technologies I use to build fast, reliable, and modern products.
          </p>
        </div>

        {hasSkillCategories ? (
          <div className="skills-category-grid">
            {skillCategories.map((group, groupIndex) => (
              <article className="skills-category-card" key={`${group.category || "category"}-${groupIndex}`}>
                <h3 className="skills-category-title">{group.category || `Category ${groupIndex + 1}`}</h3>
                <ul className="skills-grid">
                  {group.items.map((skill, itemIndex) => (
                    <li key={`${group.category}-${skill}-${itemIndex}`} style={{ "--delay": `${itemIndex * 70}ms` }}>
                      <span className="skills-dot" aria-hidden="true" />
                      <span>{skill}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        ) : (
          <ul className="skills-grid">
            {skills.map((skill, i) => (
              <li key={`${skill}-${i}`} style={{ "--delay": `${i * 70}ms` }}>
                <span className="skills-dot" aria-hidden="true" />
                <span>{skill}</span>
              </li>
            ))}
          </ul>
        )}

        <p className="skills-footnote">{totalSkills}+ Skills</p>
      </div>
    </section>
  );
}
