import React, { useState } from 'react';
import { Box, Tabs, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Dialog, DialogTitle, DialogContent, TextField, DialogActions, Button, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio } from '@mui/material';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';

type ChatRoom = {
  id: number;
  name: string;
  creator: string;
  createdAt: string;
  isPrivate: boolean;
  password?: string;
};

const ChatRooms = () => {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([
    { id: 1, name: 'General', creator: 'John', createdAt: '2024-09-01', isPrivate: false },
    { id: 2, name: 'Work', creator: 'Jane', createdAt: '2024-09-05', isPrivate: true, password: '1234' },
    { id: 3, name: 'Gaming', creator: 'Alice', createdAt: '2024-09-10', isPrivate: false },
    { id: 4, name: 'Family', creator: 'Bob', createdAt: '2024-09-15', isPrivate: true, password: '5678' },
  ]);

  const [selectedTab, setSelectedTab] = useState(0);
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [joinPassword, setJoinPassword] = useState('');
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomPrivate, setNewRoomPrivate] = useState(false);
  const [newRoomPassword, setNewRoomPassword] = useState('');

  // Tab váltás kezelése
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  // Szoba csatlakozási logika
  const handleJoinRoom = (room: ChatRoom) => {
    if (room.isPrivate) {
      setSelectedRoom(room); // Kiválasztott privát szoba beállítása
      setOpenPasswordDialog(true); // Dialog megnyitása
    } else {
      console.log(`Belépés a nyilvános szobába: ${room.name}`);
      // Itt történik a nyilvános szobába való átirányítás
    }
  };

  // Jelszó ellenőrzése és belépés privát szobába
  const handlePasswordSubmit = () => {
    if (selectedRoom && joinPassword === selectedRoom.password) {
      console.log(`Belépés a privát szobába: ${selectedRoom.name}`);
      setOpenPasswordDialog(false); // Dialog bezárása
    } else {
      alert('Hibás jelszó!'); // Hibaüzenet megjelenítése
    }
  };

  // Dialog bezárása
  const handleCloseDialog = () => {
    setOpenPasswordDialog(false);
    setJoinPassword(''); // Jelszó mező alaphelyzetbe állítása
  };

  // Új szoba létrehozásának dialog megnyitása
  const handleOpenCreateDialog = () => {
    setOpenCreateDialog(true);
  };

  // Új szoba létrehozása
  const handleCreateRoom = () => {
    const newRoom: ChatRoom = {
      id: chatRooms.length + 1,
      name: newRoomName,
      creator: 'Current User', // Dinamikus felhasználónév helyettesítése
      createdAt: new Date().toISOString().split('T')[0],
      isPrivate: newRoomPrivate,
      password: newRoomPrivate ? newRoomPassword : undefined,
    };
    setChatRooms([...chatRooms, newRoom]); // Új szoba hozzáadása a listához
    setOpenCreateDialog(false); // Dialog bezárása
    setNewRoomName(''); // Mezők alaphelyzetbe állítása
    setNewRoomPrivate(false);
    setNewRoomPassword('');
  };

  // Szobák megjelenítése táblázatban
  const renderTable = (rooms: ChatRoom[]) => (
    <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 2 }}>
      <TableContainer component={Paper} sx={{ maxWidth: '600px', width: '100%' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Szoba neve</TableCell>
              <TableCell>Létrehozó</TableCell>
              <TableCell>Létrehozás dátuma</TableCell>
              <TableCell>Csatlakozás</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rooms.map((room) => (
              <TableRow key={room.id}>
                <TableCell>{room.name}</TableCell>
                <TableCell>{room.creator}</TableCell>
                <TableCell>{room.createdAt}</TableCell>
                <TableCell>
                  <PersonAddOutlinedIcon 
                    sx={{ cursor: 'pointer' }} 
                    onClick={() => handleJoinRoom(room)} // Csatlakozási logika meghívása
                  />
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
      {selectedTab === 0 && renderTable(chatRooms.filter(room => !room.isPrivate))}
      {selectedTab === 1 && renderTable(chatRooms.filter(room => room.isPrivate))}

      {/* Új szoba létrehozásának gombja */}
      <Box display="flex" justifyContent="center" sx={{ marginTop: 2 }}>
        <Button variant="contained" onClick={handleOpenCreateDialog} 
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
      <Dialog open={openPasswordDialog} onClose={handleCloseDialog}>
        <DialogTitle>Belépés a privát szobába</DialogTitle>
        <DialogContent>
          <TextField
            label="Belépési kód"
            type="password"
            fullWidth
            value={joinPassword}
            onChange={(e) => setJoinPassword(e.target.value)}
            inputProps={{ maxLength: 4, pattern: '\\d*' }} // Csak 4 számjegy fogadása
            helperText="4 számjegyű kód szükséges"
            sx={{ marginTop: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Mégse</Button>
          <Button onClick={handlePasswordSubmit}>Belépés</Button>
        </DialogActions>
      </Dialog>

      {/* Új szoba létrehozásának dialog */}
      <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)}>
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
              value={newRoomPrivate ? 'private' : 'public'}
              onChange={(e) => setNewRoomPrivate(e.target.value === 'private')}
            >
              <FormControlLabel value="public" control={<Radio />} label="Nyilvános" />
              <FormControlLabel value="private" control={<Radio />} label="Privát" />
            </RadioGroup>
          </FormControl>
          {newRoomPrivate && (
            <TextField
              label="Belépési kód"
              type='password'
              fullWidth
              value={newRoomPassword}
              onChange={(e) => setNewRoomPassword(e.target.value)}
              inputProps={{ maxLength: 4, pattern: '\\d*' }}
              helperText="4 számjegyű kód"
              sx={{ marginTop: 2 }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateDialog(false)}>Mégse</Button>
          <Button onClick={handleCreateRoom}>Létrehozás</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ChatRooms;
