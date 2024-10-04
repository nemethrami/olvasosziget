import { Box, Avatar, Typography, Grid } from '@mui/material';

const Profile = () => {
  return (
    <Box sx={{ width: '100%', padding: 2 }}>
      <Grid container alignItems="center">
        {/* Profil (balra igazítva) */}
        <Grid item xs={3}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar alt="Profile Picture" src="/path-to-profile-pic.jpg" />
            <Typography variant="body1" sx={{ marginLeft: 1 }}>
              Felhasználónév
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Profile;