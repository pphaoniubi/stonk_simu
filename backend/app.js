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
    host: 'localhost',
    user: 'root',
    password: '12345678pP!',
    database: 'stock_simu_db',
});

// Connect to MySQL
db.connect((err) => {
    if (err) {
        console.error('MySQL connection error:', err);
        return;
    }
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

        // Check if user exists
        if (results.length > 0) {
            return res.json({ exists: true, user: results[0] });
        } else {
            return res.json({ exists: false });
        }
    });
});

// Routes
app.get('/stocks', (req, res) => {
    db.query('SELECT * FROM stonks', (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

// Routes
app.get('/holdings', (req, res) => {
    const username = req.query.username;
    if (!username) {
        return res.status(400).json({ error: 'Username is required' });
    }

    db.query('SELECT ticker, quantity FROM holdings WHERE username = ?', [username], (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

app.get('/balance', (req, res) => {
    const username = req.query.username; // Extract username from query
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
                (hp1.close - hp2.close) AS price_difference
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
        console.log(results[0])
        if (results.length === 0) {
            return res.status(404).json({ error: 'Price not found' });
        }
        res.json(results[0]);
    });
});

app.get('/stock_balance', (req, res) => {
    const username = req.query.username; // Extract username from query
    if (!username) {
        return res.status(400).json({ error: 'Username is required' });
    }

    db.query(
        `
            SELECT 
            SUM(h.quantity * s.price) AS stock_holdings_value
            FROM 
            holdings h
            JOIN 
            stonks s
            ON 
            h.ticker = s.ticker
            GROUP BY 
            h.username = ?;
            `, [username], (err, results) => {
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


app.post('/buy', (req, res) => {
    const { username, ticker, quantity } = req.body;
    // Get stock price
    db.query('SELECT price FROM stonks WHERE ticker = ?', [ticker], (err, results) => {
        if (err) throw err;
        const price = results[0].price;
        const cost = price * quantity;

        // Check user balance
        db.query('SELECT balance FROM users WHERE username = ?', [username], (err, results) => {
            if (err) throw err;
            const balance = results[0].balance;

            if (balance >= cost) {
                // Update user balance and holdings
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
    // Check user holdings
    db.query(
        'SELECT quantity FROM holdings WHERE username = ? AND ticker = ?',
        [username, ticker],
        (err, results) => {
            if (err) throw err;
            const currentQuantity = results.length ? results[0].quantity : 0;
            if (currentQuantity >= quantity) {
                // Get stock price and update user balance and holdings
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

app.get('/historical/:ticker', (req, res) => {
  const { ticker } = req.params;

  db.query(
      'SELECT date, close FROM historical_prices WHERE ticker = ? AND updated = 1 ORDER BY date ASC',
      [ticker],
      (err, results) => {
          if (err) throw err;
          res.json(results); // Send data to the frontend
      }
  );
});

app.get('/get-date', (req, res) => {
    db.query(
        `SELECT MAX(date) AS max_date FROM historical_prices WHERE ticker = 'AAPL' AND updated = 1`,
        (err, results) => {
            if (err) throw err;
            res.json(results[0]);
        }
    );
});

app.post('/update-prices', (req, res) => {
  console.log('Updating stock prices...');
  
  // Get the current date from the database
  db.query('SELECT MIN(date) AS min_date FROM historical_prices WHERE updated = 0', (err, results) => {
      if (err) {
          console.error(err);
          res.status(500).json({ error: 'Database query error' });
          return;
      }
      const currentDate = results[0].min_date;

      if (!currentDate) {
          console.log('No more dates to update.');
          res.status(200).json({ message: 'All dates are already processed.' });
          return;
      }

      // Update the prices for the current date
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

              // Mark the date as updated
              db.query(
                  'UPDATE historical_prices SET updated = 1 WHERE date = ?',
                  [currentDate],
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
  });
});


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
