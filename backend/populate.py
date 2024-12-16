import time
import mysql.connector
from mysql.connector import Error
import yfinance as yf
import pandas as pd
from sqlalchemy import create_engine, Table, MetaData, Column, String, Float, Boolean, Integer, Date, delete


db_password = '123456'
def fetch_tickers_from_db():
    try:
        # Connect to your MySQL database
        conn = mysql.connector.connect(
            host="localhost",
            database="stock_simu_db",
            user="root",
            password=db_password
        )
        if conn.is_connected():
            cursor = conn.cursor()

            # Execute SQL query to retrieve all tickers
            cursor.execute("SELECT ticker FROM stonks;")
            
            # Fetch all ticker symbols
            tickers = cursor.fetchall()

            # Close cursor and connection
            cursor.close()
            conn.close()
            return tickers

    except Error as e:
        print("Error fetching tickers from database:", e)
        return []
    
def fetch_and_store_data():
    # Connection and engine setup
    engine = create_engine(f'mysql+pymysql://root:{db_password}@localhost:3306/stock_simu_db', echo=True)
    metadata = MetaData()
    connection = engine.connect()
    transaction = connection.begin()

    try:
        stonk = Table(
                    'historical_prices', metadata,
                    Column('id', Integer, autoincrement=True, primary_key=True),  # Auto-increment primary key
                    Column('ticker', String(10), nullable=False),                # Stock ticker
                    Column('date', Date, nullable=False),                        # Date of the record
                    Column('open', Float),                                       # Opening price
                    Column('high', Float),                                       # Highest price
                    Column('low', Float),                                        # Lowest price
                    Column('close', Float),                                      # Closing price
                    Column('volume', Integer),                                   # Trade volume
                    Column('updated', Boolean),                                  # Updated flag
                )

        metadata.create_all(engine)

        connection.execute(delete(stonk))
        transaction.commit()  # Commit the deletion before starting inserts

        transaction = connection.begin()
        tickers = fetch_tickers_from_db()

        for ticker, in tickers:
            stock = yf.Ticker(ticker)
            data = stock.history(period="5y", interval="1d")
            data = data.dropna()
            print(data)
            if data.empty:
                print(f"No data returned for {ticker}")
                continue
            
            # Prepare and execute insert statements for each day's data
            for index, row in data.iterrows():
                insert_stmt = stonk.insert().values(
                    ticker=ticker,
                    date=index.date(),
                    open=float(row['Open']),
                    high=float(row['High']),
                    low=float(row['Low']),
                    close=float(row['Close']),
                    volume=int(row['Volume']),  # Ensure type consistency
                    updated=False
                )
                connection.execute(insert_stmt)
            time.sleep(0.3)
        transaction.commit()
    except Exception as e:
        transaction.rollback()
        print(f"Error updating data: {e}")
    finally:
        connection.close()


if __name__ == "__main__":
    fetch_and_store_data()