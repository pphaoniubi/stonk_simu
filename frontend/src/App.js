import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import StockPrice from "./StockPrice"; // Your StockPrice component
import SimulatorMainPage from "./SimulatorMainPage"; // Your Home component
import StockDetailPage from "./StockDetailPage";
import AuthPage from "./AuthPage";
import { UserProvider } from "./UserContext";
import Navbar from "./Navbar";

function App() {
    return (
        <UserProvider>
            <Router>
                <MainLayout />
            </Router>
        </UserProvider>
    );
}

function MainLayout() {
    const location = useLocation();
    const hideNavbar = location.pathname === "/";

    return (
        <>
            {!hideNavbar && <Navbar />}
            <Routes>
                <Route path="/" element={<AuthPage />} />
                <Route path="/stock-price" element={<StockPrice />} />
                <Route path="/stock/:ticker" element={<StockDetailPage />} />
                <Route path="/main" element={<SimulatorMainPage />} />
            </Routes>
        </>
    );
}

export default App;
