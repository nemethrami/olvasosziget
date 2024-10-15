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
      <Box sx={{ width: '200px', padding: '20px', backgroundColor: '#f6f5ec' }}>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li style={{ marginBottom: '16px' }}>
            <Button fullWidth variant="contained" onClick={() => setSelectedStat('goal')}
              sx={{ 
                backgroundColor: '#eae2ca', 
                color: '#895737',
                fontWeight: '600',
                fontFamily: 'Times New Roman', 
                borderRadius: '8px',
                margin: '8px',
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
                Olvasási cél grafikon
            </Button>
          </li>
          <li style={{ marginBottom: '16px' }}>
            <Button fullWidth variant="contained" onClick={() => setSelectedStat('ratings')}
              sx={{ 
                backgroundColor: '#eae2ca', 
                color: '#895737',
                fontWeight: '600',
                fontFamily: 'Times New Roman', 
                borderRadius: '8px',
                margin: '8px',
                cursor: 'pointer',
                border: 'none',
                padding: '10px 20px',
                transition: 'background-color 0.8s ease', // Animáció a háttérszín változásához
                '&:hover': {
                  backgroundColor: '#90784f', // Change background color on hover
                  color: '#f3e9dc',
                }
              }}>
                Olvasott könyvek értékelése
              </Button>
          </li>
          <li style={{ marginBottom: '16px' }}>
            <Button fullWidth variant="contained" onClick={() => setSelectedStat('authors')}
              sx={{ 
                backgroundColor: '#eae2ca', 
                color: '#895737',
                fontWeight: '600',
                fontFamily: 'Times New Roman', 
                borderRadius: '8px',
                margin: '8px',
                cursor: 'pointer',
                border: 'none',
                padding: '10px 20px',
                transition: 'background-color 0.8s ease', // Animáció a háttérszín változásához
                '&:hover': {
                  backgroundColor: '#90784f', // Change background color on hover
                  color: '#f3e9dc',
                }
              }}>
              Kedvenc szerzők
              </Button>
          </li>
          <li style={{ marginBottom: '16px' }}>
            <Button fullWidth variant="contained" onClick={() => setSelectedStat('list')}
              sx={{ 
                backgroundColor: '#eae2ca', 
                color: '#895737',
                fontWeight: '600',
                fontFamily: 'Times New Roman', 
                borderRadius: '8px',
                margin: '8px',
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
                Olvasott könyvek listája
            </Button>
          </li>
        </ul>
      </Box>

      <Box sx={{ flex: 1, padding: '20px'}}>
        <Grid container spacing={2}>
          {/* Olvasott könyvek száma */}
          <Grid item xs={4}>
            <Card sx={{ height: '100%', backgroundColor:'#d8daaf'}}>
              <CardContent>
                <Typography variant="h6" sx={{color:'#895737', fontWeight: '600', fontFamily: 'Times New Roman'}}>Olvasott könyvek száma: {totalBooksRead}</Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Átlagos értékelés */}
          <Grid item xs={4}>
            <Card sx={{ height: '100%', backgroundColor:'#d8daaf' }}>
              <CardContent>
                <Typography variant="h6" sx={{color:'#895737', fontWeight: '600', fontFamily: 'Times New Roman'}}>Átlagos értékelés: {avgRating.toFixed(1)}</Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Legolvasottabb szerző */}
          <Grid item xs={4}>
            <Card sx={{ height: '100%', backgroundColor:'#d8daaf' }}>
              <CardContent>
                <Typography variant="h6" sx={{color:'#895737', fontWeight: '600', fontFamily: 'Times New Roman'}}>Legolvasottabb szerző: {favoriteAuthor}</Typography>
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
