import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import StockChart from './StockChart';
import "./StockDetailPage.css"
import { useUser } from "./UserContext";

const StockDetailPage = () => {
  const { ticker } = useParams();

  const { username } = useUser();
  return (
    <div>
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
