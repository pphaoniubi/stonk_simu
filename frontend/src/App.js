import React, { useState, useEffect } from 'react';
import axios from 'axios';
import StockChart from './StockChart';


function App() {
    const [stocks, setStocks] = useState({});
    const [portfolio, setPortfolio] = useState({ balance: 10, holdings: {} });
    const [username] = useState("test_user"); // Mock user
    const [response, setResponse] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchStocks();
        fetchPortfolioData();
    }, []);

    const fetchStocks = async () => {
        const response = await axios.get('http://localhost:5000/stocks');
        const stocks = response.data.map(item => item.ticker);
        setStocks(stocks);
    };

    const fetchPortfolioData = async () => {
        try {
            // Fetch user balance
            const response = await axios.get('http://localhost:5000/balance', {
                params: { username: username }
            });
            const balance = parseFloat(response.data.balance);
            console.log(balance);
            setPortfolio((prevPortfolio) => ({
                ...prevPortfolio,
                balance: balance,
            }));
        } catch (error) {
            console.error('Error fetching portfolio data:', error);
        }
    };
    const handleBuy = async (ticker) => {
        const quantity = prompt(`How many shares of ${ticker} do you want to buy?`);
        const response = await axios.post('http://localhost:5000/buy', { username, ticker, quantity: parseInt(quantity) });
        if (response.data.success){
            alert(response.data.message);
        }
    };

    const handleSell = async (ticker) => {
        console.log(ticker)
        const quantity = prompt(`How many shares of ${ticker} do you want to sell?`);
        const response = await axios.post('http://localhost:5000/sell', { username, ticker, quantity: parseInt(quantity) });
        if (response.data.success) {
            setPortfolio(response.data.portfolio);
        } else {
            alert(response.data.message);
        }
    };

    const fastForward = async () => {
        try {
          // Clear previous errors
          setError(null);
    
          // Replace the URL with your endpoint
          const res = await axios.post("http://localhost:5000/update-prices");
    
          // Update state with response data
          setResponse(res.data);
        } catch (err) {
          // Handle errors
          setError(err.message);
        }
      };

    return (
        <div>
            <h1>Stock Simulator</h1>
            <h2>Balance: ${portfolio.balance.toFixed(2)}</h2>

            <h3>Available Stocks</h3>
            <ul>
                {Object.keys(stocks).map((ticker) => (
                    <li key={ticker}>
                        {ticker}: ${stocks[ticker]}
                        <button onClick={() => handleBuy(stocks[ticker])}>Buy</button>
                        <button onClick={() => handleSell(stocks[ticker])}>Sell</button>
                    </li>
                ))}
            </ul>

            <h3>Your Holdings</h3>
            <ul>
                {Object.keys(portfolio.holdings).map((ticker) => (
                    <li key={ticker}>
                        {ticker}: {portfolio.holdings[ticker]} shares
                    </li>
                ))}
            </ul>
            <button onClick={fastForward}>Fast Forward</button>
            <h1>Stock Chart</h1>
            <StockChart ticker="TSLA" />
        </div>
    );
}

export default App;
