import React, { useState, useEffect } from "react";
import { useUser } from "./UserContext";
import { useNavigate } from 'react-router-dom';
import "./AuthPage.css"

function AuthPage() {
    const { username, setUsername } = useUser(); // Store the logged-in username
    const [input, setInput] = useState(""); // Input field for username
    const [message, setMessage] = useState(""); // Message to display success/error

    const navigate = useNavigate();

    useEffect(() => {
        // Check if username exists in localStorage
        const username = localStorage.getItem('username');
        
        // If username exists, redirect to the main page
        if (username) {
            navigate('/main'); // Change '/main' to your actual main page route
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
                setUsername(data.username); // Set the username on successful login/register
                setMessage(""); // Clear any previous messages
            } else {
                setMessage(data.message); // Display error message
            }
        } catch (error) {
            console.error("Error:", error);
            setMessage("An error occurred while processing your request.");
        }
    };

    if (username) {
        // Display user-specific content after login/registration
        navigate('/main');
    }

    // Render the login/register form if the user is not logged in
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
                {message && <p style={{ color: "red" }}>{message}</p>} {/* Display error/success messages */}
            </div>
        </div>
    );
}

export default AuthPage;
