import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [stocks, setStocks] = useState([]);
  const [symbol, setSymbol] = useState('');
  const [quantity, setQuantity] = useState('');

  useEffect(() => {
    axios.get('http://localhost:5000/api/stocks')
      .then(response => setStocks(response.data))
      .catch(error => console.error(error));
  }, []);

  const buyStock = () => {
    axios.post('http://localhost:5000/api/buy', { symbol, quantity })
      .then(response => alert(response.data.message))
      .catch(error => console.error(error));
  };

  return (
    <div>
      <h1>Stock Simulator</h1>
      <h2>Available Stocks</h2>
      <ul>
        {stocks.map(stock => (
          <li key={stock.id}>{stock.symbol}: ${stock.price}</li>
        ))}
      </ul>

      <h2>Buy Stock</h2>
      <input 
        type="text" 
        placeholder="Symbol" 
        value={symbol} 
        onChange={(e) => setSymbol(e.target.value)} 
      />
      <input 
        type="number" 
        placeholder="Quantity" 
        value={quantity} 
        onChange={(e) => setQuantity(e.target.value)} 
      />
      <button onClick={buyStock}>Buy</button>
    </div>
  );
}

export default App;
