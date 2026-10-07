import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function App() {
  const [data, setData] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:5000/analytics/summary')
      .then(response => setData(response.data))
      .catch(error => console.error("Error fetching data:", error));
  }, []);

  if (!data) return <div style={{ padding: '20px' }}>Loading Dashboard...</div>;

  const chartData = {
    labels: data.categoryWiseRevenue.map(item => item.category),
    datasets: [
      {
        label: 'Revenue (₹)',
        data: data.categoryWiseRevenue.map(item => item.revenue),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
      },
    ],
  };

  return (
    <div style={{ padding: '30px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Analytics Dashboard</h1>
      
      {/* Summary Cards */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
        <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', minWidth: '150px' }}>
          <h3>Total Orders</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{data.summary.totalOrders}</p>
        </div>
        <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', minWidth: '150px' }}>
          <h3>Total Revenue</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>₹{data.summary.totalRevenue}</p>
        </div>
        <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', minWidth: '150px' }}>
          <h3>Delayed Orders</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: 'red' }}>{data.summary.delayedOrders}</p>
        </div>
      </div>

      {/* Chart Section */}
      <div style={{ width: '600px' }}>
        <h2>Category-wise Revenue</h2>
        <Bar data={chartData} />
      </div>
    </div>
  );
}

export default App;