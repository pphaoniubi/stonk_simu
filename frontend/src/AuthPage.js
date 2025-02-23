import React, { useState, useEffect } from "react";
import { useUser } from "./UserContext";
import { useNavigate } from 'react-router-dom';
import "./AuthPage.css"

function AuthPage() {
    const { username, setUsername } = useUser();
    const [input, setInput] = useState("");
    const [message, setMessage] = useState("");

    const navigate = useNavigate();

    useEffect(() => {

        const username = localStorage.getItem('username');
        
        if (username) {
            navigate('/main');
        }
    }, [navigate]);

    const handleSubmit = async (endpoint) => {
        try {
            const response = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: input.trim() }),
            });

            const data = await response.json();

            if (response.ok) {
                setUsername(data.username);
                setMessage("");
            } else {
                setMessage(data.message);
            }
        } catch (error) {
            console.error("Error:", error);
            setMessage("An error occurred while processing your request.");
        }
    };

    if (username) {
        navigate('/main');
    }

    return (
        <div className="login-form-container">
            <div className="login-form-box">
                <h2>Register or Log In</h2>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Enter your username"
                    className="login-form-input"
                />
                <div  className="login-button-group">
                    <button className="login-form-button" onClick={() => handleSubmit("http://localhost:5000/auth/login")}>Log In</button>
                    <button className="login-form-button" onClick={() => handleSubmit("http://localhost:5000/auth/register")}>Register</button>
                </div>
                {message && <p style={{ color: "red" }}>{message}</p>}
            </div>
        </div>
    );
}

export default AuthPage;
