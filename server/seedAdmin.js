const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Admin = require("./models/Admin");
const connectDB = require("./config/db");

dotenv.config();

const seedAdmin = async () => {
    try {
        await connectDB();
        await Admin.deleteMany(); // Clear existing admins

        const admin = new Admin({
            email: process.env.ADMIN_EMAIL || "admin@example.com",
            password: process.env.ADMIN_PASSWORD || "admin123",
        });

        await admin.save();

        console.log("Admin user created successfully");
        process.exit();
    } catch (error) {
        console.error("Error Message:", error.message);
        if (error.errors) console.error("Validation Errors:", error.errors);
        process.exit(1);
    }
};

seedAdmin();
