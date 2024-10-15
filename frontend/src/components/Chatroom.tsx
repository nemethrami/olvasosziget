import React, { useState } from 'react';
import { Box, Tabs, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Dialog, DialogTitle, DialogContent, TextField, DialogActions, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio } from '@mui/material';
import '../index.css'

type ChatRoom = {
  id: number;
  name: string;
  creator: string;
  createdAt: string;
  isPrivate: boolean;
};

const ChatRooms = () => {
  // Chat szobák kezdeti állapota
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([
    { id: 1, name: 'General', creator: 'John', createdAt: '2024-09-01', isPrivate: false },
    { id: 2, name: 'Work', creator: 'Jane', createdAt: '2024-09-05', isPrivate: true },
    { id: 3, name: 'Gaming', creator: 'Alice', createdAt: '2024-09-10', isPrivate: false },
    { id: 4, name: 'Family', creator: 'Bob', createdAt: '2024-09-15', isPrivate: true },
  ]);

  const publicRooms = chatRooms.filter(room => !room.isPrivate);
  const privateRooms = chatRooms.filter(room => room.isPrivate);

  // Tab váltás állapota
  const [selectedTab, setSelectedTab] = useState(0);

  // Dialog állapotok
  const [openDialog, setOpenDialog] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);

  // Tab változás kezelése
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  // Új szoba hozzáadása
  const handleAddRoom = () => {
    const newRoom: ChatRoom = {
      id: chatRooms.length + 1,
      name: newRoomName,
      creator: 'Current User', // Használj dinamikus értéket a jelenlegi felhasználónak
      createdAt: new Date().toISOString().split('T')[0],
      isPrivate: isPrivate,
    };
    setChatRooms([...chatRooms, newRoom]);
    handleCloseDialog(); // Modális bezárása
  };

  // Modális megnyitása
  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  // Modális bezárása
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setNewRoomName(''); // Mezők alaphelyzetbe állítása
    setIsPrivate(false);
  };

  // Tábla renderelő funkció
  const renderTable = (rooms: ChatRoom[]) => (
    <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 2 }}>
      <TableContainer component={Paper} sx={{ maxWidth: '600px', width: '100%' }}>
        <Table sx={{ fontSize: '0.875rem' }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ padding: '8px' }}>Szoba neve</TableCell>
              <TableCell sx={{ padding: '8px' }}>Létrehozó</TableCell>
              <TableCell sx={{ padding: '8px' }}>Létrehozás dátuma</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rooms.map((room) => (
              <TableRow key={room.id}>
                <TableCell sx={{ padding: '8px' }}>{room.name}</TableCell>
                <TableCell sx={{ padding: '8px' }}>{room.creator}</TableCell>
                <TableCell sx={{ padding: '8px' }}>{room.createdAt}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
  
  return (
      <Box>
        {/* Tabok létrehozása */}
        <Tabs value={selectedTab} onChange={handleTabChange} centered 
          sx={{
            '& .MuiTabs-indicator': {
              backgroundColor: '#794f29', // Change the color of the indicator
            }
          }}
        >
          <Tab label="Nyilvános"
            sx={{ 
              color:'#794f29',
              '&.Mui-selected': {
                color: '#794f29', // Text color when selected
              },
            }}
          />
          <Tab label="Privát" 
            sx={{
              color:'#794f29',
              '&.Mui-selected': {
                color: '#794f29', // Text color when selected
              },
            }}
          />
        </Tabs>
  
        {/* A kiválasztott tab tartalmának megjelenítése */}
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
  
        {/* Gomb elhelyezése a táblázat alatt */}
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
              border: 'none',
              padding: '10px 20px',
              transition: 'background-color 0.8s ease', // Animáció a háttérszín változásához
              '&:hover': {
                backgroundColor: '#90784f', // Change background color on hover
                color: '#f3e9dc',
              }
            }}
          >
            Létrehozás
          </Button>
        </Box>
  
        {/* Létrehozás dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog}>
          <DialogTitle>Létrehozás</DialogTitle>
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
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} color="secondary">
              Mégse
            </Button>
            <Button onClick={handleAddRoom} color="primary">
              Létrehozás
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  };

export default ChatRooms;
