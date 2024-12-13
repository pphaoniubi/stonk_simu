import React, { useState, useEffect } from 'react';
import axios from 'axios';
import StockChart from './StockChart';


function App() {
    const [stocks, setStocks] = useState({});
    const [portfolio, setPortfolio] = useState({ balance: 10000, holdings: {} });
    const [user] = useState("test_user"); // Mock user

    useEffect(() => {
        fetchStocks();
    }, []);

    const fetchStocks = async () => {
        const response = await axios.get('http://localhost:5000/stocks');
        console.log(response)
        setStocks(response.data);
    };

    const handleBuy = async (ticker) => {
        const quantity = prompt(`How many shares of ${ticker} do you want to buy?`);
        const response = await axios.post('http://localhost:5000/buy', { user, ticker, quantity: parseInt(quantity) });
        if (response.data.success) {
            setPortfolio(response.data.portfolio);
        } else {
            alert(response.data.message);
        }
    };

    const handleSell = async (ticker) => {
        const quantity = prompt(`How many shares of ${ticker} do you want to sell?`);
        const response = await axios.post('http://localhost:5000/sell', { user, ticker, quantity: parseInt(quantity) });
        if (response.data.success) {
            setPortfolio(response.data.portfolio);
        } else {
            alert(response.data.message);
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
                        <button onClick={() => handleBuy(ticker)}>Buy</button>
                        <button onClick={() => handleSell(ticker)}>Sell</button>
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
            <h1>Stock Chart</h1>
            <StockChart ticker="AAPL" />
        </div>
    );
}

export default App;
