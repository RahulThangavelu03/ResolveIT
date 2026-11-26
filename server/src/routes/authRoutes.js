const express = require("express");
const router = express.Router();

const pool = require("../config/db");
const bcrypt = require("bcrypt");


// POST /api/auth/register
router.post("/register", async (req, res) => {

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({
            message: "All fields are required"
        });
    }

    try {
        // Check duplicate email
        const result = await pool.query(
            "SELECT id FROM users WHERE email = $1",
            [email]
        );

        if (result.rows.length > 0) {
            return res.status(409).json({
                message: "Email already exists"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user
        await pool.query(
            `INSERT INTO users (name, email, password_hash)
             VALUES ($1, $2, $3)`,
            [name, email, hashedPassword]
        );

        return res.status(201).json({
            message: "Registration successful"
        });

    } catch (err) {
        console.error(err);

        return res.status(500).json({
            message: "Something went wrong"
        });
    }
});


const jwt = require("jsonwebtoken");

router.post("/login", async (req, res) => {

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            message: "All fields are required"
        });
    }

    try {
        const result = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const userData = result.rows[0];

        const matchingPassword = await bcrypt.compare(
            password,
            userData.password_hash
        );

        if (!matchingPassword) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            {
                id: userData.id,
                role: userData.role
            },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        return res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: userData.id,
                name: userData.name,
                email: userData.email,
                role: userData.role
            }
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Something went wrong"
        });
    }
});


module.exports = router;