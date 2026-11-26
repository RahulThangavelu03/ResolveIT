const express = require("express");
const cors = require("cors");

const app = express();
const pool = require("./config/db");
const authRoutes = require("./routes/authRoutes");

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
    res.json({
        message: "Welcome to ResolveIT API"
    });
});

app.get("/health", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW()");

        res.status(200).json({
            status: "ok",
            database: "connected",
            time: result.rows[0].now
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            status: "error",
            database: "disconnected"
        });
    }
});

module.exports = app;