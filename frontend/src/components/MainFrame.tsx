import { styled } from '@mui/material/styles';
import React, { useEffect } from 'react';
import Box from '@mui/material/Box';
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import CssBaseline from '@mui/material/CssBaseline';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { useNavigate } from 'react-router-dom';
import LoginOutlinedIcon from '@mui/icons-material/LoginOutlined';
import HowToRegOutlinedIcon from '@mui/icons-material/HowToRegOutlined';
import 'index.css';

const drawerWidth = 240;

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}));

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  backgroundColor: '#82855a',
  color: '#f3e9dc',
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

type Props = {
  children: React.ReactNode;
}

export default function MainHome({ children }: Props) {
  const navigate = useNavigate();

  const handleMainHome = () => {
    navigate('/mainhome');
  };

  const handleLogIn = () => {
    navigate('/login');
  };

  const handleRegistration = () => {
    navigate('/registration');
  };

  useEffect(() => {
    const img = document.querySelector('.image-container img');
    if (img) img.classList.add('active');
  }, []);

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '20px' }}>
      <CssBaseline />
      <AppBar position="fixed" open={false}>
        <Toolbar
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          {/* App Title */}
          <Typography
            variant="h5"
            noWrap
            component="div"
            onClick={handleMainHome}
            sx={{
              fontFamily: 'monospace',
              color: '#f5e6d3',
              cursor: 'pointer',
              fontSize: { xs: '1rem', sm: '1.5rem' },
            }}
          >
            Olvasó Sziget
          </Typography>

          {/* Buttons */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: { xs: '10px', sm: '20px' },
              flexWrap: 'wrap',
            }}
          >
            <IconButton
              onClick={handleLogIn}
              sx={{
                color: '#f5e6d3',
                fontSize: { xs: '0.8rem', sm: '1em' },
              }}
            >
              <LoginOutlinedIcon />
              <Typography variant="body2" sx={{ ml: 1, display: { xs: 'none', sm: 'inline' }, fontSize: '1em' }}>
                Bejelentkezés
              </Typography>
            </IconButton>
            <IconButton
              onClick={handleRegistration}
              sx={{
                color: '#f5e6d3',
                fontSize: { xs: '0.8rem', sm: '1em' },
              }}
            >
              <HowToRegOutlinedIcon />
              <Typography variant="body2" sx={{ ml: 1, display: { xs: 'none', sm: 'inline' }, fontSize: '1em' }}>
                Regisztráció
              </Typography>
            </IconButton>
          </Box>
        </Toolbar>

      </AppBar>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <DrawerHeader />
        {children}
      </Box>
    </Box>
  );
}