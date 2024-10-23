import React, { useEffect, useState } from 'react';
import { 
  IconButton, 
  Box, 
  Tabs, 
  Tab, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  TextField, 
  DialogActions, 
  FormControl, 
  FormLabel, 
  RadioGroup, 
  FormControlLabel, 
  Radio, 
  Typography,
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { getCollectionByID, addDataToCollection, getCurrentUserName, deleteDocDataByID } from '../services/FirebaseService';
import { CollectionReference, DocumentData, getDocs, onSnapshot, Query, query, where, QuerySnapshot, collection } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { db } from '../config/FirebaseConfig';


type ChatRoom = {
  name: string;
  creator: string;
  created_at: Date;
  is_private: boolean;
  password: string;
};


const ChatRooms = () => {
  const navigate = useNavigate();
  // Chat szobák kezdeti állapota
  const [publicRooms, setPublicRooms] = useState<DocumentData[]>([]);
  const [privateRooms, setPrivateRooms] = useState<DocumentData[]>([]);


  const [selectedTab, setSelectedTab] = useState(0);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [openPwDialog, setOpenPwDialog] = useState<boolean>(false);
  const [newRoomName, setNewRoomName] = useState<string>('');
  const [currentRoom, setCurrentRoom] = useState<DocumentData | null>(null);
  const [isPrivate, setIsPrivate] = useState<boolean>(false);
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loads, setLoading] = useState<boolean>(true);
  const [currentUserName, setCurrentUserName] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const username: string = await getCurrentUserName();
      setCurrentUserName(username);
    };
  
    fetchUserData();

    // Set up the real-time listener
    const unsubscribe = onSnapshot(collection(db, 'chatrooms'), (querySnapshot) => {
      const rooms: DocumentData[] = querySnapshot.docs.map((doc: DocumentData) => doc.data());
      setPublicRooms(rooms.filter(room => !room.is_private))
      setPrivateRooms(rooms.filter(room => room.is_private))
      setLoading(false);
    }, (error) => {
      console.error('Error fetching data:', error);
      setLoading(false);
    });

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, []);

  if (loads) {
    return <p>Loading...</p>;
  }

  // Tab váltás kezelése
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    event.preventDefault();
    setSelectedTab(newValue);
  };

  // Szoba csatlakozási logika
  const handleAddRoom = async (event: React.SyntheticEvent) => {
    event.preventDefault();

    const newRoom: ChatRoom = {
      name: newRoomName,
      creator: currentUserName,
      created_at: new Date(),
      is_private: isPrivate,
      password: password,
    };

    await addDataToCollection('chatrooms', newRoomName, newRoom);
    handleCloseDialog(event);
    setPassword('');
  };

  const handleDeleteChatRoom = async (event: React.SyntheticEvent, room: DocumentData) => {
    event.preventDefault();
    const messageRef: CollectionReference<DocumentData, DocumentData> = getCollectionByID('messages');
    const q: Query<DocumentData, DocumentData> = query(messageRef, where('room_id', '==', room.name))

    const querySnapshot: QuerySnapshot<DocumentData, DocumentData> = await getDocs(q);

    const deletePromises = querySnapshot.docs.map(async (doc) => {
      await deleteDocDataByID('messages', doc.id);
    });

    // Wait for all deletions to complete
    await Promise.all(deletePromises);
    await deleteDocDataByID("chatrooms", room.name)
  };

  // Modális megnyitása
  const handleOpenDialog = (event: React.SyntheticEvent) => {
    event.preventDefault();
    setOpenDialog(true);
  };

  // Modális bezárása
  const handleCloseDialog = (event: React.SyntheticEvent) => {
    event.preventDefault();
    setOpenDialog(false);
    setNewRoomName(''); //Mezők alaphelyzetbe állítása
    setIsPrivate(false);
    setPassword('');
  };  

  const handleLogInPrivateChatroom = () => {
    if (currentRoom && password === currentRoom.password) {
      navigate(`/chatrooms/${currentRoom.name}`);
    } else {
      setError('A jelszó nem megfelelő!');
    }
    setPassword('');
  }

  const handleLogInChatRoom = (event: React.SyntheticEvent, room: DocumentData) => {
    event.preventDefault();
    if (room.is_private) {
      setCurrentRoom(room);
      setOpenPwDialog(true);
    } else {
      navigate(`/chatrooms/${room.name}`);
    }
  }

  const handleClosePwDialog = (event: React.SyntheticEvent) => {
    event.preventDefault();
    setOpenPwDialog(false);
    setPassword('');
    setError('');
  }

  // Szobák megjelenítése táblázatban
  const renderTable = (rooms: DocumentData[]) => (
    <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 2 }}>
      <TableContainer component={Paper} sx={{ maxWidth: '600px', width: '100%', background: 'linear-gradient(135deg, #eae2ca 30%, #f5f0e1 90%)', borderRadius:'8px', boxShadow: 3, border: '1px solid #d1cfcf', overflow: 'hidden'}}>
        <Table sx={{ tableLayout: 'fixed' }}>
          <TableHead sx={{borderBottom: '2px solid #4A4B2D'}}>
            <TableRow>
              <TableCell style={{ fontWeight:'bold', width:'20%' }}>Szoba neve</TableCell>
              <TableCell style={{ fontWeight:'bold', width: '20%' }}>Létrehozó</TableCell>
              <TableCell style={{ fontWeight:'bold', whiteSpace: 'nowrap', width: '20%' }}>Létrehozás dátum</TableCell>
              <TableCell style={{ fontWeight:'bold', width: '12%' }}>Csatlakozás</TableCell>
              <TableCell style={{ fontWeight:'bold', width: '10%' }}>Törlés</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rooms.map((room) => (
              <TableRow key={room.id}
                sx={{
                  '&:hover': {
                    backgroundColor: '#e5d2b8', 
                  },
                }}
              >
                <TableCell>{room.name}</TableCell>
                <TableCell>{room.creator}</TableCell>
                <TableCell>{room.created_at.toDate().toLocaleDateString()}</TableCell>
                <TableCell>
                  <IconButton aria-label="connect" onClick={(e) => handleLogInChatRoom(e, room)}>
                    <PersonAddIcon />
                  </IconButton>
                </TableCell>
                <TableCell>
                  <IconButton aria-label="delete" onClick={(e) => handleDeleteChatRoom(e, room)} disabled={currentUserName !== room.creator}>
                    <DeleteForeverIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  return (
    <Box>
      {/* Tab navigáció */}
      <Tabs value={selectedTab} onChange={handleTabChange} centered 
          sx={{
            '& .MuiTabs-indicator': {
              backgroundColor: '#794f29', // Change the color of the indicator (aláhúzás szín)
            }
          }}
        >
          <Tab label="Nyilvános"
            sx={{ 
              color:'#794f29', // Alapszín
              '&.Mui-selected': {
                color: '#794f29', // Text color when selected (kiválasztáskor szín)
              },
            }}
          />
          <Tab label="Privát" 
            sx={{
              color:'#794f29', // Alapszín
              '&.Mui-selected': {
                color: '#794f29', // Text color when selected (kiválasztáskor szín)
              },
            }}
          />
      </Tabs>

      {/* Táblázat megjelenítése az aktuális fül szerint */}
      {selectedTab === 0 && (
        <Box>
          {renderTable(publicRooms)}
        </Box>
      )}
      {selectedTab === 1 && (
        <Box>
          {renderTable(privateRooms)}
        </Box>
      )}

      {/* Új szoba létrehozásának gombja */}
      <Box display="flex" justifyContent="center" sx={{ marginTop: 2 }}>
        <Button variant="contained" onClick={handleOpenDialog} 
          sx={{ 
            backgroundColor: '#eae2ca', 
            color: '#895737',
            fontWeight: '600',
            fontFamily: 'Times New Roman', 
            borderRadius: '8px',
            margin: '16px',
            cursor: 'pointer',
            padding: '10px 20px',
            '&:hover': {
              backgroundColor: '#90784f',
            }
          }}
        >
          Létrehozás
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
  );
};

export default ChatRooms;
