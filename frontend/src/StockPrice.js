import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "./StockPrice.css"
import { Link } from 'react-router-dom';
import { useUser } from "./UserContext";

const moment = require('moment-timezone');
function StockPrice() {
    const [stocks, setStocks] = useState([]);
    const [date, setDate] = useState(null);
    const [response, setResponse] = useState(null);
    const [error, setError] = useState(null);

    const { username } = useUser();

    useEffect(() => {
        fetchDate();
        if (date) {
            fetchStocks();
        }
    }, [date]);

    const fetchStocks = async () => {
        if (!date) {
            console.log("Date is not provided");
            return;
        }
        const response = await axios.get('http://localhost:5000/stocks');
        const stocks = [];

            for (const item of response.data) {
                const priceDifference = await fetchPriceDifference(item.ticker, date);
                if(priceDifference){
                stocks.push({
                    ticker: item.ticker,
                    price: item.price,
                    priceDifference: priceDifference.toFixed(2),
                });
            }
                console.log(priceDifference)
            }
        setStocks(stocks);
    };

    const fetchPriceDifference = async (ticker, date) => {
        try {
            const response = await axios.post('http://localhost:5000/price-difference', {
                params: { ticker: ticker,
                          date: date,
                 }
            });
            return response.data.price_difference;
        } catch (error) {
            console.error('Error fetching price-diff data:', error);
        }
    };
    
    const fetchDate = async () => {
        try {
            const response = await axios.get('http://localhost:5000/get-date', {
                params: { username: username }
            });
            const cstDate = moment.utc(response.data).tz('Asia/Shanghai').format('YYYY-MM-DD');
            setDate(cstDate);
        } catch (error) {
            console.error('Error fetching date: ', error);
        }
    };

    const handleBuy = async (ticker) => {
        try{
            const quantity = prompt(`How many shares of ${ticker} do you want to buy?`);
            if (quantity === null) {
                return;
            }
        
            const quantityInt = parseInt(quantity);
            if (isNaN(quantityInt) || quantityInt <= 0) {
                alert('Please enter a valid quantity.');
                return;
            }
            const response = await axios.post('http://localhost:5000/buy', { username, ticker, quantity: parseInt(quantity) });
        } catch(error){
            alert(error.response.data.message);
        }
        window.location.reload();
    };

    const handleSell = async (ticker) => {
        try{
            const quantity = prompt(`How many shares of ${ticker} do you want to sell?`);
            if (quantity === null) {
                return;
            }
        
            const quantityInt = parseInt(quantity);
            if (isNaN(quantityInt) || quantityInt <= 0) {
                alert('Please enter a valid quantity.');
                return;
            }
            const response = await axios.post('http://localhost:5000/sell', { username, ticker, quantity: parseInt(quantity) });
            if (!response.data.success){
                alert(response.data.message);
            }    
        } catch(error){
            alert(error.response.data.message);
        }
        window.location.reload();
    };

    const fastForward = async () => {
        try {
          setError(null);
    
          const res = await axios.post("http://localhost:5000/update-prices", { username: username });

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
                <button onClick={fastForward} className="fastFButton">Next Day</button>
            </div>
            <h2 style={{ textAlign: 'center' }}>Available Stocks</h2>
            <ul className="stock-ul">
                {stocks.map((stock, index) => (
                    <li key={index} className="stock-li">
                        <div className="stock-info">
                        <Link to={`/stock/${stock.ticker}`} className="link-container">
                            <span className="stock-ticker">{stock.ticker}</span>
                            <span className="stock-quantity"> ${stock.price}</span>
                            <span
                            className={`${stock.priceDifference >= 0 ? 'positive' : 'negative'}`}
                            > {stock.priceDifference}%</span>
                        </Link>
                        </div>

                        <div className="button-group">
                            <button onClick={() => handleBuy(stock.ticker)} className="stock-button">
                                Buy
                            </button>
                            <button onClick={() => handleSell(stock.ticker)} className="stock-button">
                                Sell
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default StockPrice;
