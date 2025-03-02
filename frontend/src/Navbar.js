import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "./Navbar.css";
import { useUser } from "./UserContext";
import { useNavigate } from 'react-router-dom';

function Navbar() {

    useEffect(() => {
        checkUser();
    }, []);

    const [message, setMessage] = useState("Hello!");
    const { username } = useUser();

    const navigate = useNavigate();

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

    const handleLogout = () => {
        localStorage.removeItem('username');
        navigate('/');
        window.location.reload();
      };
    return (
        <nav className="navbar">
            <div className="logo">
                <a href="/main">Stock Simulator</a>
                <a href="/stock-price">Stock Price</a>
            </div>
            <div className="user-controls">
                <span className="username">{username}</span>
                {username && <button className="logout-button" onClick={handleLogout}>Logout</button>}
            </div>
        </nav>
    );
}

export default Navbar;
