import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Dialog, DialogTitle, DialogActions, Button, Grid, TextField } from '@mui/material';
import FollowComponent from './FollowComponent';
import { getCurrentUserName, getStorageRef, getDocRef } from '../services/FirebaseService';
import { getDownloadURL, uploadBytes } from 'firebase/storage';
import { updateDoc } from 'firebase/firestore';
import AvatarComponent from './AvatarComponent';

// Dummy data for recommendations
const mockRecommendations = [
  { title: "Book 1", rating: 4, image: "path/to/book1.jpg" },
  { title: "Book 2", rating: 5, image: "path/to/book2.jpg" },
];

const UserProfile: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [targetDate, setTargetDate] = useState('');
  const [bookGoal, setBookGoal] = useState(0);
  const [booksRead, setBooksRead] = useState(0);
  const [username, setUserName] = useState('username');

  useEffect(() => {
    const fetchUserName = async () => {
      const userName: string = await getCurrentUserName();
      setUserName(userName);
    }

    fetchUserName();
  }, []);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedImage(event.target.files[0]);
    }
  };

  const handleSaveImage = async () => {
    if (!selectedImage) {
      setDialogOpen(false);
      setSelectedImage(null);
      return;
    }
    
    const userId = localStorage.getItem('uid');
    if (!userId) {
      setDialogOpen(false);
      setSelectedImage(null);
      return;
    }

    const storageRef = getStorageRef(`profilePictures/${userId}.jpg`);

    try {
        // Upload file to Firebase Storage
        await uploadBytes(storageRef, selectedImage);
        // Get the download URL
        const downloadURL = await getDownloadURL(storageRef);
    
        // Save the URL to Firestore
        await updateDoc(getDocRef('users', userId), {
            avatar_url: downloadURL,
        });

        alert('Profile picture uploaded successfully!');
    } catch (error) {
        console.error('Error uploading profile picture:', error);
    } finally {
        setSelectedImage(null);
        setDialogOpen(false);
    }
  }

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
            <Typography variant="h6" align="center">@{username}</Typography>
            <AvatarComponent
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
