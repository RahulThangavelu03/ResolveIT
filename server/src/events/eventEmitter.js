const EventEmitter = require("events");
const pool = require("../config/db");

const eventEmitter = new EventEmitter();

// Listen for ticket activity
eventEmitter.on("ticketActivity", async (data) => {
    try {
        await pool.query(
            `INSERT INTO activity_logs (ticket_id, actor_id, action, metadata)
             VALUES ($1, $2, $3, $4)`,
            [
                data.ticketId,
                data.actorId,
                data.action,
                JSON.stringify(data.metadata || {})
            ]
        );

        console.log(`Activity recorded: ${data.action}`);

    } catch (error) {
        console.error("Activity log error:", error);
    }
});

module.exports = eventEmitter;
