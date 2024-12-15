import React, { useEffect, useRef } from 'react';
import {
    Chart as ChartJS,
    LineElement,
    CategoryScale,
    LinearScale,
    PointElement,
    LineController,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

import { Chart } from 'chart.js';
import axios from 'axios';

// Register required components
ChartJS.register(
    LineElement,
    CategoryScale,
    LinearScale,
    PointElement,
    LineController,
    Title,
    Tooltip,
    Legend
);

function StockChart({ ticker }) {
    const chartRef = useRef(null);
    const canvasRef = useRef(null);

    useEffect(() => {
        const fetchDataAndRenderChart = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/historical/${ticker}`);
                const data = response.data;

                if (!Array.isArray(data) || data.length === 0) {
                    console.error("No data available for ticker:", ticker);
                    return;
                }

                // Process data
                const dates = data.map(entry => entry.date);
                const prices = data.map(entry => entry.close);
                
                const ctx = canvasRef.current?.getContext('2d');
                if (!ctx) {
                    console.error("Canvas context is not available");
                    return;
                }

                // Destroy previous chart instance if it exists
                if (chartRef.current) {
                    chartRef.current.destroy();
                    console.log("destoryed")
                }

                // Create a new chart
                chartRef.current = new Chart(ctx, {
                    type: 'line',
                    data: {
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
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: true,
                        plugins: {
                            legend: {
                                display: true,
                                position: 'top',
                            },
                        },
                        scales: {
                            x: {
                                type: 'category', // Explicitly set the x-axis scale
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
                    },
                });
            } catch (error) {
                console.error("Error fetching stock data:", error);
            }
        };

        fetchDataAndRenderChart();

        // Cleanup: Destroy chart on component unmount
        return () => {
            if (chartRef.current) {
                chartRef.current.destroy();
            }
        };
    }, [ticker]);

    return <canvas ref={canvasRef} width="300" height="200"></canvas>;
}

export default StockChart;
