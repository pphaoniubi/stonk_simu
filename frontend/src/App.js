import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import StockPrice from "./StockPrice";
import SimulatorMainPage from "./SimulatorMainPage";
import StockDetailPage from "./StockDetailPage";
import AuthPage from "./AuthPage";
import { UserProvider } from "./UserContext";
import Navbar from "./Navbar";
import LoginNavbar from "./LoginNavBar";

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
    const isLoginPage = location.pathname === "/";

    return (
        <>
            {isLoginPage ? <LoginNavbar /> : <Navbar />}
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
