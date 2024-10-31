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
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import ExitToAppOutlinedIcon from '@mui/icons-material/ExitToAppOutlined';
import { useNavigate } from 'react-router-dom';
import { ReactNode } from 'react';
import { getCurrentUserName, handleSignOut } from '../services/FirebaseService';
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
  justifyContent: 'flex-start',
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
  const [currentUserName, setCurrentUserName] = React.useState<string>('');

  React.useEffect(() => {
    const fetchUserName = async () => {
      const userName: string = await getCurrentUserName()
      //const userName: string = await Promise.resolve('test_user_name');
      setCurrentUserName(userName);
    }

    fetchUserName();
  }, []);

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
    navigate(`/profile/${currentUserName}`)
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
        </Toolbar>
      </AppBar>
      <Drawer variant="permanent" open={open}>
      <DrawerHeader sx={{marginBottom:'8px'}}>
          <AvatarComponent sx={{ marginTop:'4px'}}/>
          <Typography sx={{ color: '#895737', marginLeft: '10px', marginTop:'4px' }}>
            @{currentUserName}
          </Typography>
          <IconButton onClick={handleDrawerClose} sx={{ color: '#895737', marginLeft: 'auto' }}>
            {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </DrawerHeader>
        <Divider sx={{ borderWidth: '1px', backgroundColor :'#895737', marginBottom:'8px' }} variant='middle'/>
        <List>
          {['Főoldal', 'Profil', 'Követések', 'Chatszobák', 'Statisztika'].map((text, index) => (
            <ListItem key={text} disablePadding sx={{ display: 'block' }}>
              <ListItemButton
                sx={{
                  minHeight: 48,
                  justifyContent: open ? 'initial' : 'center',
                  px: 2.5,
                }}
                onClick={index % 5 ===0 ? handleHome : index % 5 === 1 ? handleProfil : index % 5 === 2 ? handleFollow : index % 5 === 3 ? handleChat : handleStatistic}
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
                    index % 5 === 0 ? <HomeOutlinedIcon /> : index % 5 === 1 ? <AccountCircleOutlinedIcon /> : index % 5 === 2 ? <PersonAddAltOutlinedIcon /> : index % 5 === 3 ? <MarkUnreadChatAltOutlinedIcon /> : <EqualizerOutlinedIcon />
                  }
                  
                </ListItemIcon>
                <ListItemText primary={text} sx={{ opacity: open ? 1 : 0 }} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Divider sx={{ borderWidth: '1px', backgroundColor :'#895737', marginBottom:'8px' }} variant='middle' />
        <List>
          {['Kijelentkezés'].map((text) => (
            <ListItem key={text} disablePadding sx={{ display: 'block' }}>
              <ListItemButton
                sx={{
                  minHeight: 48,
                  justifyContent: open ? 'initial' : 'center',
                  px: 2.5,
                }}
                onClick={handleLogOut}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 3 : 'auto',
                    justifyContent: 'center',
                    color: '#895737'
                  }}
                >
                  {<ExitToAppOutlinedIcon />}
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