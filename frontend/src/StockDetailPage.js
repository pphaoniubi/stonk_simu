import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import StockChart from './StockChart'; // Assuming you have this component

const StockDetailPage = () => {

  const { ticker } = useParams();

  return (
    <div>
      {/* Conditionally render StockChart if a stock is selected */}
      {ticker && (
        <div className="centered-container">
          <h2 className="centered-heading">{ticker}</h2>
          <StockChart ticker={ticker} />
        </div>
      )}
    </div>
  );
};

export default StockDetailPage;
