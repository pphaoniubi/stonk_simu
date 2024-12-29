import React from "react";


const LoginNavbar = () => {
    return (
        <nav style={{ padding: "10px", backgroundColor: "#f2f2f2", color: "black", borderBottom: "2px solid #ccc", paddingBottom: "10px" }}>
            <div style={{ display: "flex", alignItems: "center" }}>
            <img 
                src="/logo.png" 
                alt="Stock Simu Logo" 
                style={{ height: "40px", marginRight: "10px" }} 
            />
            <p style={{ margin: 0, fontSize: "20px", fontWeight: "bold" }}>Stock Simu</p>
            </div>        
        </nav>
    );
};

export default LoginNavbar;
