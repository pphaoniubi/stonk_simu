drop database stock_simu_db;

create database stock_simu_db;

use stock_simu_db;

CREATE TABLE users (
    username VARCHAR(50) PRIMARY KEY,
    balance DECIMAL(10, 2) NOT NULL
);


CREATE TABLE stonks (
    ticker VARCHAR(10) PRIMARY KEY,
    price DECIMAL(10, 2)
);


CREATE TABLE holdings (
    username VARCHAR(50),
    ticker VARCHAR(10),
    quantity INT NOT NULL DEFAULT 0,
    PRIMARY KEY (username, ticker),
    FOREIGN KEY (username) REFERENCES users(username),
    FOREIGN KEY (ticker) REFERENCES stonks(ticker)
);

CREATE TABLE historical_prices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ticker VARCHAR(10) NOT NULL,
    date DATE NOT NULL,
    open DOUBLE,
    high DOUBLE,
    low DOUBLE,
    close DOUBLE,
    volume BIGINT,
    updated BOOL,
    UNIQUE (ticker, date)
);


INSERT INTO users (username, balance)
VALUES ('test_user', 1000000.00);

INSERT INTO stonks (ticker, price) VALUES 
('AAPL', NULL),
('GOOGL', NULL),
('AMZN', NULL),
('MSFT', NULL),
('TSLA', NULL),
('NFLX', NULL),	
('META', NULL),
('NVDA', NULL);

select * from historical_prices;