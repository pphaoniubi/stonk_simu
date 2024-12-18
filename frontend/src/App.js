import React, { useState, useEffect } from 'react';
import axios from 'axios';
import StockChart from './StockChart';
import { format } from 'date-fns';
import "./App.css"


function App() {
    const [stocks, setStocks] = useState({});
    const [portfolio, setPortfolio] = useState({ balance: 10, holdings: {} });
    const [stockBalance, setStockBalance] = useState(10);
    const [date, setDate] = useState(null);
    const [holdings, setHoldings] = useState([]);
    const [username] = useState("test_user");
    const [response, setResponse] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchStocks();
        fetchPortfolioData();
        fetchStockBalance();
        fetchDate();
        fetchHoldings();
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
            setPortfolio((prevPortfolio) => ({
                ...prevPortfolio,
                balance: balance,
            }));
        } catch (error) {
            console.error('Error fetching portfolio data:', error);
        }
    };

    const fetchStockBalance = async () => {
        try {
            // Fetch user balance
            const response = await axios.get('http://localhost:5000/stock_balance', {
                params: { username: username }
            });
            const stock_balance = parseFloat(response.data.stock_holdings_value);
            setStockBalance(stock_balance);
        } catch (error) {
            console.error('Error fetching portfolio data:', error);
        }
    };

    const fetchDate = async () => {
        try {
            // Fetch user balance
            const response = await axios.get('http://localhost:5000/get-date');
            setDate(format(new Date(response.data.max_date), 'MMMM dd, yyyy'));
        } catch (error) {
            console.error('Error fetching date: ', error);
        }
    };

    
    const fetchHoldings = async () => {
        try {
            // Fetch user balance
            const response = await axios.get('http://localhost:5000/holdings', {
                params: { username: username }
            });
            const holdings = response.data.map(item => ({
                ticker: item.ticker,
                quantity: item.quantity
            }));
            setHoldings(holdings)
        } catch (error) {
            console.error('Error fetching date: ', error);
        }
    };

    const handleBuy = async (ticker) => {
        const quantity = prompt(`How many shares of ${ticker} do you want to buy?`);
        const response = await axios.post('http://localhost:5000/buy', { username, ticker, quantity: parseInt(quantity) });
        if (!response.data.success){
            alert(response.data.message);
        }
    };

    const handleSell = async (ticker) => {
        const quantity = prompt(`How many shares of ${ticker} do you want to sell?`);
        const response = await axios.post('http://localhost:5000/sell', { username, ticker, quantity: parseInt(quantity) });
        if (!response.data.success){
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

          window.location.reload();
        } catch (err) {
          // Handle errors
          setError(err.message);
        }
      };

    return (
        <div>
            <h2 className="date">{date}</h2>
            <h2>Balance: ${portfolio.balance.toFixed(2)}</h2>
            <h2>Stock Holdings: ${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(stockBalance)}</h2>
            <h3>Available Stocks</h3>
            <ul>
                {Object.keys(stocks).map((ticker) => (
                    <li key={ticker}>
                        {ticker}: {stocks[ticker]}
                        <button onClick={() => handleBuy(stocks[ticker])}>Buy</button>
                        <button onClick={() => handleSell(stocks[ticker])}>Sell</button>
                    </li>
                ))}
            </ul>

            <h3>Your Holdings</h3>
            <ul className="bubble-list">
                {holdings.map((item, index) => (
                    <li key={index} className="bubble">
                        <span className="ticker">{item.ticker}</span>
                        <span className="quantity">{item.quantity}</span>
                    </li>
                ))}
            </ul>
            <ul>
                {Object.keys(portfolio.holdings).map((ticker) => (
                    <li key={ticker}>
                        {ticker}: {portfolio.holdings[ticker]} shares
                    </li>
                ))}
            </ul>
            <button onClick={fastForward}>Next</button>
            <h1>Stock Chart</h1>
            <StockChart ticker="TSLA" />
        </div>
    );
}

export default App;
