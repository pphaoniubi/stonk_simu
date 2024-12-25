import React, { useState } from "react";
import { useUser } from "./UserContext";

function AuthPage() {
    const { username, setUsername } = useUser(); // Store the logged-in username
    const [input, setInput] = useState(""); // Input field for username
    const [message, setMessage] = useState(""); // Message to display success/error

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
        console.log(username)
        return (
            <div>
                <h1>Welcome, {username}!</h1>
                <p>You are now logged in.</p>
                {/* You can add user-specific components like charts here */}
            </div>
        );
    }

    // Render the login/register form if the user is not logged in
    return (
        <div>
            <h2>Register or Log In</h2>
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter your username"
            />
            <div>
                <button onClick={() => handleSubmit("http://localhost:5000/auth/login")}>Log In</button>
                <button onClick={() => handleSubmit("http://localhost:5000/auth/register")}>Register</button>
            </div>
            {message && <p style={{ color: "red" }}>{message}</p>} {/* Display error/success messages */}
        </div>
    );
}

export default AuthPage;
