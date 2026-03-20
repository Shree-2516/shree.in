import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { fetchPortfolio } from "./api/api";
import Navbar from "./components/Navbar";

// Component Imports
import Hero from "./components/Hero";
import About from "./components/About";
import Skills from "./components/Skills";
import Experience from "./components/Experience";
import Achievements from "./components/Achievements";
import Projects from "./components/Project";
import Contact from "./components/Contact";
import Education from "./components/Education";
import Chatbot from "./components/Chatbot";
import CursorFollower from "./components/CursorFollower";

// Page Import for Details
import ProjectDetail from "./components/ProjectDetail";

function App() {
  const [data, setData] = useState(null);
  const [loadError, setLoadError] = useState("");
  const location = useLocation();
  const didHandleInitialReload = useRef(false);

  useEffect(() => {
    let isMounted = true;

    fetchPortfolio()
      .then((res) => {
        if (!isMounted) return;
        setData(res.data);
      })
      .catch(() => {
        if (!isMounted) return;
        setLoadError("Unable to load portfolio data. Please start the backend or set VITE_API_URL.");
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (didHandleInitialReload.current) return;
    didHandleInitialReload.current = true;

    const isSectionPage = location.pathname === "/" || location.pathname === "/dashboard";
    if (!isSectionPage) return;

    const navEntries = typeof performance !== "undefined" ? performance.getEntriesByType("navigation") : [];
    const navType = Array.isArray(navEntries) && navEntries[0] ? navEntries[0].type : "";
    if (navType !== "reload") return;

    if (location.hash !== "#home") {
      window.history.replaceState(null, "", `${location.pathname}#home`);
    }
  }, [location.pathname, location.hash]);

  useEffect(() => {
    const sectionId = location.hash?.replace("#", "");
    if (!sectionId) return undefined;

    const scrollToSection = () => {
      const el = document.getElementById(sectionId);
      if (!el) return false;
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      return true;
    };

    if (scrollToSection()) return undefined;
    const timer = setTimeout(scrollToSection, 120);
    return () => clearTimeout(timer);
  }, [location.pathname, location.hash, data]);

  if (loadError) return <p>{loadError}</p>;
  if (!data) return <p>Loading...</p>;

  const homePage = (
    <>
      <Hero data={data} />
      <About data={data} />
      <Skills data={data} />
      <Projects data={data} />
      <Experience data={data} />
      <Education data={data} />
      <Achievements data={data} />
      <Contact data={data} />
    </>
  );

  return (
    <div className="site-wrap">
      <CursorFollower />
      <Navbar data={data} />

      <Routes>
        {/* Main Home Route */}
        <Route path="/" element={homePage} />
        <Route path="/dashboard" element={homePage} />

        {/* Dynamic Project Detail Route */}
        <Route
          path="/projects/:id"
          element={<ProjectDetail data={data} />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Chatbot />
    </div>
  );
}

export default App;
