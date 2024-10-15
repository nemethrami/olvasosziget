import { useState } from 'react';
import { Button, TextField, FormControlLabel, Checkbox, Typography, Box } from '@mui/material';
import { Bar } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Chart.js komponensek regisztrálása
Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const GoalInfo = () => {
  const [targetDate, setTargetDate] = useState<string>('');
  const [bookGoal, setBookGoal] = useState<number>(0);
  const [booksRead, setBooksRead] = useState<number>(0);
  const [showOnProfile, setShowOnProfile] = useState<boolean>(false);

  // Előrehaladás kiszámítása
  const progress = bookGoal > 0 ? Math.min((booksRead / bookGoal) * 100, 100) : 0;

  // Grafikon adatai
  const chartData = {
    labels: ['Olvasási cél'],
    datasets: [
      { label: 'Elolvasott könyvek', data: [booksRead], backgroundColor: 'rgba(75, 192, 192, 0.6)' },
      { label: 'Még hátralévő könyvek', data: [Math.max(bookGoal - booksRead, 0)], backgroundColor: 'rgba(255, 99, 132, 0.6)' },
    ],
  };

  // Grafikon opciók
  const readingGoalChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Olvasási cél előrehaladása',
      },
    },
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', minHeight: '100vh', mt: '-50px' }}>
      <Box sx={{ width: '80%', maxWidth: '600px', backgroundColor: '#f6f5ec', padding: 4, borderRadius: 2, position: 'absolute',}}>
        <TextField
          label="Cél dátuma"
          type="date"
          value={targetDate}
          onChange={(e) => setTargetDate(e.target.value)}
          fullWidth
          sx={{ marginBottom: '10px' }}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="Könyvek száma"
          type="number"
          value={bookGoal}
          onChange={(e) => setBookGoal(Number(e.target.value))}
          fullWidth
          sx={{ marginBottom: '10px' }}
        />
        <TextField
          label="Elolvasott könyvek"
          type="number"
          value={booksRead}
          onChange={(e) => setBooksRead(Number(e.target.value))}
          fullWidth
          sx={{ marginBottom: '10px' }}
        />
        <FormControlLabel
          control={<Checkbox checked={showOnProfile} onChange={(e) => setShowOnProfile(e.target.checked)} />}
          label="Megjelenítés a profilban"
          sx={{color: '#794f29'}}
        />
        <Button variant="contained" fullWidth
          sx={{ 
            backgroundColor: '#eae2ca', 
            color: '#895737',
            fontWeight: '600',
            fontFamily: 'Times New Roman', 
            borderRadius: '8px',
            margin: '16px',
            cursor: 'pointer',
            border: 'none',
            padding: '10px 20px',
            transition: 'background-color 0.8s ease', // Animáció a háttérszín változásához
            '&:hover': {
              backgroundColor: '#90784f', // Change background color on hover
              color: '#f3e9dc',
            }
          }}
          >
          Cél mentése
        </Button>

        <Typography variant="h6" align="center" sx={{ marginBottom: '16px', color:'#895737' }}>Előrehaladás: {progress.toFixed(2)}%</Typography>
        <Bar data={chartData} options={readingGoalChartOptions} />
      </Box>
    </Box>
  );
};

export default GoalInfo;
