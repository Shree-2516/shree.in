import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const NAV_ITEMS = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "skills", label: "Skills" },
  { id: "projects", label: "Projects" },
  { id: "experience", label: "Experience" },
  { id: "education", label: "Education" },
  { id: "achievements", label: "Achievements" },
  { id: "contact", label: "Contact" },
];

export default function Navbar() {
  const [activeSection, setActiveSection] = useState("home");
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const sectionIds = NAV_ITEMS.map((item) => item.id);
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    if (!sections.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visibleEntries.length > 0) {
          setActiveSection(visibleEntries[0].target.id);
        }
      },
      {
        root: null,
        rootMargin: "-35% 0px -50% 0px",
        threshold: [0.2, 0.4, 0.6],
      }
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const hashSection = location.hash?.replace("#", "");
    if (hashSection) setActiveSection(hashSection);
  }, [location.hash]);

  const handleClick = (e, id) => {
    e.preventDefault();
    setActiveSection(id);

    const isSectionPage = location.pathname === "/" || location.pathname === "/dashboard";
    if (!isSectionPage) {
      navigate(`/#${id}`);
      return;
    }

    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <div className="brand">Shreeyash Paraj</div>

        <div className="nav-links">
          {NAV_ITEMS.map((n) => (
            <a
              key={n.id}
              href={`#${n.id}`}
              onClick={(e) => handleClick(e, n.id)}
              className={activeSection === n.id ? "active" : ""}
            >
              {n.label}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}
