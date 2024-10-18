import * as React from 'react';
import { styled, useTheme, Theme, CSSObject } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import CssBaseline from '@mui/material/CssBaseline';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined';
import MarkUnreadChatAltOutlinedIcon from '@mui/icons-material/MarkUnreadChatAltOutlined';
import EqualizerOutlinedIcon from '@mui/icons-material/EqualizerOutlined';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import Stack from '@mui/material/Stack';
import ExitToAppOutlinedIcon from '@mui/icons-material/ExitToAppOutlined';
import { useNavigate, Link } from 'react-router-dom';
import { ReactNode } from 'react';
import { handleSignOut } from '../services/FirebaseService';
import AvatarComponent from './AvatarComponent';

const drawerWidth = 240;

const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  backgroundColor: '#eae2ca',
  color: '#895737',
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  backgroundColor: '#eae2ca',
  color: '#895737',
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
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

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    variants: [
      {
        props: ({ open }) => open,
        style: {
          ...openedMixin(theme),
          '& .MuiDrawer-paper': openedMixin(theme),
        },
      },
      {
        props: ({ open }) => !open,
        style: {
          ...closedMixin(theme),
          '& .MuiDrawer-paper': closedMixin(theme),
        },
      },
    ],
  }),
);

type Props = {
    children?: ReactNode
};

export default function AppFrame({children}: Props) {
  const navigate = useNavigate();
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const handleLogOut = () => {
    handleSignOut();
    navigate('/mainhome')
  };

  const handleHome = () => {
    navigate('/home')
  };

  const handleProfil = () => {
    navigate('/profile')
  };

  const handleFollow = () => {
    navigate('/follow')
  };

  const handleChat = () => {
    navigate('/chatrooms')
  };

  const handleStatistic = () => {
    navigate('/statistics')
  };

  const handleGoal = () => {
    navigate('/goal')
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" open={open}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{
              marginRight: 5,
              ...(open && { display: 'none' }),
            }}
          >
            <MenuIcon sx={{ color: '#f5e6d3' }}/>
          </IconButton>
          <Typography variant="h5" noWrap component="div" onClick={handleHome} sx={{fontFamily: 'monospace', cursor: 'pointer'}}>
            Olvasó Sziget
          </Typography>
          <Stack position={'fixed'} right='30px' direction="row" spacing={1}>
            <AvatarComponent />
            <IconButton LinkComponent={Link}  onClick={handleLogOut} sx={{color: '#f5e6d3', fontSize:'1em'}}>
              <ExitToAppOutlinedIcon> </ExitToAppOutlinedIcon>
              Kilépés
            </IconButton>
          </Stack>
        </Toolbar>
      </AppBar>
      <Drawer variant="permanent" open={open}>
        <DrawerHeader>
          <IconButton onClick={handleDrawerClose} sx={{ color: '#895737' }}>
            {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List>
          {['Főoldal', 'Profil', 'Követések', 'Chatszobák', 'Statisztika', 'Célkitűzés'].map((text, index) => (
            <ListItem key={text} disablePadding sx={{ display: 'block' }}>
              <ListItemButton
                sx={{
                  minHeight: 48,
                  justifyContent: open ? 'initial' : 'center',
                  px: 2.5,
                }}
                onClick={index % 6 ===0 ? handleHome : index % 6 === 1 ? handleProfil : index % 6 === 2 ? handleFollow : index % 6 === 3 ? handleChat : index % 6 === 4 ? handleStatistic : handleGoal}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 3 : 'auto',
                    justifyContent: 'center',
                    color: '#895737'
                  }}
                >
                  {
                    index % 6 === 0 ? <HomeOutlinedIcon /> : index % 6 === 1 ? <AccountCircleOutlinedIcon /> : index % 6 === 2 ? <PersonAddAltOutlinedIcon /> : index % 6 === 3 ? <MarkUnreadChatAltOutlinedIcon /> : index % 6 === 4 ? <EqualizerOutlinedIcon /> : <EventAvailableOutlinedIcon />
                  }
                  
                </ListItemIcon>
                <ListItemText primary={text} sx={{ opacity: open ? 1 : 0 }} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <DrawerHeader />
        {children}
      </Box>
    </Box>
  );
}