import React, { useState } from 'react';
import { Avatar, Box, Typography, Paper, Dialog, DialogTitle, DialogActions, Button, Grid, TextField } from '@mui/material';
import FollowComponent from './FollowComponent';

// Dummy data for recommendations
const mockRecommendations = [
  { title: "Book 1", rating: 4, image: "path/to/book1.jpg" },
  { title: "Book 2", rating: 5, image: "path/to/book2.jpg" },
];

const UserProfile: React.FC = () => {
  const [image, setImage] = useState<string | ArrayBuffer | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [targetDate, setTargetDate] = useState('');
  const [bookGoal, setBookGoal] = useState(0);
  const [booksRead, setBooksRead] = useState(0);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files![0];
    setSelectedImage(file);
  };

  const handleSaveImage = () => {
    if (selectedImage) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(selectedImage);
    }
    setDialogOpen(false);
  };

  const handleDialogOpen = () => {
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedImage(null);
  };

  return (
    <Box sx={{ padding: 2, display: 'flex', justifyContent: 'flex-start' }}>
      <Grid container spacing={2}>
        {/* Bal oldali rész: Profil információk és statisztikák */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ padding: 2, backgroundColor: '#f6f5ec', border: 'none', boxShadow: 'none' }}>
            {/* Profilkép */}
            <Typography variant="h6" align="center">Profil</Typography>
            <Avatar 
              src={typeof image === 'string' ? image : undefined} 
              sx={{ width: 80, height: 80, margin: '13px auto', cursor: 'pointer' }} 
              onClick={handleDialogOpen}
            />
            
            {/* Dialog a képfeltöltéshez */}
            <Dialog open={dialogOpen} onClose={handleDialogClose}>
              <DialogTitle>Válassz egy lehetőséget</DialogTitle>
              <DialogActions>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="upload-button"
                  type="file"
                  onChange={handleImageUpload}
                />
                <label htmlFor="upload-button">
                  <Button component="span">Feltöltés</Button>
                </label>
                <Button 
                  onClick={() => { 
                    if (typeof image === 'string') {
                      window.open(image, '_blank');
                    }
                  }}
                  disabled={!image}
                >
                  Nagyobb nézet
                </Button>
                <Button 
                  onClick={handleSaveImage} 
                  disabled={!selectedImage}
                >
                  Mentés
                </Button>
                <Button onClick={handleDialogClose}>Mégse</Button>
              </DialogActions>
            </Dialog>

            {/* Statisztikák */}
            <Box sx={{ marginTop: 2, textAlign: 'center' }}>
              <Typography variant="body1"> <FollowComponent /></Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Jobb oldali rész: Olvasási célok és könyvajánlók */}
        <Grid item xs={12} md={7}>
          {/* Olvasási cél */}
          <Paper sx={{ padding: 2, marginBottom: 2, backgroundColor: '#f6f5ec', border: 'none', boxShadow: 'none' }}>
            <Typography variant="h6">Olvasási cél</Typography>
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
          </Paper>

          {/* Könyvajánlók */}
          <Paper sx={{ padding: 2, backgroundColor: '#f6f5ec', border: 'none', boxShadow: 'none' }}>
            <Typography variant="h6">Könyvajánlók</Typography>
            <Grid container spacing={2}>
              {mockRecommendations.map((rec, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <Paper sx={{ padding: 1, display: 'flex', alignItems: 'center' }}>
                    <img src={rec.image} alt={rec.title} style={{ width: 50, height: 75, marginRight: '8px' }} />
                    <Box>
                      <Typography>{rec.title} - Értékelés: {rec.rating}/5</Typography>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default UserProfile;
