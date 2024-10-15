import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Register the necessary chart.js components
Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ReadingGoalChart: React.FC = () => {
  // Dummy data for the chart
  const data = {
    labels: ['Január', 'Február', 'Március', 'Április', 'Május'],
    datasets: [
      {
        label: 'Olvasott könyvek száma',
        data: [5, 10, 8, 7, 12], // Ezek a könyvek számai hónapokra lebontva
        backgroundColor: '#858c67',
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Olvasási Cél Előrehaladása',
      },
    },
  };

  return <Bar data={data} options={options} />;
};

export default ReadingGoalChart;
