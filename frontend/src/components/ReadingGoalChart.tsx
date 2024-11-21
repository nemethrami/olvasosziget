import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface Props {
  bookNumbers: number[];
}

const ReadingGoalChart: React.FC<Props> = ({ bookNumbers }) => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const handleResize = () => {
    setWindowWidth(window.innerWidth);
  };

  useEffect(() => {
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const data = {
    labels: ['Január', 'Február', 'Március', 'Április', 'Május', 'Június', 'Július', 'Augusztus', 'Szeptember', 'Október', 'November', 'December'],
    datasets: [
      {
        label: 'Olvasott könyvek száma',
        data: bookNumbers,
        backgroundColor: '#858c67',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: windowWidth < 600 ? 'y' : 'x',
    scales: {
      x: {
        beginAtZero: true,
      },
      y: {
        beginAtZero: true,
      },
    },
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

  return (
    <div style={{ width: '80%', height: '400px' }}>
      <Bar data={data} options={options as any} />;
    </div>
  )
};

export default ReadingGoalChart;
