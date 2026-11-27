
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

function AdminDashboard() {
    const [tickets, setTickets] = useState([]);
    const [statusFilter, setStatusFilter] = useState("");
    const [priorityFilter, setPriorityFilter] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user") || "null");

    const fetchTickets = async () => {
        setLoading(true);
        setError("");

        try {
            const response = await api.get("/admin/tickets", {
                params: {
                    status: statusFilter || undefined,
                    priority: priorityFilter || undefined
                }
            });

            setTickets(response.data.tickets || []);
        } catch (err) {
            setError(err.response?.data?.message || "Unable to load tickets");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!localStorage.getItem("token") || user?.role !== "admin") {
            navigate("/login");
            return;
        }

        fetchTickets();
    }, [statusFilter, priorityFilter]);

    const updateTicket = async (ticketId, status, priority) => {
        try {
            await api.put(`/admin/tickets/${ticketId}`, {
                status,
                priority
            });

            fetchTickets();
        } catch (err) {
            setError(err.response?.data?.message || "Unable to update ticket");
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
                    <h1>ResolveIT Admin</h1>
                    <p>Welcome, {user?.name || "Admin"}</p>
                </div>

                <button onClick={handleLogout}>Logout</button>
            </header>

            <main className="admin-content">
                <h2>All Support Tickets</h2>

                <div className="filters">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="">All Statuses</option>
                        <option value="Open">Open</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Closed">Closed</option>
                    </select>

                    <select
                        value={priorityFilter}
                        onChange={(e) => setPriorityFilter(e.target.value)}
                    >
                        <option value="">All Priorities</option>
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                    </select>
                </div>

                {error && <p className="error">{error}</p>}

                {loading ? (
                    <p>Loading tickets...</p>
                ) : tickets.length === 0 ? (
                    <p>No tickets found.</p>
                ) : (
                    <div className="tickets-list">
                        {tickets.map((ticket) => (
                            <div className="ticket-card" key={ticket.id}>
                                <h3>{ticket.title}</h3>

                                <p>{ticket.description}</p>
                                <p><strong>Category:</strong> {ticket.category}</p>
                                <p><strong>Created by:</strong> {ticket.name}</p>

                                <label>Status</label>
                                <select
                                    value={ticket.status}
                                    onChange={(e) =>
                                        updateTicket(
                                            ticket.id,
                                            e.target.value,
                                            ticket.priority
                                        )
                                    }
                                >
                                    <option value="Open">Open</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Resolved">Resolved</option>
                                    <option value="Closed">Closed</option>
                                </select>

                                <label>Priority</label>
                                <select
                                    value={ticket.priority}
                                    onChange={(e) =>
                                        updateTicket(
                                            ticket.id,
                                            ticket.status,
                                            e.target.value
                                        )
                                    }
                                >
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                </select>

                                <Link to={`/tickets/${ticket.id}`}>
                                    View Details & Comments
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

export default AdminDashboard;
