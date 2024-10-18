import { useParams } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { Box, TextField, Button, List, ListItem, Typography, Paper } from '@mui/material';
import { getCurrentUserName, addDataToCollectionWithAutoID, getCollectionByID } from '../services/FirebaseService';
import dayjs from 'dayjs';
import { DocumentData, onSnapshot } from 'firebase/firestore';
import { MessageModel } from '../models/MessageModel';

function ChatRoom() {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const { id } = useParams<{ id: string }>();

  const [messages, setMessages] = useState<DocumentData[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [currentUserName, setCurrentUserName] = useState<string>('');

  const generateRandomId = (length = 10) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

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
        <Box sx={{ display: 'flex', width: '100%', justifyContent: 'center', alignItems: 'center', color: 'grey' }}>
            <Typography variant="h4" gutterBottom>
                Chatroom: {id}
            </Typography>
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
