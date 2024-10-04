import React, { useState } from 'react';
import { Box, Grid, Card, CardContent, Typography, Button } from '@mui/material';
import ReadingGoalChart from './ReadingGoalChart';

type StatisticProps = {
  totalBooksRead: number;
  avgRating: number;
  favoriteAuthor: string;
};

const StatisticsPage: React.FC<StatisticProps> = ({ totalBooksRead, avgRating, favoriteAuthor }) => {
  const [selectedStat, setSelectedStat] = useState<string | null>(null);

  const renderContent = () => {
    switch (selectedStat) {
      case 'goal':
        return <ReadingGoalChart />;
      case 'ratings':
        return <p>Itt lesz az olvasott könyvek értékelése</p>;
      case 'authors':
        return <p>Itt lesznek a kedvenc szerzők</p>;
      case 'list':
        return <p>Itt lesz az olvasott könyvek listája</p>;
      default:
        return <p>Kérlek, válassz egy statisztikát a megtekintéshez</p>;
    }
  };

  return (
    <Box sx={{ display: 'flex', padding: '20px' }}>
      <Box sx={{ width: '200px', padding: '20px', backgroundColor: '#f4f4f4' }}>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li style={{ marginBottom: '16px' }}><Button fullWidth variant="contained" onClick={() => setSelectedStat('goal')}>Olvasási cél grafikon</Button></li>
          <li style={{ marginBottom: '16px' }}><Button fullWidth variant="contained" onClick={() => setSelectedStat('ratings')}>Olvasott könyvek értékelése</Button></li>
          <li style={{ marginBottom: '16px' }}><Button fullWidth variant="contained" onClick={() => setSelectedStat('authors')}>Kedvenc szerzők</Button></li>
          <li style={{ marginBottom: '16px' }}><Button fullWidth variant="contained" onClick={() => setSelectedStat('list')}>Olvasott könyvek listája</Button></li>
        </ul>
      </Box>

      <Box sx={{ flex: 1, padding: '20px' }}>
        <Grid container spacing={2}>
          {/* Olvasott könyvek száma */}
          <Grid item xs={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6">Olvasott könyvek száma</Typography>
                <Typography variant="h4">{totalBooksRead}</Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Átlagos értékelés */}
          <Grid item xs={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6">Átlagos értékelés</Typography>
                <Typography variant="h4">{avgRating.toFixed(1)}</Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Legolvasottabb szerző */}
          <Grid item xs={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6">Legolvasottabb szerző</Typography>
                <Typography variant="h4">{favoriteAuthor}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Box sx={{ marginTop: '20px' }}>
          {renderContent()}
        </Box>
      </Box>
    </Box>
  );
};

export default StatisticsPage;
