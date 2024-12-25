import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import StockPrice from "./StockPrice"; // Your StockPrice component
import SimulatorMainPage from "./SimulatorMainPage"; // Your Home component
import StockDetailPage from "./StockDetailPage"
import AuthPage from "./AuthPage"
import { UserProvider } from "./UserContext";

function App() {
    return (
        <UserProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<SimulatorMainPage />} />
                    <Route path="/stock-price" element={<StockPrice />} />
                    <Route path="/stock/:ticker" element={<StockDetailPage />} />
                    <Route path="/authenticate" element={<AuthPage />} />
                </Routes>
            </Router>
        </UserProvider>
    );
}

export default App;