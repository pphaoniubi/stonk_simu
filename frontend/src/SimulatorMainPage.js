import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "./SimulatorMainPage.css"
import { Link } from 'react-router-dom';

const moment = require('moment-timezone');
function SimulatorMainPage() {
    const [portfolio, setPortfolio] = useState({ balance: 10, holdings: {} });
    const [stockBalance, setStockBalance] = useState(10);
    const [date, setDate] = useState(null);
    const [holdings, setHoldings] = useState([]);
    const [username] = useState("test_user");
    const [response, setResponse] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchPortfolioData();
        fetchStockBalance();
        fetchDate();
        fetchHoldings();
    }, []);

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
            const kstDate = moment.utc(response.data.max_date).tz('Asia/Seoul').format('YYYY-MM-DD');
            setDate(kstDate)    //yyyy-mm-dd format
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
        if (quantity === null) {
            return;  // Exit the function and do nothing
        }
    
        // Check if the entered quantity is a valid number
        const quantityInt = parseInt(quantity);
        if (isNaN(quantityInt) || quantityInt <= 0) {
            alert('Please enter a valid quantity.');
            return;
        }
        const response = await axios.post('http://localhost:5000/buy', { username, ticker, quantity: parseInt(quantity) });
        if (!response.data.success){
            alert(response.data.message);
        }
        window.location.reload();
    };

    const handleSell = async (ticker) => {
        const quantity = prompt(`How many shares of ${ticker} do you want to sell?`);
        if (quantity === null) {
            return;  // Exit the function and do nothing
        }
    
        // Check if the entered quantity is a valid number
        const quantityInt = parseInt(quantity);
        if (isNaN(quantityInt) || quantityInt <= 0) {
            alert('Please enter a valid quantity.');
            return;
        }
        const response = await axios.post('http://localhost:5000/sell', { username, ticker, quantity: parseInt(quantity) });
        if (!response.data.success){
            alert(response.data.message);
        }
        window.location.reload();
    };

    const handleSellAll = async (ticker) => {

        const response = await axios.post('http://localhost:5000/sell-all', { username, ticker });
        if (!response.data.success){
            alert(response.data.message);
        }
        window.location.reload();
    };

    const handleSellEverything = async (ticker) => {

        const response = await axios.post('http://localhost:5000/sell-everything', { username });
        if (!response.data.success){
            alert(response.data.message);
        }
        window.location.reload();
    };

    const fastForward = async () => {
        try {
          setError(null);
    
          const res = await axios.post("http://localhost:5000/update-prices");

          setResponse(res.data);

          window.location.reload();
        } catch (err) {
          setError(err.message);
        }
      };

    return (
        <div>
            <div className="dateContainer">
                <h2 className="date">{date}</h2>
                <button onClick={fastForward} className="fastFButton">Next</button>
            </div>
            <h2>Balance: ${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(portfolio.balance.toFixed(2))}</h2>
            <h2>Stock Holdings: ${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(stockBalance)}</h2>
            <button onClick={() => handleSellEverything()} className="stock-button">
                                Sell Everything
            </button>
            <div className="holdings-container">
            {holdings.length > 0 && <h2>Your Holdings</h2>}
            <ul className="bubble-list">
                {holdings.map((item, index) => (
                <li key={index} className="bubble">
                    <Link to={`/stock/${item.ticker}`} className="link-container">
                        <span className="ticker">{item.ticker} :</span>
                        <span className="quantity">{item.quantity}</span>
                    </Link>
                    <div className="button-group">
                            <button onClick={() => handleBuy(item.ticker)} className="stock-button">
                                Buy
                            </button>
                            <button onClick={() => handleSell(item.ticker)} className="stock-button">
                                Sell
                            </button>
                            <button onClick={() => handleSellAll(item.ticker)} className="stock-button">
                                Sell All
                            </button>
                    </div>
                </li>
                ))}
            </ul>
            </div>
        </div>
    );
}

export default SimulatorMainPage;