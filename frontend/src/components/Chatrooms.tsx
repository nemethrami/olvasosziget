import React, { useEffect, useState } from 'react';
import { 
  Tabs, 
  Tab, 
  IconButton, 
  Box,
  Paper, 
  Typography, 
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  FormControl,
  FormLabel,
  FormControlLabel,
  Radio,
  RadioGroup,
  MenuItem,
  Menu,
  useTheme,
  useMediaQuery
} from '@mui/material';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { getCurrentUserName, deleteDocDataByID, addDataToCollection, getCollectionByID, isUserAdmin } from '@services/FirebaseService';
import { onSnapshot, DocumentData, CollectionReference, Query, query, where, QuerySnapshot, getDocs, Timestamp } from 'firebase/firestore';
import FilterListOutlinedIcon from '@mui/icons-material/FilterListOutlined';

const filterOptions = [
  { value: 'datecsokk', label: 'Dátum szerint legfrissebb' },
  { value: 'datenov', label: 'Dátum szerint legrégebbi' },
  { value: 'ABCcsok', label: 'ABC sorrend szerint csökkenő' },
  { value: 'ABCnov', label: 'ABC sorrend szerint növekvő' },
];

type Props = {
  setRoomName: (p: string) => void;
  setRoomData: (p: DocumentData) => void;
  toggleSidebar?: () => void;
}

const ChatRooms = ({setRoomName, setRoomData, toggleSidebar}: Props) => {
  const [currentUserName, setCurrentUserName] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [openPwDialog, setOpenPwDialog] = useState<boolean>(false);
  const [newRoomName, setNewRoomName] = useState<string>('');
  const [isPrivate, setIsPrivate] = useState<boolean>(false);
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [allRooms, setAllRooms] = useState([]); 
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [anchorEl, setAnchorEl] = useState(null);
  const [privatePwError, setPrivatePwError] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    const fetchIsAdmin = async () => {
      const admin: boolean = await isUserAdmin();
      setIsAdmin(admin);
    }

    fetchIsAdmin();
  }, []);

  useEffect(() => {
    const sortedList = [...allRooms];

    if (selectedFilter === 'datecsokk') {
      sortedList.sort((a: DocumentData, b: DocumentData) => {return b.created_at.toMillis() - a.created_at.toMillis()});
    } else {
      if (selectedFilter === 'datenov') {
        sortedList.sort((a: DocumentData, b: DocumentData) => {return a.created_at.toMillis() - b.created_at.toMillis()});
      } else {
        if (selectedFilter === 'ABCcsok') {
          sortedList.sort((a: DocumentData, b: DocumentData) => {return b.name.localeCompare(a.name)});
        } else {
          sortedList.sort((a: DocumentData, b: DocumentData) => {return a.name.localeCompare(b.name)});
        }
      }
    }

    setAllRooms(sortedList);
  }, [selectedFilter]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const username: string = await getCurrentUserName();
        setCurrentUserName(username);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
  
    fetchUserData();
  
    const chatroomsRef = getCollectionByID('chatrooms');
    const unsubscribe = onSnapshot(chatroomsRef, (querySnapshot) => {
      const rooms: DocumentData[] = querySnapshot.docs.map((doc) => ({
        id: doc.id, 
        ...doc.data(),
      }));
  
      const validRooms = rooms.filter((room) => 
        room.name && room.creator && room.created_at && typeof room.is_private === 'boolean'
      );

      setAllRooms(validRooms);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching data:', error);
      setLoading(false);
    });
  
    return () => unsubscribe();
  }, []);
  
  if (loading) {
    return <p>Loading...</p>;
  }

  const handleFilterChange = (option: string) => {
    setSelectedFilter(option);
    setAnchorEl(null);
  };

  const handleFilterMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const handleLogInChatRoom = (room: DocumentData) => {
    setSelectedRoomId(room.id);
    setRoomData(room);
    if (toggleSidebar) {
      toggleSidebar();
    }

    if (room.is_private) {
      setOpenPwDialog(true);
    } else {
      setRoomName(room.name);
    }
  };

  const handleAddRoom = async (event: React.SyntheticEvent) => {
    event.preventDefault();

    if (isPrivate && password.length < 4) {
      setPrivatePwError(true);
      return;
    }

    const newRoom: DocumentData = {
      name: newRoomName,
      creator: currentUserName!,
      created_at: Timestamp.now(),
      is_private: isPrivate,
      password: password,
      id: newRoomName,
    };

    await addDataToCollection('chatrooms', newRoom.id, newRoom);
    handleCloseDialog();
    setNewRoomName('');
    setIsPrivate(false);
    setPassword('');
  };

  const handleDeleteChatRoom = async (event: React.SyntheticEvent, room: DocumentData) => {
    event.preventDefault();
    const messageRef: CollectionReference<DocumentData, DocumentData> = getCollectionByID('messages');
    const q: Query<DocumentData, DocumentData> = query(messageRef, where('room_id', '==', room.id));

    const querySnapshot: QuerySnapshot<DocumentData, DocumentData> = await getDocs(q);
    const deletePromises = querySnapshot.docs.map(async (doc) => {
      await deleteDocDataByID('messages', doc.id);
    });

    await Promise.all(deletePromises);
    await deleteDocDataByID("chatrooms", room.id);
  };

  const handleOpenDialog = (event: React.SyntheticEvent) => {
    event.preventDefault();
    setOpenDialog(true);
    setPrivatePwError(false);
  };

  const handleCloseDialog = (event?: React.SyntheticEvent) => {
    if (event) {
      event.preventDefault();
    }
    setOpenDialog(false);
    setNewRoomName(''); 
    setIsPrivate(false);
    setPassword('');
  };  

  const handleLogInPrivateChatroom = () => {
    const currentRoom = allRooms.filter(room => room.is_private).find(room => room.id === selectedRoomId);
    if (currentRoom && password === currentRoom.password) {
      setRoomName(currentRoom.name);
      setOpenPwDialog(false);
      setError('');
    } else {
      setError('A jelszó nem megfelelő!');
    }
    setPassword('');
  };

  const handleClosePwDialog = (event: React.SyntheticEvent) => {
    event.preventDefault();
    setOpenPwDialog(false);
    setPassword('');
    setError('');
  };

  const handlePrivatePwChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.target.value;

    // Csak számok engedése
    if (/^\d*$/.test(input) && input.length <= 4) {
      setPassword(input);
    }
  };

  const renderTable = (roomList: DocumentData[]) => (
  <Box
    sx={{
      padding: 2,
      borderRadius: '8px',
      height: '100%',
    }}
  >
    {roomList.map((room) => (
      <Paper
        key={room.id}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 1,
          marginBottom: 1,
          borderRadius: 3,
          backgroundColor: '#eae2ca',
          color: '#895737',
          '&:hover': {
            backgroundColor: '#f0f0f0',
            cursor: 'pointer'
          },
        }}
      >
        <Box sx={{display: 'flex', flexDirection: 'column', width: '100%'}} onClick={() => handleLogInChatRoom(room)}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
            {room.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {room.is_private ? 'Privát szoba' : 'Nyilvános szoba'}
          </Typography>
        </Box>
        <Box>
          {(currentUserName === room.creator || isAdmin) && (
            <IconButton size="small" onClick={(e) => handleDeleteChatRoom(e, room)}>
              <DeleteForeverIcon color="error" />
            </IconButton>
          )}
        </Box>
      </Paper>
    ))}
  </Box>
  );

  return (
    <>
      <Box sx={{ 
        display: 'flex', 
        width: '100%',
        maxWidth: 300,
        minHeight: '85vh',
        boxShadow: 3,
        borderRadius: '8px',
        padding: 1,
        flexDirection: 'column',
        position: 'relative',
        backgroundColor: '#fefffe'
      }}>
        {/* Bal oldali sáv tab navigációval */}
        {/* Tab navigáció */}
        <Tabs 
          orientation={isSmallScreen ? 'vertical' : 'horizontal'}
          value={selectedTab} 
          onChange={handleTabChange} 
          centered 
          sx={{
            '& .MuiTabs-indicator': {
              backgroundColor: '#794f29', 
            }
          }}
        >
          <Tab label="Nyilvános"
            sx={{
              color:'#794f29', 
              '&.Mui-selected': {
                color: '#794f29',
              },
              '&.MuiButtonBase-root': {
                padding: 0
              }
            }}
          />
          <Tab label="Privát" 
            sx={{
              color:'#794f29', 
              '&.Mui-selected': {
                color: '#794f29',
              },
              '&.MuiButtonBase-root': {
                padding: 0
              }
            }}
          />
        </Tabs>
        {/* Szűrő ikon */}
        <IconButton onClick={handleFilterMenuOpen}>
          <FilterListOutlinedIcon />
        </IconButton>

        {/* Szűrő menü */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          {filterOptions.map((option) => (
            <MenuItem key={option.value} onClick={() => handleFilterChange(option.value)}>
              {option.label}
            </MenuItem>
          ))}
        </Menu>

        {/* Görgethető tartalom */}
        <Box sx={{ flexGrow: 1, overflowY: 'auto', maxHeight: 'calc(85vh - 100px)' }}>
          {selectedTab === 0 && (
            <Box>
              {renderTable(allRooms.filter(room => !room.is_private))} {/* Nyilvános szobák */}
            </Box>
          )}
          {selectedTab === 1 && (
            <Box>
              {renderTable(allRooms.filter(room => room.is_private))} {/* Privát szobák */}
            </Box>
          )}
        </Box>

        {/* Új szoba gomb */}
        <Button
          sx={{
            minWidth:'0px',
            backgroundColor: '#eae2ca', 
            color: '#895737',
            borderRadius: '50%', 
            width: '40px', 
            height: '40px', 
            boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.15)', 
            border: '2px solid #794f29',
            padding: 0,
            fontSize: '24px',
            fontWeight: 'bold',
            transition: 'background-color 0.3s ease',
            '&:hover': {
              transform: 'scale(1.1)',
              backgroundColor: '#90784f',
              color: '#f3e9dc',
            },
          }}
          onClick={handleOpenDialog}
        >
          +
        </Button>
      </Box>

      {/* Jelszó dialog a privát szobákhoz */}
      <Dialog open={openPwDialog} onClose={handleClosePwDialog }>
        <DialogTitle>Belépés a privát szobába</DialogTitle>
        <DialogContent>
          <TextField
            label="Belépési kód"
            type="password"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            inputProps={{ maxLength: 4, pattern: '\\d*' }} // Csak 4 számjegy fogadása
            helperText="4 számjegyű kód szükséges"
            sx={{ marginTop: 2 }}
          />
          {error && (
            <Typography 
              sx={{ color: 'red', marginTop: '16px' }} 
              variant="body1"
            >
              {error}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePwDialog}>Mégse</Button>
          <Button onClick={handleLogInPrivateChatroom}>Belépés</Button>
        </DialogActions>
      </Dialog>

      {/* Új szoba létrehozásának dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Új chatszoba létrehozása</DialogTitle>
        <DialogContent>
          <TextField
            label="Szoba neve"
            fullWidth
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)}
            sx={{ marginBottom: 2 }}
          />
          <FormControl component="fieldset">
            <FormLabel component="legend">Szoba típusa</FormLabel>
            <RadioGroup
              value={isPrivate ? 'private' : 'public'}
              onChange={(e) => setIsPrivate(e.target.value === 'private')}
            >
              <FormControlLabel value="public" control={<Radio />} label="Nyilvános" />
              <FormControlLabel value="private" control={<Radio />} label="Privát" />
            </RadioGroup>
          </FormControl>
          {isPrivate && (
            <TextField
              label="Belépési kód"
              type='password'
              fullWidth
              value={password}
              inputProps={{ maxLength: 4, minLength: 4, pattern: '\\d*' }}
              onChange={handlePrivatePwChange}
              error={privatePwError}
              helperText={privatePwError ? "A jelszónak 4 számjegyből kell állnia!" : "4 számjegyű kód."}
              sx={{ marginTop: 2 }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Mégse</Button>
          <Button onClick={handleAddRoom}>Létrehozás</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ChatRooms;
