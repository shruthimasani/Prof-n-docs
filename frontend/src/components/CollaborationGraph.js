import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import './CollaborationGraph.css';

const CollaborationGraph = () => {
  const chartRef = useRef(null);

  useEffect(() => {
    const ctx = chartRef.current.getContext('2d');

    const graphData = {
      labels: ['Alice', 'Bob', 'Charlie', 'David', 'Eva'],
      datasets: [
        {
          label: 'Co-authorship Strength',
          data: [5, 8, 3, 6, 4],
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
        },
      ],
    };

    const config = {
      type: 'bar',
      data: graphData,
      options: {
        responsive: true,
        plugins: {
          tooltip: {
            callbacks: {
              label: function (context) {
                return `Co-authored ${context.parsed.y} papers`;
              },
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Publications',
            },
          },
          x: {
            title: {
              display: true,
              text: 'Co-authors',
            },
          },
        },
      },
    };

    const myChart = new Chart(ctx, config);

    return () => {
      myChart.destroy();
    };
  }, []);

  return (
    <div className="collaboration-graph-container">
      <h2>Collaboration Network</h2>
      <canvas ref={chartRef} width="400" height="250"></canvas>
    </div>
  );
};

export default CollaborationGraph;
