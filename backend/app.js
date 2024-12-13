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
    db.query('SELECT * FROM stonks', (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

app.post('/buy', (req, res) => {
    const { user, ticker, quantity } = req.body;

    // Get stock price
    db.query('SELECT price FROM stonks WHERE ticker = ?', [ticker], (err, results) => {
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
                db.query('SELECT price FROM stonks WHERE ticker = ?', [ticker], (err, results) => {
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

app.get('/historical/:ticker', (req, res) => {
  const { ticker } = req.params;

  db.query(
      'SELECT date, close FROM historical_prices WHERE ticker = ? ORDER BY date ASC',
      [ticker],
      (err, results) => {
          if (err) throw err;
          res.json(results); // Send data to the frontend
      }
  );
});

app.post('/update-prices', (req, res) => {
  console.log('Updating stock prices...');
  
  // Get the current date from the database
  db.query('SELECT MIN(date) AS current_date FROM historical_prices WHERE updated = 0', (err, results) => {
      if (err) {
          console.error(err);
          res.status(500).json({ error: 'Database query error' });
          return;
      }

      const currentDate = results[0].current_date;

      if (!currentDate) {
          console.log('No more dates to update.');
          res.status(200).json({ message: 'All dates are already processed.' });
          return;
      }

      // Update the prices for the current date
      db.query(
          `UPDATE stocks s
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
