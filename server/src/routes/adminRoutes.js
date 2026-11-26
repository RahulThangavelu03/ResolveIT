
const express = require("express");
const router = express.Router();

const pool = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

// GET ALL TICKETS + FILTER
router.get("/tickets", authMiddleware, adminMiddleware, async (req, res) => {
    const { status, priority } = req.query;

    try {
        let query = `
            SELECT tickets.*, users.name AS user_name, users.email AS user_email
            FROM tickets
            JOIN users ON tickets.user_id = users.id
            WHERE tickets.is_deleted = FALSE
        `;

        const values = [];

        if (status) {
            values.push(status);
            query += ` AND tickets.status = $${values.length}`;
        }

        if (priority) {
            values.push(priority);
            query += ` AND tickets.priority = $${values.length}`;
        }

        query += " ORDER BY tickets.created_at DESC";

        const result = await pool.query(query, values);

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


// UPDATE TICKET STATUS / PRIORITY
router.put("/tickets/:id", authMiddleware, adminMiddleware, async (req, res) => {
    const { status, priority } = req.body;

    const validStatuses = ["Open", "In Progress", "Resolved", "Closed"];
    const validPriorities = ["Low", "Medium", "High"];

    if (status === undefined && priority === undefined) {
        return res.status(400).json({
            message: "Provide status or priority to update"
        });
    }

    if (status !== undefined && !validStatuses.includes(status)) {
        return res.status(400).json({
            message: "Invalid status"
        });
    }

    if (priority !== undefined && !validPriorities.includes(priority)) {
        return res.status(400).json({
            message: "Invalid priority"
        });
    }

    try {
        const result = await pool.query(
            `UPDATE tickets
             SET status = COALESCE($1, status),
                 priority = COALESCE($2, priority),
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $3 AND is_deleted = FALSE
             RETURNING *`,
            [status ?? null, priority ?? null, req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Ticket not found"
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

module.exports = router;
