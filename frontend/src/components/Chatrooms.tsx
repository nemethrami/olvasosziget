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
  Menu
} from '@mui/material';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { getCurrentUserName, deleteDocDataByID, addDataToCollection, getCollectionByID } from '../services/FirebaseService';
import { db } from '../config/FirebaseConfig';
import { onSnapshot, collection, DocumentData, CollectionReference, Query, query, where, QuerySnapshot, getDocs } from 'firebase/firestore';
import FilterListOutlinedIcon from '@mui/icons-material/FilterListOutlined';

const filterOptions = [
  { value: 'datecsokk', label: 'Dátum szerint legfrissebb' },
  { value: 'datenov', label: 'Dátum szerint legrégebbi' },
  { value: 'ABCcsok', label: 'ABC sorrend szerint csökkenő' },
  { value: 'ABCnov', label: 'ABC sorrend szerint növekvő' },
];

type Props = {
  setRoomName: (string) => void;
  setRoomData: (DocumentData) => void;
}

const ChatRooms = ({setRoomName, setRoomData}: Props) => {
  const [publicRooms, setPublicRooms] = useState<DocumentData[]>([]);
  const [privateRooms, setPrivateRooms] = useState<DocumentData[]>([]);
  const [currentUserName, setCurrentUserName] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [openPwDialog, setOpenPwDialog] = useState<boolean>(false);
  const [newRoomName, setNewRoomName] = useState<string>('');
  const [isPrivate, setIsPrivate] = useState<boolean>(false);
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>(''); // Add error state
  const [filteredRooms, setFilteredRooms] = useState([]); // A szűrt szobák
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [anchorEl, setAnchorEl] = useState(null);

  // Szűrt szobák frissítése
  useEffect(() => {
    const allRooms = [...publicRooms, ...privateRooms]; // Összes szoba
    let newFilteredRooms = allRooms;

    // Szűrjük a szobákat a kiválasztott feltétel alapján
    if (selectedFilter === 'nyilvános') {
      newFilteredRooms = allRooms.filter(room => !room.is_private);
    } else if (selectedFilter === 'privát') {
      newFilteredRooms = allRooms.filter(room => room.is_private);
    }

    setFilteredRooms(newFilteredRooms); // Állítsuk be a szűrt szobákat
  }, [publicRooms, privateRooms, selectedFilter]);

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
  
    const unsubscribe = onSnapshot(collection(db, 'chatrooms'), (querySnapshot) => {
      const rooms: DocumentData[] = querySnapshot.docs.map((doc) => ({
        id: doc.id, // Get document ID
        ...doc.data(),
      }));
  
      // Type check to ensure all properties exist
      const validRooms = rooms.filter((room) => 
        room.name && room.creator && room.created_at && typeof room.is_private === 'boolean'
      );
  
      setPublicRooms(validRooms.filter(room => !room.is_private));
      setPrivateRooms(validRooms.filter(room => room.is_private));
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

  // Szűrő változtatás kezelése
  const handleFilterChange = (option) => {
    setSelectedFilter(option);
    setAnchorEl(null); // A menü bezárása
  };

  // Menühöz való kattintás kezelése
  const handleFilterMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Tab váltás kezelése
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const handleLogInChatRoom = (room: DocumentData) => {
    setSelectedRoomId(room.id);
    setRoomData(room);

    if (room.is_private) {
      setOpenPwDialog(true);
    } else {
      setRoomName(room.name);
    }
  };

  const handleAddRoom = async (event: React.SyntheticEvent) => {
    event.preventDefault();

    const newRoom: DocumentData = {
      name: newRoomName,
      creator: currentUserName!,
      created_at: new Date(),
      is_private: isPrivate,
      password: password,
      id: newRoomName, // Use newRoomName or generate a unique ID
    };

    await addDataToCollection('chatrooms', newRoom.id, newRoom); // Use room.id as document ID
    handleCloseDialog();
    setNewRoomName('');
    setIsPrivate(false);
    setPassword('');
  };

  const handleDeleteChatRoom = async (event: React.SyntheticEvent, room: DocumentData) => {
    event.preventDefault();
    const messageRef: CollectionReference<DocumentData, DocumentData> = getCollectionByID('messages');
    const q: Query<DocumentData, DocumentData> = query(messageRef, where('room_id', '==', room.id)); // Use room.id

    const querySnapshot: QuerySnapshot<DocumentData, DocumentData> = await getDocs(q);
    const deletePromises = querySnapshot.docs.map(async (doc) => {
      await deleteDocDataByID('messages', doc.id);
    });

    // Wait for all deletions to complete
    await Promise.all(deletePromises);
    await deleteDocDataByID("chatrooms", room.id); // Use room.id
  };

  // Modális megnyitása
  const handleOpenDialog = (event: React.SyntheticEvent) => {
    event.preventDefault();
    setOpenDialog(true);
  };

  // Modális bezárása
  const handleCloseDialog = (event?: React.SyntheticEvent) => {
    if (event) {
      event.preventDefault();
    }
    setOpenDialog(false);
    setNewRoomName(''); // Mezők alaphelyzetbe állítása
    setIsPrivate(false);
    setPassword('');
  };  

  const handleLogInPrivateChatroom = () => {
    const currentRoom = privateRooms.find(room => room.id === selectedRoomId);
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
          marginBottom: 0, // Eltávolított alsó margó
          borderRadius: 3,
          backgroundColor: '#eae2ca',
          color: '#895737',
          '&:hover': {
            backgroundColor: '#f0f0f0',
          },
        }}
        onClick={() => handleLogInChatRoom(room)}
      >
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
            {room.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {room.is_private ? 'Privát szoba' : 'Nyilvános szoba'}
          </Typography>
        </Box>
        <Box>
          {currentUserName === room.creator && (
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
    <Box sx={{ display: 'flex', height: '85vh'}}>
      {/* Bal oldali sáv tab navigációval */}
      <Box
        sx={{
          width: 300,
          backgroundColor: '#fff',
          boxShadow: '2px 0px 10px rgba(0,0,0,0.1)',
          borderRadius: '8px',
          padding: 1,
          overflowY: 'auto',
          overflow: 'visible',
          borderRight: '1px solid #d1cfcf',
          flexDirection: 'column', // Rugalmas elrendezés
          position: 'relative',
        }}
      >
        {/* Tab navigáció */}
        <Tabs 
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
            }}
          />
          <Tab label="Privát" 
            sx={{
              color:'#794f29', 
              '&.Mui-selected': {
                color: '#794f29',
              },
            }}
          />
        </Tabs>
        {/* Szűrő ikon */}
        <IconButton onClick={handleFilterMenuOpen} sx={{ margin: '16px 0', left:'220px', padding: '4px',}}>
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
              {renderTable(filteredRooms.filter(room => !room.is_private))} {/* Nyilvános szobák */}
            </Box>
          )}
          {selectedTab === 1 && (
            <Box>
              {renderTable(filteredRooms.filter(room => room.is_private))} {/* Privát szobák */}
            </Box>
          )}
        </Box>


      {/* Új szoba gomb */}
      <Button
        sx={{
          minWidth:'0px',
          backgroundColor: '#eae2ca', // Kör háttérszíne
          color: '#895737', // Kereszt színe
          borderRadius: '50%', // Kör alakúvá teszi
          width: '50px', // Gomb szélessége
          height: '50px', // Gomb magassága
          position: 'absolute',
          boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.15)', // Halvány árnyék
          border: '2px solid #794f29', // Vékony szegély a körben
          bottom: '-10px',
          left: '-15px', // Kilóg a Box bal oldalára
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 0, // Padding eltávolítása
          fontSize: '24px', // Kereszt mérete
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
              onChange={(e) => setPassword(e.target.value)}
              inputProps={{ maxLength: 4, pattern: '\\d*' }}
              helperText="4 számjegyű kód"
              sx={{ marginTop: 2 }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Mégse</Button>
          <Button onClick={handleAddRoom}>Létrehozás</Button>
        </DialogActions>
      </Dialog>
    </Box>
  </Box>
  );
};

export default ChatRooms;
