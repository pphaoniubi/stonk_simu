const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Create MySQL Connection
const db = mysql.createConnection({
    host: 'localhost',    // Your MySQL host
    user: 'root',         // Your MySQL username
    password: '12345678pP!',         // Your MySQL password
    database: 'stock_simu_db',   // Your database name
});

// Connect to MySQL
db.connect((err) => {
    if (err) {
        console.error('MySQL connection error:', err);
        return;
    }
    console.log('Connected to MySQL database.');
});

// Routes
app.get('/stocks', (req, res) => {
    db.query('SELECT * FROM stocks', (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

app.post('/buy', (req, res) => {
    const { user, ticker, quantity } = req.body;

    // Get stock price
    db.query('SELECT price FROM stocks WHERE ticker = ?', [ticker], (err, results) => {
        if (err) throw err;
        const price = results[0].price;
        const cost = price * quantity;

        // Check user balance
        db.query('SELECT balance FROM users WHERE username = ?', [user], (err, results) => {
            if (err) throw err;
            const balance = results[0].balance;

            if (balance >= cost) {
                // Update user balance and holdings
                db.query('UPDATE users SET balance = balance - ? WHERE username = ?', [cost, user]);
                db.query(
                    'INSERT INTO holdings (username, ticker, quantity) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE quantity = quantity + ?',
                    [user, ticker, quantity, quantity],
                    (err) => {
                        if (err) throw err;
                        res.json({ success: true });
                    }
                );
            } else {
                res.status(400).json({ success: false, message: 'Insufficient balance' });
            }
        });
    });
});

app.post('/sell', (req, res) => {
    const { user, ticker, quantity } = req.body;

    // Check user holdings
    db.query(
        'SELECT quantity FROM holdings WHERE username = ? AND ticker = ?',
        [user, ticker],
        (err, results) => {
            if (err) throw err;
            const currentQuantity = results.length ? results[0].quantity : 0;

            if (currentQuantity >= quantity) {
                // Get stock price and update user balance and holdings
                db.query('SELECT price FROM stocks WHERE ticker = ?', [ticker], (err, results) => {
                    if (err) throw err;
                    const price = results[0].price;
                    const revenue = price * quantity;

                    db.query('UPDATE users SET balance = balance + ? WHERE username = ?', [revenue, user]);
                    db.query(
                        'UPDATE holdings SET quantity = quantity - ? WHERE username = ? AND ticker = ?',
                        [quantity, user, ticker],
                        (err) => {
                            if (err) throw err;
                            res.json({ success: true });
                        }
                    );
                });
            } else {
                res.status(400).json({ success: false, message: 'Not enough shares to sell' });
            }
        }
    );
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
