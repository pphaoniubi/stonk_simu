const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Mock Data
let stocks = [
  { id: 1, symbol: 'AAPL', price: 150 },
  { id: 2, symbol: 'GOOGL', price: 2800 },
  { id: 3, symbol: 'AMZN', price: 3400 },
];

// Routes
app.get('/api/stocks', (req, res) => {
  res.json(stocks);
});

app.post('/api/buy', (req, res) => {
  const { symbol, quantity } = req.body;
  res.json({ message: `Bought ${quantity} shares of ${symbol}` });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
