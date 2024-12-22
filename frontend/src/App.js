import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import StockPrice from "./StockPrice"; // Your StockPrice component
import Home from "./SimulatorMainPage"; // Your Home component

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/stock-price" element={<StockPrice />} />
            </Routes>
        </Router>
    );
}

export default App;