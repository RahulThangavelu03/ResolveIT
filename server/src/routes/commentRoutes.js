
const express = require("express");

const router = express.Router({ mergeParams: true });

const pool = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");

const eventEmitter = require("../events/eventEmitter");


// ADD COMMENT
router.post("/", authMiddleware, async (req, res) => {
    const { content } = req.body;

    if (!content || !content.trim()) {
        return res.status(400).json({
            message: "Comment cannot be empty"
        });
    }

    try {
        const ticketResult = await pool.query(
            `SELECT id, user_id FROM tickets
             WHERE id = $1 AND is_deleted = FALSE`,
            [req.params.ticketId]
        );

        if (ticketResult.rows.length === 0) {
            return res.status(404).json({
                message: "Ticket not found"
            });
        }

        const ticket = ticketResult.rows[0];

        if (ticket.user_id !== req.user.id && req.user.role !== "admin") {
            return res.status(403).json({
                message: "Access denied"
            });
        }

        const result = await pool.query(
            `INSERT INTO comments (ticket_id, user_id, content)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [req.params.ticketId, req.user.id, content.trim()]
        );

        eventEmitter.emit("ticketActivity", {
        ticketId: Number(req.params.ticketId),
        actorId: req.user.id,
        action: "Comment Added",
        metadata: {
        comment: content.trim()
    }
});


        return res.status(201).json({
            message: "Comment added successfully",
            comment: result.rows[0]
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Something went wrong"
        });
    }
});


// GET COMMENTS
router.get("/", authMiddleware, async (req, res) => {
    try {
        const ticketResult = await pool.query(
            `SELECT id, user_id FROM tickets
             WHERE id = $1 AND is_deleted = FALSE`,
            [req.params.ticketId]
        );

        if (ticketResult.rows.length === 0) {
            return res.status(404).json({
                message: "Ticket not found"
            });
        }

        const ticket = ticketResult.rows[0];

        if (ticket.user_id !== req.user.id && req.user.role !== "admin") {
            return res.status(403).json({
                message: "Access denied"
            });
        }

        const result = await pool.query(
            `SELECT comments.*, users.name AS user_name, users.role
             FROM comments
             JOIN users ON comments.user_id = users.id
             WHERE comments.ticket_id = $1
             ORDER BY comments.created_at ASC`,
            [req.params.ticketId]
        );

        return res.status(200).json({
            comments: result.rows
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Something went wrong"
        });
    }
});

module.exports = router;
