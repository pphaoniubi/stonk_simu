const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2');
const axios = require('axios');
const moment = require('moment-timezone');

const authRoutes = require('./user_auth');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

app.use('/auth', authRoutes);

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '12345678pP!',
    database: 'stock_simu_db',
});

db.connect((err) => {
    if (err) {
        console.error('MySQL connection error:', err);
        return;
    }

  db.query('SET time_zone = SYSTEM', (err, result) => {
    if (err) {
      console.error('Error setting time zone:', err);
      return;
    }

    console.log('MySQL session time zone set to SYSTEM');
  });
    console.log('Connected to MySQL database.');
});

app.post("/check-user", (req, res) => {
    const { username } = req.body;

    if (!username) {
        return res.status(400).json({ message: "Username is required" });
    }

    const query = "SELECT username FROM users WHERE username = ?";
    db.query(query, [username], (err, results) => {
        if (err) {
            console.error("Error executing query:", err.message);
            return res.status(500).json({ message: "Database error" });
        }

        if (results.length > 0) {
            return res.json({ exists: true, user: results[0] });
        } else {
            return res.json({ exists: false });
        }
    });
});

app.get('/stocks', (req, res) => {
    db.query('SELECT * FROM stonks', (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

app.get('/holdings', (req, res) => {
    const username = req.query.username;
    if (!username) {
        return res.status(400).json({ error: 'Username is required' });
    }

    db.query('SELECT ticker, quantity FROM holdings WHERE username = ?', [username], (err, results) => {
        if (err) throw err;
        const filteredResults = results.filter(item => item.quantity !== 0);
        res.json(filteredResults);
    });
});

app.get('/balance', (req, res) => {
    const username = req.query.username;
    if (!username) {
        return res.status(400).json({ error: 'Username is required' });
    }

    db.query('SELECT balance FROM users WHERE username = ?', [username], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database query error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(results[0]);
    });
});

app.post('/price-difference', (req, res) => {
    const ticker = req.body.params.ticker;
    const date = req.body.params.date;
    if (!ticker) {
        return res.status(400).json({ error: 'Ticker and Date is required' });
    }

    db.query(`SELECT 
                hp1.ticker, 
                hp1.date AS today_date,
                hp2.date AS yesterday_date,
                (hp1.close - hp2.close)/hp2.close*100 AS price_difference
            FROM 
                historical_prices hp1
            JOIN 
                historical_prices hp2
                ON hp1.ticker = hp2.ticker
                AND hp1.ticker = ?
                AND hp1.date = ?
                AND hp2.date = (
                    SELECT MAX(hp2_inner.date)
                    FROM historical_prices hp2_inner
                    WHERE hp2_inner.ticker = hp1.ticker
                    AND hp2_inner.date < hp1.date
                )
            WHERE 
                hp1.date = ?`, [ticker, date, date], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database query error' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Price not found' });
        }
        res.json(results[0]);
    });
});

app.get('/stock_balance', (req, res) => {
    const username = req.query.username;
    if (!username) {
        return res.status(400).json({ error: 'Username is required' });
    }

    db.query(
        `   SELECT 
            SUM(h.quantity * s.price) AS stock_holdings_value
            FROM 
            holdings h
            JOIN 
            stonks s
            ON 
            h.ticker = s.ticker AND h.username = ?;
            `, [username], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database query error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        console.log(results[0])
        res.json(results[0]);
    });
});

app.post('/buy', (req, res) => {
    const { username, ticker, quantity } = req.body;

    db.query('SELECT price FROM stonks WHERE ticker = ?', [ticker], (err, results) => {
        if (err) throw err;
        const price = results[0].price;
        const cost = price * quantity;

        db.query('SELECT balance FROM users WHERE username = ?', [username], (err, results) => {
            if (err) throw err;
            const balance = results[0].balance;

            if (balance >= cost) {
                db.query('UPDATE users SET balance = balance - ? WHERE username = ?', [cost, username]);
                db.query(
                    'INSERT INTO holdings (username, ticker, quantity) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE quantity = quantity + ?',
                    [username, ticker, quantity, quantity],
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
    const { username, ticker, quantity } = req.body;
    db.query(
        'SELECT quantity FROM holdings WHERE username = ? AND ticker = ?',
        [username, ticker],
        (err, results) => {
            if (err) throw err;
            const currentQuantity = results.length ? results[0].quantity : 0;
            if (currentQuantity >= quantity) {
                db.query('SELECT price FROM stonks WHERE ticker = ?', [ticker], (err, results) => {
                    if (err) throw err;
                    const price = results[0].price;
                    const revenue = price * quantity;

                    db.query('UPDATE users SET balance = balance + ? WHERE username = ?', [revenue, username]);
                    db.query(
                        'UPDATE holdings SET quantity = quantity - ? WHERE username = ? AND ticker = ?',
                        [quantity, username, ticker],
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

app.post('/sell-all', (req, res) => {
    const { username, ticker } = req.body;
    db.query(
        'SELECT quantity FROM holdings WHERE username = ? AND ticker = ?',
        [username, ticker],
        (err, results) => {
            if (err) throw err;
            const quantity = results.length ? results[0].quantity : 0;
                db.query('SELECT price FROM stonks WHERE ticker = ?', [ticker], (err, results) => {
                    if (err) throw err;
                    const price = results[0].price;
                    const revenue = price * quantity;
                    
                    db.query('UPDATE users SET balance = balance + ? WHERE username = ?', [revenue, username]);
                    db.query(
                        'UPDATE holdings SET quantity = quantity - ? WHERE username = ? AND ticker = ?',
                        [quantity, username, ticker],
                        (err) => {
                            if (err) throw err;
                            res.json({ success: true });
                        }
                    );
                });
        }
    );
});


app.post('/sell-everything', async (req, res) => {
    const { username } = req.body;

    if (!username) {
        return res.status(400).json({ error: 'Username is required' });
    }

    db.query('SELECT * FROM holdings WHERE username = ?', [username], async (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal server error' });
        }

        try {
            for (const holding of results) {
                await axios.post('http://localhost:5000/sell-all', {
                    username : username,
                    ticker: holding.ticker,
                });
            }

            res.json({ success: true, message: 'All holdings sold' });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Error occurred while selling holdings' });
        }
    });
});


app.post('/restart', (req, res) => {
    const { username } = req.body;

    if (!username) {
        return res.status(400).json({ error: 'Username is required' });
    }

    db.query(
        'UPDATE holdings SET quantity = 0 WHERE username = ?',
        [username],
        (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Internal server error' });
            }
            res.json({ success: true, message: 'All holdings sold' });
        });
});

app.get('/historical/:ticker/:username', async (req, res) => {
  const { ticker, username } = req.params;
    try {
        const response = await axios.get('http://localhost:5000/get-date', {
            params: { username: username }
        });
        const date = moment.utc(response.data).tz('Asia/Shanghai').format('YYYY-MM-DD');
        db.query(
            'SELECT date, close FROM historical_prices WHERE ticker = ? AND date < ? ORDER BY date ASC',
            [ticker, date],
            (err, results) => {
                if (err) throw err;
                res.json(results);
            }
        );
    } catch(error){
        console.error('Error calling the other endpoint:', error);
        res.status(500).json({ error: 'Failed to fetch the date' });
    }
});

app.get('/get-date', (req, res) => {
    const { username } = req.query;
    console.log(username)
    db.query(
        `SELECT stock_date FROM users WHERE username = ?`,
        [username],
        (err, results) => {
            if (err) throw err;
            console.log("stock_date: ",results)
            res.json(results[0].stock_date);
        }
    );
});

app.post('/update-prices', (req, res) => {
    const { username } = req.body;
    db.query(`SELECT stock_date FROM users WHERE username = ?`,
        [username],
        (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Database query error' });
            return;
        }
        const currentDate = results[0].stock_date;
        db.query(
            `UPDATE stonks s
            JOIN historical_prices hp ON s.ticker = hp.ticker
            SET s.price = hp.close
            WHERE hp.date = ?`, 
            [currentDate], 
            (err) => {
                if (err) {
                    console.error(err);
                    res.status(500).json({ error: 'Failed to update stock prices.' });
                    return;
                }

                console.log(`Stock prices updated for date: ${currentDate}`);

                db.query(
                    'SELECT MIN(date) AS next_day FROM historical_prices WHERE date > ?',
                    [currentDate],
                    (err, results) => {
                        if (err) {
                            console.error(err);
                            res.status(500).json({ error: 'Failed to mark date as updated.' });
                            return;
                        }
                        const nextDay = results[0].next_day
                        if (currentDate === nextDay) {
                            res.status(207).json({ message: 'You have reached the end of this timeline.' });
                            return;
                        }
                        console.log("next day: ",nextDay)
                        db.query(
                            'UPDATE users SET stock_date = ?',
                            [nextDay],
                            (err) => {
                                if (err) {
                                    console.error(err);
                                    res.status(500).json({ error: 'Failed to mark date as updated.' });
                                    return;
                                }
                                console.log(`Marked date ${currentDate} as updated.`);
                                res.status(200).json({ message: `Stock prices updated for date: ${currentDate}` });
                            }
                        );
                    }
                );
            }
        );
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
