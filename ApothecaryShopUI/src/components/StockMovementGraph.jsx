import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const StockMovementGraph = ({ stockMovements }) => {
  const [chartType, setChartType] = useState('line');

  // Return early if no data
  if (!stockMovements || stockMovements.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center bg-gray-50 rounded-lg p-6 h-64">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-gray-500 font-medium">No stock movement data available to display</p>
      </div>
    );
  }

  // Sort movements by date (ascending)
  const sortedMovements = [...stockMovements].sort(
    (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
  );

  // Prepare data for the chart
  const labels = sortedMovements.map(movement => 
    new Date(movement.createdAt).toLocaleDateString()
  );

  const stockLevels = sortedMovements.map(movement => movement.newStock);
  
  // Prepare data for movement quantity chart (separate incoming and outgoing)
  const incomingData = sortedMovements.map(movement => 
    movement.type === 'in' ? movement.quantity : 0
  );
  
  const outgoingData = sortedMovements.map(movement => 
    movement.type === 'out' ? movement.quantity : 0
  );

  // Chart data configurations
  const chartConfigs = {
    line: {
      data: {
        labels,
        datasets: [
          {
            label: 'Stock Level',
            data: stockLevels,
            borderColor: 'rgb(53, 162, 235)',
            backgroundColor: 'rgba(53, 162, 235, 0.5)',
            tension: 0.2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: 'Stock Level Over Time',
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const index = context.dataIndex;
                const movement = sortedMovements[index];
                const type = movement.type === 'in' ? 'Added' : 'Removed';
                const quantity = movement.quantity;
                return [
                  `Stock Level: ${movement.newStock}`,
                  `${type}: ${quantity} units`,
                  `Reason: ${movement.reason}`
                ];
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Quantity'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Date'
            }
          }
        }
      }
    },
    bar: {
      data: {
        labels,
        datasets: [
          {
            label: 'Stock Level',
            data: stockLevels,
            backgroundColor: 'rgba(53, 162, 235, 0.7)',
            borderColor: 'rgb(53, 162, 235)',
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: 'Stock Level Over Time',
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Stock Quantity'
            }
          },
        }
      }
    },
    movement: {
      data: {
        labels,
        datasets: [
          {
            label: 'Stock In',
            data: incomingData,
            backgroundColor: 'rgba(75, 192, 75, 0.7)',
            borderColor: 'rgb(75, 192, 75)',
            borderWidth: 1,
          },
          {
            label: 'Stock Out',
            data: outgoingData,
            backgroundColor: 'rgba(255, 99, 132, 0.7)',
            borderColor: 'rgb(255, 99, 132)',
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: 'Stock Movement Quantities',
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Quantity Changed'
            }
          },
        }
      }
    }
  };

  const renderChart = () => {
    switch (chartType) {
      case 'bar':
        return <Bar data={chartConfigs.bar.data} options={chartConfigs.bar.options} />;
      case 'movement':
        return <Bar data={chartConfigs.movement.data} options={chartConfigs.movement.options} />;
      case 'line':
      default:
        return <Line data={chartConfigs.line.data} options={chartConfigs.line.options} />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-8">
      <div className="flex items-center justify-end mb-4">
        <span className="mr-3 text-sm font-medium text-gray-700">Chart Type:</span>
        <div className="inline-flex rounded-md shadow-sm">
          <button
            type="button"
            onClick={() => setChartType('line')}
            className={`px-4 py-2 text-sm font-medium rounded-l-md ${
              chartType === 'line' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
            } border border-gray-300`}
          >
            Line
          </button>
          <button
            type="button"
            onClick={() => setChartType('bar')}
            className={`px-4 py-2 text-sm font-medium ${
              chartType === 'bar' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
            } border-t border-b border-gray-300`}
          >
            Bar
          </button>
          <button
            type="button"
            onClick={() => setChartType('movement')}
            className={`px-4 py-2 text-sm font-medium rounded-r-md ${
              chartType === 'movement' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
            } border border-gray-300`}
          >
            In/Out
          </button>
        </div>
      </div>
      <div className="h-80">
        {renderChart()}
      </div>
    </div>
  );
};

export default StockMovementGraph;
