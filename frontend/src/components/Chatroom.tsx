//import { useParams } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { Box, TextField, Button, List, ListItem, Typography, Paper, Dialog, DialogTitle, DialogContent, DialogActions, IconButton } from '@mui/material';
import { getCurrentUserName, addDataToCollectionWithAutoID, getCollectionByID } from '../services/FirebaseService';
import dayjs from 'dayjs';
import { DocumentData, onSnapshot } from 'firebase/firestore';
import { MessageModel } from '../models/MessageModel';
import { generateRandomId } from '../services/RandomService';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';


type Props = {
  id: string,
  roomData: DocumentData
}

function ChatRoom({ id, roomData }: Props) {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  // const { id } = useParams<{ id: string }>();

  const [messages, setMessages] = useState<DocumentData[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [currentUserName, setCurrentUserName] = useState<string>('');
  const [openInfoModal, setOpenInfoModal] = useState<boolean>(false);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const newMessageObject: MessageModel = {
      id: generateRandomId(12),
      user: currentUserName,
      text: newMessage,
      created_at: new Date(),
      room_id: id || '',
    };

    await addDataToCollectionWithAutoID('messages', newMessageObject);
    setNewMessage('');
  };

  const handleOpenInfoModal = async () => {
    setOpenInfoModal(true);
  };
  
  const handleCloseInfoModal = () => {
    setOpenInfoModal(false);
  };

  useEffect(() => {
    // Set up the real-time listener
    const unsubscribe = onSnapshot(getCollectionByID('messages'), (querySnapshot) => {
      const msgs: DocumentData[] = querySnapshot.docs.map(doc => doc.data());
      setMessages(msgs.filter(msg => msg.room_id === id).sort((a, b) => {return a.created_at.toMillis() - b.created_at.toMillis()}))
    }, (error) => {
      console.error('Error fetching data:', error);
    });

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, [id]);

  useEffect(() => {
    const fetchUserName = async () => {
      const userName: string = await getCurrentUserName()
      //const userName: string = await Promise.resolve('test_user_name');
      setCurrentUserName(userName);
    }

    fetchUserName();
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '85vh',
      }}
    >
        <Box>
          <Box sx={{ display: 'flex', width: '100%', justifyContent: 'center', alignItems: 'center', color: 'grey' }}>
            <Typography variant="h5" gutterBottom>
              Szoba neve: {id}
            </Typography>
            <IconButton onClick={handleOpenInfoModal} sx={{ marginLeft: '10px', bottom:'5px' }}>
              <InfoOutlinedIcon />
            </IconButton>
          </Box>

        {/* Modális ablak */}
        <Dialog open={openInfoModal} onClose={handleCloseInfoModal}>
          <DialogTitle>Szoba Információ</DialogTitle>
          <DialogContent>
            <Typography variant="body1">Létrehozó: {roomData.creator}</Typography>
            <Typography variant="body1">Létrehozva: {dayjs(roomData.created_at.toDate()).format('YYYY.MM.DD - HH:mm:ss')}</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseInfoModal}>Bezár</Button>
          </DialogActions>
        </Dialog>
      </Box>
      
      <Paper
        sx={{
          flex: 1,
          overflowY: 'auto',
          marginBottom: 2,
          padding: 2,
          backgroundColor: '#f5f5f5'
        }}
      >
        <List>
          {messages.map((message) => (
            <ListItem
              key={message.id}
              sx={{
                display: 'flex',
                justifyContent: message.user === currentUserName ? 'flex-end' : 'flex-start',
              }}
            >
              <Box sx={{maxWidth: '60%'}}>
                <label
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 'bold',
                    color: 'grey',
                  }}
                >
                  {message.user}
                </label>
                <Box
                  sx={{
                    backgroundColor: message.user === currentUserName ? '#1976d2' : '#e0e0e0',
                    color: message.user === currentUserName ? 'white' : 'black',
                    borderRadius: 2,
                    padding: 1,
                    
                  }}
                >
                  <Typography variant="body2">{message.text}</Typography>
                </Box>
                <label
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 'bold',
                    color: 'grey',
                  }}
                >
                  {dayjs(message.created_at.toDate()).format('YYYY.MM.DD - HH:mm:ss')}
                </label>
              </Box>
              
            </ListItem>
          ))}
          <div ref={messagesEndRef} />
        </List>
      </Paper>
      
      <Box
        component="form"
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        sx={{
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <TextField
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          variant="outlined"
          placeholder="Type a message..."
          fullWidth
          sx={{ marginRight: 1 }}
        />
        <Button variant="contained" color="primary" onClick={handleSendMessage}>
          Send
        </Button>
      </Box>
    </Box>
  );
}

export default ChatRoom;
