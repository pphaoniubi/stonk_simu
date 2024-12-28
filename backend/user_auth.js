const express = require('express');
const mysql = require('mysql2'); // Ensure you have this installed

const router = express.Router();

// Create MySQL Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '12345678pP!',
    database: 'stock_simu_db',
});

// Login endpoint
router.post('/login', (req, res) => {
    const { username } = req.body;

    if (!username || username.trim() === '') {
        return res.status(400).json({ message: 'Username is required' });
    }

    // Check if the username exists
    db.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Database error' });
        }

        if (results.length > 0) {
            // User exists, log in successful
            return res.json({ message: 'Login successful', username });
        } else {
            // User doesn't exist
            return res.status(404).json({ message: 'User not found. Please register.' });
        }
    });
});

// Register endpoint
router.post('/register', (req, res) => {
    const { username } = req.body;

    if (!username || username.trim() === '') {
        return res.status(400).json({ message: 'Username is required' });
    }

    // Check if the username already exists
    db.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Database error' });
        }

        if (results.length > 0) {
            // User already exists
            return res.status(409).json({ message: 'Username already exists. Please login.' });
        } else {
            // Create a new user
            db.query('INSERT INTO users (username) VALUES (?)', [username], (err) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ message: 'Database error' });
                }

                return res.json({ message: 'User registered successfully', username });
            });
        }
    });
});

module.exports = router; // Export the router
