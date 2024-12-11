create database stock_simu_db;
 
CREATE TABLE users (
    username VARCHAR(50) PRIMARY KEY,
    balance DECIMAL(10, 2) NOT NULL
);


CREATE TABLE stocks (
    ticker VARCHAR(10) PRIMARY KEY,
    price DECIMAL(10, 2) NOT NULL
);


CREATE TABLE holdings (
    username VARCHAR(50),
    ticker VARCHAR(10),
    quantity INT NOT NULL DEFAULT 0,
    PRIMARY KEY (username, ticker),
    FOREIGN KEY (username) REFERENCES users(username),
    FOREIGN KEY (ticker) REFERENCES stocks(ticker)
);