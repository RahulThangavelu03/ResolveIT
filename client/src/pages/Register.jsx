
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function Register() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
        // 1. Register user
        await api.post("/auth/register", {
            name,
            email,
            password
        });

        // 2. Automatically login
        const response = await api.post("/auth/login", {
            email,
            password
        });

        // 3. Store authentication details
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));

        // 4. Navigate to dashboard
        navigate("/dashboard");

    } catch (error) {
        setError(
            error.response?.data?.message || "Registration failed"
        );
    }
};

    return (
        <div className="auth-container">
            <form className="auth-card" onSubmit={handleRegister}>
                <h1>ResolveIT</h1>
                <p>Create your support account.</p>

                {error && <p className="error">{error}</p>}
                {success && <p style={{ color: "green" }}>{success}</p>}

                <label>Name</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />

                <label>Email</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                   <label>Password</label>

                <div className="password-wrapper">
                <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required />

    <button
        type="button"
        className="password-toggle"
        onClick={() => setShowPassword(!showPassword)}
    >
        {showPassword ? "Hide" : "Show"}
    </button>
</div>
                <button type="submit">Register</button>

                <p>
                    Already have an account? <Link to="/login">Login</Link>
                </p>
            </form>
        </div>
    );
}

export default Register;
