const Portfolio = require("../models/Portfolio");

// GET portfolio data
exports.getPortfolio = async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne();
    res.json(portfolio);
  } catch (error) {
    res.status(500).json({ message: "Error fetching portfolio", error: error.message });
  }
};

// CREATE or UPDATE portfolio data
exports.updatePortfolio = async (req, res) => {
  try {
    // 1. Parse existing projects array from the request body with error handling
    let projects = [];
    try {
      let rawProjects = req.body.projects;

      // If it's a string, parse it as JSON
      if (typeof rawProjects === 'string') {
        rawProjects = JSON.parse(rawProjects);
      }

      // Ensure it's an array
      if (Array.isArray(rawProjects)) {
        // Clean up projects - trim all string fields
        projects = rawProjects
          .filter(proj => typeof proj === 'object' && proj !== null)
          .map(proj => {
            const legacyLink = (proj.link || "").trim();
            const liveLink = (proj.liveLink || legacyLink || "").trim();
            const repoLink = (proj.repoLink || "").trim();

            return {
              title: (proj.title || "").trim(),
              problemStatement: (proj.problemStatement || "").trim(),
              description: (proj.description || "").trim(),
              detailedInfo: (proj.detailedInfo || "").trim(),
              tech: (proj.tech || "").trim(),
              link: liveLink,
              liveLink,
              repoLink,
              image: proj.image || "",
            };
          });
      }
    } catch (err) {
      console.error("Error parsing projects:", err.message);
      console.error("Raw projects value:", req.body.projects);
      projects = [];
    }

    // Parse educations array from the request body with error handling
    let educations = [];
    try {
      let rawEducations = req.body.educations;

      // If it's a string, parse it as JSON
      if (typeof rawEducations === 'string') {
        rawEducations = JSON.parse(rawEducations);
      }

      // Ensure it's an array
      if (Array.isArray(rawEducations)) {
        // Clean up educations - trim all string fields
        educations = rawEducations
          .filter(edu => typeof edu === 'object' && edu !== null)
          .map(edu => ({
            school: (edu.school || "").trim(),
            course: (edu.course || "").trim(),
            year: (edu.year || "").trim(),
          }));
      }
    } catch (err) {
      console.error("Error parsing educations:", err.message);
      console.error("Raw educations value:", req.body.educations);
      educations = [];
    }

    // Parse experiences array from the request body with error handling
    let experiences = [];
    try {
      let rawExperiences = req.body.experiences;

      // If it's a string, parse it as JSON
      if (typeof rawExperiences === 'string') {
        rawExperiences = JSON.parse(rawExperiences);
      }

      // Ensure it's an array
      if (Array.isArray(rawExperiences)) {
        // Clean up experiences - trim all string fields
        experiences = rawExperiences
          .filter(exp => typeof exp === 'object' && exp !== null)
          .map(exp => ({
            type: (exp.type || "").trim(),
            company: (exp.company || "").trim(),
            companyLink: (exp.companyLink || "").trim(),
            role: (exp.role || "").trim(),
            year: (exp.year || "").trim(),
            description: (exp.description || "").trim(),
          }));
      }
    } catch (err) {
      console.error("Error parsing experiences:", err.message);
      console.error("Raw experiences value:", req.body.experiences);
      experiences = [];
    }

    // Parse achievements list array from request body with error handling
    let achievementsList = [];
    try {
      let rawAchievements = req.body.achievementsList;

      if (typeof rawAchievements === "string") {
        rawAchievements = JSON.parse(rawAchievements);
      }

      if (Array.isArray(rawAchievements)) {
        achievementsList = rawAchievements
          .filter((item) => typeof item === "object" && item !== null)
          .map((item) => ({
            title: (item.title || "").trim(),
            description: (item.description || "").trim(),
            year: (item.year || "").trim(),
            link: (item.link || "").trim(),
            image: item.image || "",
          }))
          .filter((item) => item.title || item.description);
      }
    } catch (err) {
      console.error("Error parsing achievementsList:", err.message);
      console.error("Raw achievementsList value:", req.body.achievementsList);
      achievementsList = [];
    }

    // Parse about focus items from text/JSON into array
    let aboutFocusItems = [];
    try {
      let rawFocusItems = req.body.aboutFocusItems;

      if (typeof rawFocusItems === "string") {
        const trimmed = rawFocusItems.trim();
        if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
          rawFocusItems = JSON.parse(trimmed);
        } else {
          rawFocusItems = trimmed
            .split(/\r?\n|,/)
            .map((item) => item.trim())
            .filter(Boolean);
        }
      }

      if (Array.isArray(rawFocusItems)) {
        aboutFocusItems = rawFocusItems
          .map((item) => (typeof item === "string" ? item.trim() : ""))
          .filter(Boolean);
      }
    } catch (err) {
      console.error("Error parsing aboutFocusItems:", err.message);
      aboutFocusItems = [];
    }

    // Parse skill categories array from request body with error handling
    let skillCategories = [];
    try {
      let rawSkillCategories = req.body.skillCategories;

      if (typeof rawSkillCategories === "string") {
        rawSkillCategories = JSON.parse(rawSkillCategories);
      }

      if (Array.isArray(rawSkillCategories)) {
        skillCategories = rawSkillCategories
          .filter((item) => typeof item === "object" && item !== null)
          .map((item) => {
            const category = (item.category || "").trim();
            const rawItems = Array.isArray(item.items) ? item.items : [];
            const items = rawItems
              .map((entry) => (typeof entry === "string" ? entry.trim() : ""))
              .filter(Boolean);
            return { category, items };
          })
          .filter((item) => item.category || item.items.length > 0);
      }
    } catch (err) {
      console.error("Error parsing skillCategories:", err.message);
      console.error("Raw skillCategories value:", req.body.skillCategories);
      skillCategories = [];
    }

    // Parse project image indexes so files map to their actual project slot
    const projectImageIndexesRaw = req.body.projectImageIndexes;
    const projectImageIndexes = Array.isArray(projectImageIndexesRaw)
      ? projectImageIndexesRaw
      : projectImageIndexesRaw != null
        ? [projectImageIndexesRaw]
        : [];

    // Parse achievement image indexes so files map to their actual achievement slot
    const achievementImageIndexesRaw = req.body.achievementImageIndexes;
    const achievementImageIndexes = Array.isArray(achievementImageIndexesRaw)
      ? achievementImageIndexesRaw
      : achievementImageIndexesRaw != null
        ? [achievementImageIndexesRaw]
        : [];

    // 2. Attach uploaded projectImages to the correct project index
    if (req.files?.projectImages) {
      req.files.projectImages.forEach((file, index) => {
        const parsedIndex = Number.parseInt(projectImageIndexes[index], 10);
        if (!Number.isNaN(parsedIndex) && projects[parsedIndex]) {
          projects[parsedIndex].image = `/uploads/projects/${file.filename}`;
        } else if (projects[index]) {
          projects[index].image = `/uploads/projects/${file.filename}`;
        }
      });
    }

    // Attach uploaded achievementImages to the correct achievement index
    if (req.files?.achievementImages) {
      req.files.achievementImages.forEach((file, index) => {
        const parsedIndex = Number.parseInt(achievementImageIndexes[index], 10);
        if (!Number.isNaN(parsedIndex) && achievementsList[parsedIndex]) {
          achievementsList[parsedIndex].image = `/uploads/achievements/${file.filename}`;
        } else if (achievementsList[index]) {
          achievementsList[index].image = `/uploads/achievements/${file.filename}`;
        }
      });
    }

    // 3. Prepare the final data object
    const data = {};

    // Add all form fields except the stringified arrays
    Object.keys(req.body).forEach((key) => {
      if (!["projects", "educations", "experiences", "achievementsList", "aboutFocusItems", "skillCategories", "projectImageIndexes", "achievementImageIndexes"].includes(key)) {
        data[key] = req.body[key];
      }
    });

    // Store grouped categories and keep flat skills for backwards compatibility
    const flatSkillsFromCategories = skillCategories.flatMap((group) => group.items);
    const flatSkillsFromText = req.body.skills
      ? req.body.skills.split(",").map((s) => s.trim()).filter((s) => s)
      : [];
    const heroSkills = req.body.heroSkills
      ? req.body.heroSkills
        .split(/\r?\n|,/)
        .map((s) => s.trim())
        .filter((s) => s)
      : [];

    data.skillCategories = skillCategories;
    data.skills = Array.from(new Set(
      flatSkillsFromCategories.length > 0 ? flatSkillsFromCategories : flatSkillsFromText
    ));
    data.heroSkills = Array.from(new Set(heroSkills));
    data.projects = projects; // Use the parsed and updated projects array
    data.educations = educations; // Use the parsed educations array
    data.experiences = experiences; // Use the parsed experiences array
    data.achievementsList = achievementsList;
    data.aboutFocusItems = aboutFocusItems;

    console.log("Data to save:", JSON.stringify(data, null, 2));

    // 4. Handle Profile Photo and Resume Uploads
    if (req.files?.profilePhoto) {
      data.profilePhoto = `/uploads/${req.files.profilePhoto[0].filename}`;
    }

    if (req.files?.resume) {
      data.resume = `/uploads/${req.files.resume[0].filename}`;
    }

    // 5. Database logic: Check if portfolio exists to Update or Create
    const existing = await Portfolio.findOne();

    if (existing) {
      await Portfolio.findOneAndUpdate({}, data, { new: true, runValidators: false });
    } else {
      await Portfolio.create(data);
    }

    res.json({ message: "Portfolio updated with project images, educations and experiences successfully" });
  } catch (error) {
    console.error("Portfolio update error:", error);
    const errorDetails = error.errors ? Object.keys(error.errors).map(key => `${key}: ${error.errors[key].message}`).join(", ") : error.message;
    res.status(500).json({ message: "Error updating portfolio", error: errorDetails, details: error.toString() });
  }
};
