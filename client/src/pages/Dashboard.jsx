
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

function Dashboard() {
    const [tickets, setTickets] = useState([]);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("Technical");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user") || "null");

    const fetchTickets = async () => {
        try {
            const response = await api.get("/tickets/my-tickets");
            setTickets(response.data.tickets || []);
        } catch (err) {
            setError(err.response?.data?.message || "Unable to load tickets");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!localStorage.getItem("token")) {
            navigate("/login");
            return;
        }

        fetchTickets();
    }, []);

    const handleCreateTicket = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");

        try {
            await api.post("/tickets", {
                title,
                description,
                category
            });

            setTitle("");
            setDescription("");
            setCategory("Technical");

            setMessage("Ticket created successfully!");

            fetchTickets();
        } catch (err) {
            setError(err.response?.data?.message || "Ticket creation failed");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
    };

    return (
        <div className="dashboard-container">

            <header className="dashboard-header">
                <div>
                    <h1>ResolveIT</h1>
                    <p>Welcome, {user?.name || "User"}</p>
                </div>

                <button onClick={handleLogout}>Logout</button>
            </header>

            <main className="dashboard-content">

                <section className="ticket-form-card">
                    <h2>Create Support Ticket</h2>

                    <form onSubmit={handleCreateTicket}>
                        <label>Ticket Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter ticket title"
                            required
                        />

                        <label>Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe your issue"
                            required
                        />

                        <label>Category</label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                        >
                            <option value="Technical">Technical</option>
                            <option value="Billing">Billing</option>
                            <option value="Account">Account</option>
                            <option value="Other">Other</option>
                        </select>

                        <button type="submit">Create Ticket</button>
                    </form>

                    {error && <p className="error">{error}</p>}
                    {message && <p className="success">{message}</p>}
                </section>

                <section className="tickets-section">
                    <h2>My Support Tickets</h2>

                    {loading ? (
                        <p>Loading tickets...</p>
                    ) : tickets.length === 0 ? (
                        <p>You haven't created any tickets yet.</p>
                    ) : (
                        <div className="tickets-list">
                            {tickets.map((ticket) => (
                                <div className="ticket-card" key={ticket.id}>
                                    <h3>{ticket.title}</h3>

                                    <p>{ticket.description}</p>

                                    <p>
                                        <strong>Category:</strong> {ticket.category}
                                    </p>

                                    <p>
                                        <strong>Status:</strong> {ticket.status}
                                    </p>

                                    <p>
                                        <strong>Priority:</strong> {ticket.priority}
                                    </p>

                                    <Link to={`/tickets/${ticket.id}`}>
                                        View Details
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

            </main>
        </div>
    );
}

export default Dashboard;
