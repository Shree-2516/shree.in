import { useCallback, useEffect, useState } from "react";
import axios from "axios";

const API_BASE_URL = "http://localhost:5000";
const DEFAULT_SKILL_CATEGORIES = ["Programming", "Data Science", "Backend", "Database", "Tools"];
const createEmptySkillCategory = (category = "") => ({ category, items: "" });

const toAssetUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${API_BASE_URL}${path}`;
};

export default function PortfolioForm() {
  const [form, setForm] = useState({
    name: "",
    tagline: "",
    about: "",
    aboutKicker: "",
    aboutTitle: "",
    aboutFocusTitle: "",
    aboutFocusItems: "",
    aboutQuote: "",
    education: "",
    skills: "",
    heroSkills: "",
    contactEmail: "",
    contactPhone: "",
    github: "",
    linkedin: "",
    address: "",
  });

  const [projects, setProjects] = useState([]);
  const [educations, setEducations] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [skillCategories, setSkillCategories] = useState(
    DEFAULT_SKILL_CATEGORIES.map((category) => createEmptySkillCategory(category))
  );
  const [achievements, setAchievements] = useState([]);
  const [photo, setPhoto] = useState(null);
  const [resume, setResume] = useState(null);
  const [profilePhotoPath, setProfilePhotoPath] = useState("");
  const [resumePath, setResumePath] = useState("");
  const [profilePreviewUrl, setProfilePreviewUrl] = useState("");
  const [projectPreviewUrls, setProjectPreviewUrls] = useState([]);
  const [achievementPreviewUrls, setAchievementPreviewUrls] = useState([]);
  
  // 1. ADD STATE: Store project-specific images (from Image 5)
  const [projectImages, setProjectImages] = useState([]);
  const [achievementImages, setAchievementImages] = useState([]);

  // Load existing data
  const loadPortfolio = useCallback(async () => {
    const res = await axios.get(`${API_BASE_URL}/api/portfolio`);
    if (!res.data) return;

    setForm({
      name: res.data.name || "",
      tagline: res.data.tagline || "",
      about: res.data.about || "",
      aboutKicker: res.data.aboutKicker || "Get to know me",
      aboutTitle: res.data.aboutTitle || "About Me",
      aboutFocusTitle: res.data.aboutFocusTitle || "Current Focus",
      aboutFocusItems: Array.isArray(res.data.aboutFocusItems)
        ? res.data.aboutFocusItems.join("\n")
        : "",
      aboutQuote:
        res.data.aboutQuote || "Building meaningful software and improving every single day.",
      education: res.data.education || "",
      skills: res.data.skills?.join(",") || "",
      heroSkills: Array.isArray(res.data.heroSkills) ? res.data.heroSkills.join(", ") : "",
      contactEmail: res.data.contactEmail || "",
      contactPhone: res.data.contactPhone || "",
      github: res.data.github || "",
      linkedin: res.data.linkedin || "",
      address: res.data.address || "",
    });
    setProjects(
      (res.data.projects || []).map((project) => ({
        ...project,
        liveLink: project.liveLink || project.link || "",
        repoLink: project.repoLink || "",
      }))
    );
    setEducations(res.data.educations || []);
    setExperiences(res.data.experiences || []);
    const incomingSkillCategories = Array.isArray(res.data.skillCategories)
      ? res.data.skillCategories
          .filter((item) => typeof item === "object" && item !== null)
          .map((item) => ({
            category: item.category || "",
            items: Array.isArray(item.items) ? item.items.join(", ") : "",
          }))
      : [];
    if (incomingSkillCategories.length > 0) {
      setSkillCategories(incomingSkillCategories);
    } else {
      const seededCategories = DEFAULT_SKILL_CATEGORIES.map((category) => createEmptySkillCategory(category));
      if (Array.isArray(res.data.skills) && res.data.skills.length > 0) {
        seededCategories[0].items = res.data.skills.join(", ");
      }
      setSkillCategories(seededCategories);
    }
    setAchievements(
      Array.isArray(res.data.achievementsList)
        ? res.data.achievementsList
        : []
    );
    setProfilePhotoPath(res.data.profilePhoto || "");
    setResumePath(res.data.resume || "");
  }, []);

  useEffect(() => {
    loadPortfolio();
  }, [loadPortfolio]);

  useEffect(() => {
    return () => {
      if (profilePreviewUrl) URL.revokeObjectURL(profilePreviewUrl);
      projectPreviewUrls.forEach((url) => {
        if (url) URL.revokeObjectURL(url);
      });
      achievementPreviewUrls.forEach((url) => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, [profilePreviewUrl, projectPreviewUrls, achievementPreviewUrls]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleProjectChange = (index, e) => {
    const updated = [...projects];
    updated[index][e.target.name] = e.target.value;
    setProjects(updated);
  };

  const addProject = () => {
    setProjects([
      ...projects,
      { title: "", problemStatement: "", description: "", detailedInfo: "", tech: "", link: "", liveLink: "", repoLink: "" },
    ]);
  };

  const handleEducationChange = (index, e) => {
    const updated = [...educations];
    updated[index][e.target.name] = e.target.value;
    setEducations(updated);
  };

  const addEducation = () => {
    setEducations([...educations, { school: "", course: "", year: "" }]);
  };

  const removeEducation = (index) => {
    setEducations(educations.filter((_, i) => i !== index));
  };

  const handleExperienceChange = (index, e) => {
    const updated = [...experiences];
    updated[index][e.target.name] = e.target.value;
    setExperiences(updated);
  };

  const addExperience = () => {
    setExperiences([...experiences, { type: "Internship", company: "", companyLink: "", role: "", year: "", description: "" }]);
  };

  const handleSkillCategoryChange = (index, e) => {
    const updated = [...skillCategories];
    updated[index][e.target.name] = e.target.value;
    setSkillCategories(updated);
  };

  const addSkillCategory = () => {
    setSkillCategories([...skillCategories, createEmptySkillCategory("")]);
  };

  const removeSkillCategory = (index) => {
    setSkillCategories(skillCategories.filter((_, i) => i !== index));
  };

  const removeExperience = (index) => {
    setExperiences(experiences.filter((_, i) => i !== index));
  };

  const handleAchievementChange = (index, e) => {
    const updated = [...achievements];
    updated[index][e.target.name] = e.target.value;
    setAchievements(updated);
  };

  const addAchievement = () => {
    setAchievements([...achievements, { title: "", description: "", year: "", link: "", image: "" }]);
  };

  const removeAchievement = (index) => {
    setAchievements(achievements.filter((_, i) => i !== index));
    setAchievementImages(achievementImages.filter((_, i) => i !== index));
    setAchievementPreviewUrls((prev) => {
      const next = [...prev];
      if (next[index]) URL.revokeObjectURL(next[index]);
      return next.filter((_, i) => i !== index);
    });
  };

  const updateProjectImage = (index, file) => {
    const imgs = [...projectImages];
    imgs[index] = file || null;
    setProjectImages(imgs);
    setProjectPreviewUrls((prev) => {
      const next = [...prev];
      if (next[index]) URL.revokeObjectURL(next[index]);
      next[index] = file ? URL.createObjectURL(file) : "";
      return next;
    });
  };

  const updateAchievementImage = (index, file) => {
    const imgs = [...achievementImages];
    imgs[index] = file || null;
    setAchievementImages(imgs);
    setAchievementPreviewUrls((prev) => {
      const next = [...prev];
      if (next[index]) URL.revokeObjectURL(next[index]);
      next[index] = file ? URL.createObjectURL(file) : "";
      return next;
    });
  };

  const updateProfilePhoto = (file) => {
    setPhoto(file || null);
    setProfilePreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return file ? URL.createObjectURL(file) : "";
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clean form data - trim all string values
    const cleanForm = {};
    Object.keys(form).forEach((key) => {
      cleanForm[key] = typeof form[key] === 'string' ? form[key].trim() : form[key];
    });

    // Validate and clean experiences array
    const validExperiences = experiences
      .filter(exp => typeof exp === 'object' && exp !== null)
      .map(exp => ({
        type: (exp.type || "").trim(),
        company: (exp.company || "").trim(),
        companyLink: (exp.companyLink || "").trim(),
        role: (exp.role || "").trim(),
        year: (exp.year || "").trim(),
        description: (exp.description || "").trim(),
      }))
      .filter(exp => exp.company || exp.role); // Only include if has at least company or role

    // Validate and clean educations array
    const validEducations = educations
      .filter(edu => typeof edu === 'object' && edu !== null)
      .map(edu => ({
        school: (edu.school || "").trim(),
        course: (edu.course || "").trim(),
        year: (edu.year || "").trim(),
      }))
      .filter(edu => edu.school || edu.course); // Only include if has at least school or course

    // Validate and clean projects array
    const validProjects = projects
      .filter(proj => typeof proj === 'object' && proj !== null)
      .map(proj => {
        const liveLink = (proj.liveLink || proj.link || "").trim();
        return {
          title: (proj.title || "").trim(),
          problemStatement: (proj.problemStatement || "").trim(),
          description: (proj.description || "").trim(),
          detailedInfo: (proj.detailedInfo || "").trim(),
          tech: (proj.tech || "").trim(),
          link: liveLink,
          liveLink,
          repoLink: (proj.repoLink || "").trim(),
          image: proj.image || "",
        };
      })
      .filter(proj => proj.title); // Only include if has title

    const validAchievements = achievements
      .filter(item => typeof item === 'object' && item !== null)
      .map(item => ({
        title: (item.title || "").trim(),
        description: (item.description || "").trim(),
        year: (item.year || "").trim(),
        link: (item.link || "").trim(),
        image: item.image || "",
      }))
      .filter(item => item.title || item.description);

    const validSkillCategories = skillCategories
      .filter(item => typeof item === 'object' && item !== null)
      .map(item => ({
        category: (item.category || "").trim(),
        items: (item.items || "")
          .split(/\r?\n|,/)
          .map(skill => skill.trim())
          .filter(Boolean),
      }))
      .filter(item => item.category || item.items.length > 0);

    const flatSkills = Array.from(new Set(validSkillCategories.flatMap(item => item.items)));
    cleanForm.skills = flatSkills.join(",");

    const formData = new FormData();
    Object.keys(cleanForm).forEach((key) => formData.append(key, cleanForm[key]));
    formData.append("projects", JSON.stringify(validProjects));
    formData.append("educations", JSON.stringify(validEducations));
    formData.append("experiences", JSON.stringify(validExperiences));
    formData.append("achievementsList", JSON.stringify(validAchievements));
    formData.append("skillCategories", JSON.stringify(validSkillCategories));

    if (photo) formData.append("profilePhoto", photo);
    if (resume) formData.append("resume", resume);

    // 3. SEND IMAGES IN SUBMIT: Append each project image to formData (from Image 5)
    projectImages.forEach((img, index) => {
      if (img) {
        formData.append("projectImages", img);
        formData.append("projectImageIndexes", String(index));
      }
    });
    achievementImages.forEach((img, index) => {
      if (img) {
        formData.append("achievementImages", img);
        formData.append("achievementImageIndexes", String(index));
      }
    });

    console.log("Sending formData:", {
      form: cleanForm,
      projects: validProjects,
      educations: validEducations,
      experiences: validExperiences,
      achievementsList: validAchievements,
      skillCategories: validSkillCategories,
      hasPhoto: !!photo,
      hasResume: !!resume,
    });

    try {
      await axios.post(`${API_BASE_URL}/api/portfolio`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setPhoto(null);
      setResume(null);
      setProjectImages([]);
      setAchievementImages([]);
      setProfilePreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return "";
      });
      projectPreviewUrls.forEach((url) => {
        if (url) URL.revokeObjectURL(url);
      });
      achievementPreviewUrls.forEach((url) => {
        if (url) URL.revokeObjectURL(url);
      });
      setProjectPreviewUrls([]);
      setAchievementPreviewUrls([]);
      await loadPortfolio();
      alert("Portfolio updated successfully!");
    } catch (err) {
      console.error("Full error:", err);
      console.error("Error response:", err.response?.data);
      const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message || "Unknown error";
      alert(`Error updating portfolio: ${errorMsg}`);
    }
  };

  return (
    <form className="admin-form" onSubmit={handleSubmit} style={{ maxWidth: "760px", margin: "auto", padding: "24px" }}>
      <h2>Global Uploads</h2>
      <div style={{ marginBottom: "10px" }}>
        <label>Profile Photo: </label>
        <input type="file" accept="image/*" onChange={(e) => updateProfilePhoto(e.target.files[0])} />
        {(profilePreviewUrl || profilePhotoPath) ? (
          <div style={{ marginTop: "8px" }}>
            <img
              src={profilePreviewUrl || toAssetUrl(profilePhotoPath)}
              alt="Profile preview"
              style={{ width: "84px", height: "84px", objectFit: "cover", borderRadius: "10px", border: "1px solid #ddd" }}
            />
          </div>
        ) : null}
      </div>
      <div style={{ marginBottom: "20px" }}>
        <label>Resume (PDF): </label>
        <input type="file" accept="application/pdf" onChange={(e) => setResume(e.target.files[0])} />
        {resume ? <p style={{ margin: "8px 0 0 0", fontSize: "12px" }}>Selected: {resume.name}</p> : null}
        {!resume && resumePath ? (
          <a href={toAssetUrl(resumePath)} target="_blank" rel="noreferrer" style={{ display: "inline-block", marginTop: "8px", fontSize: "12px" }}>
            View current resume
          </a>
        ) : null}
      </div>

      <h2>Basic Info</h2>
      <input name="name" value={form.name} onChange={handleChange} placeholder="Name" style={inputStyle} />
      <input name="tagline" value={form.tagline} onChange={handleChange} placeholder="Tagline (e.g., Full Stack Developer)" style={inputStyle} />
      <textarea
        name="heroSkills"
        value={form.heroSkills}
        onChange={handleChange}
        placeholder={"Hero Skills (shown in hero section chips)\ncomma separated or one per line"}
        style={inputStyle}
      />
      <textarea
        name="about"
        value={form.about}
        onChange={handleChange}
        placeholder="About paragraph"
        style={inputStyle}
      />
      <input
        name="aboutKicker"
        value={form.aboutKicker}
        onChange={handleChange}
        placeholder="About kicker (e.g., Get to know me)"
        style={inputStyle}
      />
      <input
        name="aboutTitle"
        value={form.aboutTitle}
        onChange={handleChange}
        placeholder="About title (e.g., About Me)"
        style={inputStyle}
      />
      <input
        name="aboutFocusTitle"
        value={form.aboutFocusTitle}
        onChange={handleChange}
        placeholder="Focus section title (e.g., Current Focus)"
        style={inputStyle}
      />
      <textarea
        name="aboutFocusItems"
        value={form.aboutFocusItems}
        onChange={handleChange}
        placeholder={"Focus items (one per line)\nComputer Engineering Student\nFull-Stack Python + MERN"}
        style={{ ...inputStyle, minHeight: "110px" }}
      />
      <textarea
        name="aboutQuote"
        value={form.aboutQuote}
        onChange={handleChange}
        placeholder='About quote (without quotes), e.g. Building meaningful software and improving every single day.'
        style={inputStyle}
      />
      <h3 style={{ margin: "16px 0 10px" }}>Skills Categories</h3>
      {skillCategories.map((item, i) => (
        <div key={i} style={{ border: "1px solid #ddd", padding: 15, marginBottom: 15, borderRadius: "8px" }}>
          <input
            name="category"
            placeholder="Category (e.g., Programming)"
            value={item.category}
            onChange={(e) => handleSkillCategoryChange(i, e)}
            style={inputStyle}
          />
          <textarea
            name="items"
            placeholder="Skills (comma separated or one per line)"
            value={item.items}
            onChange={(e) => handleSkillCategoryChange(i, e)}
            style={inputStyle}
          />
          <button
            type="button"
            onClick={() => removeSkillCategory(i)}
            style={{ padding: "5px 10px", background: "#dc3545", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
          >
            Remove Category
          </button>
        </div>
      ))}
      <button type="button" onClick={addSkillCategory} style={{ marginBottom: "20px" }}>
        Add Skill Category
      </button>
      <input name="contactEmail" value={form.contactEmail} onChange={handleChange} placeholder="Contact Email" style={inputStyle} />
      <input name="contactPhone" value={form.contactPhone} onChange={handleChange} placeholder="Contact Number" style={inputStyle} />
      <input name="github" value={form.github} onChange={handleChange} placeholder="GitHub Link" style={inputStyle} />
      <input name="linkedin" value={form.linkedin} onChange={handleChange} placeholder="LinkedIn Link" style={inputStyle} />
      <textarea name="address" value={form.address} onChange={handleChange} placeholder="Address" style={inputStyle} />

      <h2>Achievements</h2>
      {achievements.map((item, i) => (
        <div key={i} style={{ border: "1px solid #ddd", padding: 15, marginBottom: 15, borderRadius: "8px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>Certificate Image:</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => updateAchievementImage(i, e.target.files[0])}
            style={{ marginBottom: "10px" }}
          />
          {(achievementPreviewUrls[i] || item.image) ? (
            <img
              src={achievementPreviewUrls[i] || toAssetUrl(item.image)}
              alt="Achievement preview"
              style={{ width: "72px", height: "72px", objectFit: "cover", borderRadius: "8px", border: "1px solid #ddd", marginBottom: "10px" }}
            />
          ) : null}
          <input
            name="title"
            placeholder="Achievement Title"
            value={item.title}
            onChange={(e) => handleAchievementChange(i, e)}
            style={inputStyle}
          />
          <textarea
            name="description"
            placeholder="Achievement Description"
            value={item.description}
            onChange={(e) => handleAchievementChange(i, e)}
            style={inputStyle}
          />
          <input
            name="year"
            placeholder="Year or Date (e.g., 2025 or Jan 2025)"
            value={item.year}
            onChange={(e) => handleAchievementChange(i, e)}
            style={inputStyle}
          />
          <input
            name="link"
            placeholder="Link URL (Certificate/Proof)"
            value={item.link}
            onChange={(e) => handleAchievementChange(i, e)}
            style={inputStyle}
          />
          <button
            type="button"
            onClick={() => removeAchievement(i)}
            style={{ padding: "5px 10px", background: "#dc3545", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
          >
            Remove
          </button>
        </div>
      ))}

      <button type="button" onClick={addAchievement} style={{ marginBottom: "20px" }}>
        Add Achievement
      </button>

      <h2>Experience</h2>
      {experiences.map((exp, i) => (
        <div key={i} style={{ border: "1px solid #ddd", padding: 15, marginBottom: 15, borderRadius: "8px" }}>
          <select
            name="type"
            value={exp.type}
            onChange={(e) => handleExperienceChange(i, e)}
            style={inputStyle}
          >
            <option value="Internship">Internship</option>
            <option value="Job">Job</option>
            <option value="Freelance">Freelance</option>
          </select>
          <input
            name="company"
            placeholder="Company Name"
            value={exp.company}
            onChange={(e) => handleExperienceChange(i, e)}
            style={inputStyle}
          />
          <input
            name="companyLink"
            placeholder="Company Website URL"
            value={exp.companyLink || ""}
            onChange={(e) => handleExperienceChange(i, e)}
            style={inputStyle}
          />
          <input
            name="role"
            placeholder="Role / Position"
            value={exp.role}
            onChange={(e) => handleExperienceChange(i, e)}
            style={inputStyle}
          />
          <input
            name="year"
            placeholder="Year (e.g., 2023 to 2024)"
            value={exp.year}
            onChange={(e) => handleExperienceChange(i, e)}
            style={inputStyle}
          />
          <textarea
            name="description"
            placeholder="Short Description / Responsibilities"
            value={exp.description}
            onChange={(e) => handleExperienceChange(i, e)}
            style={inputStyle}
          />
          <button
            type="button"
            onClick={() => removeExperience(i)}
            style={{ padding: "5px 10px", background: "#dc3545", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
          >
            ❌ Remove
          </button>
        </div>
      ))}

      <button type="button" onClick={addExperience} style={{ marginBottom: "20px" }}>
        ➕ Add Experience
      </button>

      <h2>Education</h2>
      {educations.map((edu, i) => (
        <div key={i} style={{ border: "1px solid #ddd", padding: 15, marginBottom: 15, borderRadius: "8px" }}>
          <input
            name="school"
            placeholder="School / College Name"
            value={edu.school}
            onChange={(e) => handleEducationChange(i, e)}
            style={inputStyle}
          />
          <input
            name="course"
            placeholder="Course / Degree"
            value={edu.course}
            onChange={(e) => handleEducationChange(i, e)}
            style={inputStyle}
          />
          <input
            name="year"
            placeholder="Year (e.g., 2023 to 2026)"
            value={edu.year}
            onChange={(e) => handleEducationChange(i, e)}
            style={inputStyle}
          />
          <button
            type="button"
            onClick={() => removeEducation(i)}
            style={{ padding: "5px 10px", background: "#dc3545", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
          >
            ❌ Remove
          </button>
        </div>
      ))}

      <button type="button" onClick={addEducation} style={{ marginBottom: "20px" }}>
        ➕ Add Education
      </button>

      <h2>Projects</h2>
      {projects.map((project, i) => (
        <div key={i} style={{ border: "1px solid #ddd", padding: 15, marginBottom: 15, borderRadius: "8px" }}>
          {/* 2. ADD IMAGE INPUT: Inside each project card (from Image 5) */}
          <label style={{ display: "block", marginBottom: "5px" }}>Project Image:</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => updateProjectImage(i, e.target.files[0])}
            style={{ marginBottom: "10px" }}
          />
          {(projectPreviewUrls[i] || project.image) ? (
            <img
              src={projectPreviewUrls[i] || toAssetUrl(project.image)}
              alt="Project preview"
              style={{ width: "72px", height: "72px", objectFit: "cover", borderRadius: "8px", border: "1px solid #ddd", marginBottom: "10px" }}
            />
          ) : null}
          
          <input
            name="title"
            placeholder="Project Title"
            value={project.title}
            onChange={(e) => handleProjectChange(i, e)}
            style={inputStyle}
          />
          <textarea
            name="problemStatement"
            placeholder="Problem Statement (shown in project detail page under title)"
            value={project.problemStatement || ""}
            onChange={(e) => handleProjectChange(i, e)}
            style={inputStyle}
          />
          <textarea
            name="description"
            placeholder="Description"
            value={project.description}
            onChange={(e) => handleProjectChange(i, e)}
            style={inputStyle}
          />
          <textarea
            name="detailedInfo"
            placeholder="Detailed Project Info (shown only on project detail page)"
            value={project.detailedInfo || ""}
            onChange={(e) => handleProjectChange(i, e)}
            style={{ ...inputStyle, minHeight: "120px" }}
          />
          <input
            name="tech"
            placeholder="Tech Stack"
            value={project.tech}
            onChange={(e) => handleProjectChange(i, e)}
            style={inputStyle}
          />
          <input
            name="liveLink"
            placeholder="Live Project URL"
            value={project.liveLink || ""}
            onChange={(e) => handleProjectChange(i, e)}
            style={inputStyle}
          />
          <input
            name="repoLink"
            placeholder="GitHub Repo URL"
            value={project.repoLink || ""}
            onChange={(e) => handleProjectChange(i, e)}
            style={inputStyle}
          />
        </div>
      ))}

      <button type="button" onClick={addProject} style={{ marginBottom: "20px" }}>
        ➕ Add Project
      </button>

      <button type="submit" style={{ padding: "10px 20px", background: "#007bff", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
        Save Portfolio
      </button>
    </form>
  );
}

const inputStyle = { display: "block", width: "100%", marginBottom: "10px", padding: "8px" };
