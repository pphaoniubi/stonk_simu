import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "./Navbar.css";

function Navbar() {

    useEffect(() => {
        checkUser();
    }, []);

    const [username] = useState("test_user");
    const [message, setMessage] = useState("Hello!");
    const checkUser = async () => {
        try {
            const response = await axios.post("http://localhost:5000/check-user", {
                username: username.trim(),
            });

            if (response.data.exists) {
                setMessage(`Hello, ${username}!`);
            } else {
                setMessage("Hello!");
            }
        } catch (error) {
            console.error("Error checking user:", error);
            setMessage("An error occurred. Please try again.");
        }
    };
    return (
        <nav className="navbar">
            <div className="logo">
                <a href="/">Stock Simulator</a>
                <a href="/stock-price">Stock Price</a>
            </div>
            <div style={{ fontSize: "24px" }}>{username}</div>
        </nav>
    );
}

export default Navbar;
