
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../services/api";

function TicketDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [ticket, setTicket] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchDetails = async () => {
        try {
            const [ticketResponse, commentResponse] = await Promise.all([
                api.get(`/tickets/${id}`),
                api.get(`/tickets/${id}/comments`)
            ]);

            setTicket(ticketResponse.data.ticket);
            setComments(commentResponse.data.comments || []);
        } catch (err) {
            setError(
                err.response?.data?.message || "Unable to load ticket details"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!localStorage.getItem("token")) {
            navigate("/login");
            return;
        }

        fetchDetails();
    }, [id]);

    const handleAddComment = async (e) => {
        e.preventDefault();

        if (!newComment.trim()) return;

        try {
            await api.post(`/tickets/${id}/comments`, {
                content: newComment
            });

            setNewComment("");
            await fetchDetails();
        } catch (err) {
            setError(
                err.response?.data?.message || "Unable to add comment"
            );
        }
    };

    if (loading) return <p>Loading ticket details...</p>;

    if (error && !ticket) return <p className="error">{error}</p>;

    if (!ticket) return <p>Ticket not found.</p>;

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div>
                    <h1>ResolveIT</h1>
                    <p>Ticket Details</p>
                </div>

                <Link to="/dashboard">Back to Dashboard</Link>
            </header>

            <main className="ticket-details-container">
                <section className="ticket-form-card">
                    <h2>{ticket.title}</h2>

                    <p>{ticket.description}</p>

                    <p><strong>Category:</strong> {ticket.category}</p>
                    <p><strong>Status:</strong> {ticket.status}</p>
                    <p><strong>Priority:</strong> {ticket.priority}</p>

                    <p>
                        <strong>Created:</strong>{" "}
                        {new Date(ticket.created_at).toLocaleString()}
                    </p>
                </section>

                <section className="ticket-form-card">
                    <h2>Comments</h2>

                    {comments.length === 0 ? (
                        <p>No comments yet.</p>
                    ) : (
                        comments.map((comment) => (
                            <div className="comment-card" key={comment.id}>
                                <p>{comment.content}</p>
                                <small>
                                    By {comment.name || "User"} •{" "}
                                    {new Date(comment.created_at).toLocaleString()}
                                </small>
                            </div>
                        ))
                    )}

                    <form onSubmit={handleAddComment}>
                        <label>Add a comment</label>

                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Write your comment..."
                            required
                        />

                        <button type="submit">Post Comment</button>
                    </form>

                    {error && <p className="error">{error}</p>}
                </section>
            </main>
        </div>
    );
}

export default TicketDetails;
