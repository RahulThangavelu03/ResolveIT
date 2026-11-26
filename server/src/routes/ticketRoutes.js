
const express = require("express");
const router = express.Router();

const pool = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");

// CREATE TICKET
router.post("/", authMiddleware, async (req, res) => {
    const { title, description, category } = req.body;

    if (!title || !description || !category) {
        return res.status(400).json({
            message: "All fields are required"
        });
    }

    try {
        const result = await pool.query(
            `INSERT INTO tickets (user_id, title, description, category)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [req.user.id, title, description, category]
        );

        return res.status(201).json({
            message: "Ticket created successfully",
            ticket: result.rows[0]
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Something went wrong"
        });
    }
});


// GET MY TICKETS
router.get("/my-tickets", authMiddleware, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT * FROM tickets
             WHERE user_id = $1 AND is_deleted = FALSE
             ORDER BY created_at DESC`,
            [req.user.id]
        );

        return res.status(200).json({
            tickets: result.rows
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Something went wrong"
        });
    }
});


// GET SINGLE TICKET
router.get("/:id", authMiddleware, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT * FROM tickets
             WHERE id = $1 AND is_deleted = FALSE`,
            [req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Ticket not found"
            });
        }

        const ticket = result.rows[0];

        if (ticket.user_id !== req.user.id && req.user.role !== "admin") {
            return res.status(403).json({
                message: "Access denied"
            });
        }

        return res.status(200).json({ ticket });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Something went wrong"
        });
    }
});


// UPDATE TICKET
router.put("/:id", authMiddleware, async (req, res) => {
    const { title, description, category } = req.body;

    if (!title || !description || !category) {
        return res.status(400).json({
            message: "All fields are required"
        });
    }

    try {
        const result = await pool.query(
            `UPDATE tickets
             SET title = $1,
                 description = $2,
                 category = $3,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $4
             AND user_id = $5
             AND status = 'Open'
             AND is_deleted = FALSE
             RETURNING *`,
            [title, description, category, req.params.id, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Ticket not found or cannot be edited"
            });
        }

        return res.status(200).json({
            message: "Ticket updated successfully",
            ticket: result.rows[0]
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Something went wrong"
        });
    }
});


// DELETE TICKET (SOFT DELETE)
router.delete("/:id", authMiddleware, async (req, res) => {
    try {
        const result = await pool.query(
            `UPDATE tickets
             SET is_deleted = TRUE,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $1
             AND user_id = $2
             AND is_deleted = FALSE
             RETURNING id`,
            [req.params.id, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Ticket not found"
            });
        }

        return res.status(200).json({
            message: "Ticket deleted successfully"
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Something went wrong"
        });
    }
});

module.exports = router;
