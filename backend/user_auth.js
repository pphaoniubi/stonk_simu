const express = require('express');
const mysql = require('mysql2');

const router = express.Router();

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '12345678pP!',
    database: 'stock_simu_db',
});

router.post('/login', (req, res) => {
    const { username } = req.body;

    if (!username || username.trim() === '') {
        return res.status(400).json({ message: 'Username is required' });
    }

    db.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Database error' });
        }

        if (results.length > 0) {
            return res.json({ message: 'Login successful', username });
        } else {
            return res.status(404).json({ message: 'User not found. Please register.' });
        }
    });
});

router.post('/register', (req, res) => {
    const { username } = req.body;

    if (!username || username.trim() === '') {
        return res.status(400).json({ message: 'Username is required' });
    }

    db.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Database error' });
        }

        if (results.length > 0) {
            return res.status(409).json({ message: 'Username already exists. Please login.' });
        } else {
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

module.exports = router;
