import time
import mysql.connector
from mysql.connector import Error
import yfinance as yf
import pandas as pd
from sqlalchemy import create_engine, Table, MetaData, Column, String, Float, Boolean, Integer, Date, delete


db_password = '12345678pP!'
def fetch_tickers_from_db():
    try:
        conn = mysql.connector.connect(
            host="localhost",
            database="stock_simu_db",
            user="root",
            password=db_password
        )
        if conn.is_connected():
            
            cursor = conn.cursor()
            cursor.execute("SELECT ticker FROM stonks;")
            tickers = cursor.fetchall()

            cursor.close()
            conn.close()
            return tickers

    except Error as e:
        print("Error fetching tickers from database:", e)
        return []
    
def fetch_and_store_data():
    engine = create_engine(f'mysql+pymysql://root:{db_password}@localhost:3306/stock_simu_db', echo=True)
    metadata = MetaData()
    connection = engine.connect()
    transaction = connection.begin()

    try:
        stonk = Table(
                    'historical_prices', metadata,
                    Column('id', Integer, autoincrement=True, primary_key=True),
                    Column('ticker', String(10), nullable=False),
                    Column('date', Date, nullable=False),
                    Column('open', Float),
                    Column('high', Float),
                    Column('low', Float), 
                    Column('close', Float),
                    Column('volume', Integer),
                    Column('updated', Boolean),
                )

        metadata.create_all(engine)

        connection.execute(delete(stonk))
        transaction.commit()

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
            
            for index, row in data.iterrows():
                insert_stmt = stonk.insert().values(
                    ticker=ticker,
                    date=index.date(),
                    open=float(row['Open']),
                    high=float(row['High']),
                    low=float(row['Low']),
                    close=float(row['Close']),
                    volume=int(row['Volume']),
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