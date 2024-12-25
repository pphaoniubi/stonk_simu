import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import StockChart from './StockChart'; // Assuming you have this component
import "./StockDetailPage.css"
import { useUser } from "./UserContext";

const StockDetailPage = () => {
  const { ticker } = useParams();

  const { username } = useUser();
  return (
    <div>
      {/* Conditionally render StockChart if a stock is selected */}
      {ticker && (
        <div className="centered-container">
          <h2 className="centered-heading">{ticker}</h2>
          <StockChart ticker={ticker} username={username}/>
        </div>
      )}
    </div>
  );
};

export default StockDetailPage;
