
require("dotenv").config();

const bcrypt = require("bcrypt");
const pool = require("./config/db");

const createAdmin = async () => {
    try {
        const name = "ResolveIT Admin";
        const email = "admin@resolveit.com";
        const password = "Admin@123";

        // Check whether admin already exists
        const existingAdmin = await pool.query(
            "SELECT id FROM users WHERE email = $1",
            [email]
        );

        if (existingAdmin.rows.length > 0) {
            console.log("Admin account already exists");
            return;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create admin
        await pool.query(
            `INSERT INTO users (name, email, password_hash, role)
             VALUES ($1, $2, $3, $4)`,
            [name, email, hashedPassword, "admin"]
        );

        console.log("Admin account created successfully");

    } catch (error) {
        console.error("Admin creation failed:", error);
    } finally {
        await pool.end();
    }
};

createAdmin();
