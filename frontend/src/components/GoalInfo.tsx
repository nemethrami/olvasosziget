import React, { useState } from 'react';
import { Box, Button, TextField, Checkbox, FormControlLabel, Typography } from '@mui/material';
import { Bar } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Chart.js komponensek regisztrálása
Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ReadingGoal: React.FC = () => {
    const [targetDate, setTargetDate] = useState<string>('');
    const [bookGoal, setBookGoal] = useState<number>(0);
    const [booksRead, setBooksRead] = useState<number>(0);  // Eddig olvasott könyvek száma
    const [showOnProfile, setShowOnProfile] = useState<boolean>(false);
  
    // Előrehaladási százalék kiszámítása
    const progress = bookGoal > 0 ? Math.min((booksRead / bookGoal) * 100, 100) : 0;

  const handleGoalSubmit = () => {
    // Itt kezelheted a cél elmentését
    console.log(`Cél időpont: ${targetDate}, Könyv cél: ${bookGoal}, Profilban megjelenik: ${showOnProfile}`);
  };

  // Dummy data a grafikonhoz
  const data = {
    labels: ['Olvasási cél'],
    datasets: [
      {
        label: 'Elolvasott könyvek',
        data: [booksRead],
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
      {
        label: 'Még hátralévő könyvek',
        data: [Math.max(bookGoal - booksRead, 0)],
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: true, text: 'Olvasási cél előrehaladása' },
    },
  };

  return (
    <Box sx={{ maxWidth: '500px', margin: '0 auto', padding: '20px' }}>

      <TextField
        label="Cél dátuma"
        type="date"
        value={targetDate}
        onChange={(e) => setTargetDate(e.target.value)}
        sx={{ marginBottom: '16px', width: '100%' }}
        InputLabelProps={{ shrink: true }}
      />

      <TextField
        label="Könyvek száma"
        type="number"
        value={bookGoal}
        onChange={(e) => setBookGoal(Number(e.target.value))}
        sx={{ marginBottom: '16px', width: '100%' }}
      />

      <TextField
        label="Elolvasott könyvek"
        type="number"
        value={booksRead}
        onChange={(e) => setBooksRead(Number(e.target.value))}
        sx={{ marginBottom: '16px', width: '100%' }}
      />

      <FormControlLabel
        control={
          <Checkbox
            checked={showOnProfile}
            onChange={(e) => setShowOnProfile(e.target.checked)}
          />
        }
        label="Cél megjelenítése a profilban"
      />

      <Button
        variant="contained"
        color="primary"
        fullWidth
        sx={{ marginBottom: '16px' }}
        onClick={handleGoalSubmit}
      >
        Mentés
      </Button>

      <Typography variant="h6" gutterBottom>Előrehaladás: {progress.toFixed(2)}%</Typography>

      <Bar data={data} options={options} />
    </Box>
  );
};

export default ReadingGoal;
