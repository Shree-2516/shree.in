const mongoose = require("mongoose");

const ExperienceSchema = new mongoose.Schema(
  {
    type: { type: String }, // Internship, Job, Freelance
    company: String,
    companyLink: String,
    role: String,
    year: String,
    description: String,
  },
  { _id: false }
);

const AchievementSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    year: String,
    link: String,
    image: String,
  },
  { _id: false }
);

const SkillCategorySchema = new mongoose.Schema(
  {
    category: String,
    items: [String],
  },
  { _id: false }
);

const PortfolioSchema = new mongoose.Schema({
  name: String,
  tagline: String,
  about: String,
  aboutKicker: String,
  aboutTitle: String,
  aboutFocusTitle: String,
  aboutFocusItems: [String],
  aboutQuote: String,
  education: String,
  educations: [
    {
      school: String,
      course: String,
      year: String,
    },
  ],
  experiences: [ExperienceSchema],
  skills: [String],
  heroSkills: [String],
  skillCategories: [SkillCategorySchema],
  experience: String,
  achievements: String,
  achievementsList: [AchievementSchema],
  contactEmail: String,
  contactPhone: String,
  github: String,
  linkedin: String,
  address: String,
  profilePhoto: String,
  resume: String,
  adminLoginLink: String,
  projects: [
    {
      title: String,
      problemStatement: String,
      description: String,
      detailedInfo: String,
      tech: String,
      link: String,
      liveLink: String,
      repoLink: String,
      image: String,
    },
  ],
});

module.exports = mongoose.model("Portfolio", PortfolioSchema);
