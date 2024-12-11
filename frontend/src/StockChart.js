import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import axios from 'axios';

function StockChart({ ticker }) {
    const [chartData, setChartData] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            const response = await axios.get(`http://localhost:5000/historical/${ticker}`);
            const data = response.data;

            // Process data for Chart.js
            const dates = data.map(entry => entry.date);
            const prices = data.map(entry => entry.close);

            setChartData({
                labels: dates,
                datasets: [
                    {
                        label: `${ticker} Stock Price`,
                        data: prices,
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 2,
                        fill: false,
                    },
                ],
            });
        };

        fetchData();
    }, [ticker]);

    return (
        <div>
            {chartData ? (
                <Line
                    data={chartData}
                    options={{
                        responsive: true,
                        plugins: {
                            legend: {
                                display: true,
                                position: 'top',
                            },
                        },
                        scales: {
                            x: {
                                title: {
                                    display: true,
                                    text: 'Date',
                                },
                            },
                            y: {
                                title: {
                                    display: true,
                                    text: 'Price ($)',
                                },
                            },
                        },
                    }}
                />
            ) : (
                <p>Loading chart...</p>
            )}
        </div>
    );
}

export default StockChart;
