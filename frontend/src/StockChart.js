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

function StockChart({ ticker, username }) {
    const chartRef = useRef(null);
    const canvasRef = useRef(null);

    useEffect(() => {
        const fetchDataAndRenderChart = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/historical/${ticker}/${username}`);
                const data = response.data;

                if (!Array.isArray(data) || data.length === 0) {
                    console.error("No data available for ticker:", ticker);
                    return;
                }

                const dates = data.map(entry => entry.date);
                const prices = data.map(entry => entry.close);
                
                const ctx = canvasRef.current?.getContext('2d');
                if (!ctx) {
                    console.error("Canvas context is not available");
                    return;
                }

                if (chartRef.current) {
                    chartRef.current.destroy();
                    console.log("destoryed")
                }

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
                                pointRadius: 0,
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
                                type: 'category',
                                title: {
                                    display: true,
                                    text: 'Month',
                                },
                                ticks: {
                                    callback: function (value, index, values) {
                                        const currentDate  = new Date(this.getLabelForValue(value));
                                        const prevDate = index > 0 ? new Date(this.getLabelForValue(values[index - 1].value)) : null;
                                        
                                        if (!prevDate || currentDate.getMonth() !== prevDate.getMonth()) {
                                            return currentDate.toLocaleString("default", { month: "short", year: "numeric" });
                                        }
                                
                                        return '';
                                    },
                                    maxRotation: 0,
                                    autoSkip: true, 
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

        return () => {
            if (chartRef.current) {
                chartRef.current.destroy();
            }
        };
    }, [ticker]);

    return <canvas ref={canvasRef} width="800" height="400"></canvas>;
}

export default StockChart;
