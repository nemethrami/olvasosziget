//import { useParams } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { Box, Button, List, ListItem, Typography, Paper, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, InputBase, Divider } from '@mui/material';
import { getCurrentUserName, addDataToCollectionWithAutoID, getCollectionByID } from '@services/FirebaseService';
import dayjs from 'dayjs';
import { DocumentData, onSnapshot, Timestamp } from 'firebase/firestore';
import { MessageModel } from '@models/MessageModel';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import SendIcon from '@mui/icons-material/Send';


type Props = {
  id: string,
  roomData: DocumentData
}

function ChatRoom({ id, roomData }: Props) {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const [messages, setMessages] = useState<DocumentData[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [currentUserName, setCurrentUserName] = useState<string>('');
  const [openInfoModal, setOpenInfoModal] = useState<boolean>(false);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const newMessageObject: MessageModel = {
      user: currentUserName,
      text: newMessage,
      created_at: Timestamp.now(),
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
    const unsubscribe = onSnapshot(getCollectionByID('messages'), (querySnapshot) => {
      const msgs: DocumentData[] = querySnapshot.docs.map(doc => doc.data());
      setMessages(msgs.filter(msg => msg.room_id === id).sort((a, b) => {return a.created_at.toMillis() - b.created_at.toMillis()}))
    }, (error) => {
      console.error('Error fetching data:', error);
    });

    return () => unsubscribe();
  }, [id]);

  useEffect(() => {
    const fetchUserName = async () => {
      const userName: string = await getCurrentUserName()
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
          <Box sx={{ display: 'flex', width: '100%', justifyContent: {xs: 'end', sm: 'center'}, alignItems: 'center', color: 'grey' }}>
            <Typography variant="h5" gutterBottom sx={{ fontSize: {xs: '0.9rem', sm: '1.3rem'} }}>
              Szoba neve: {id}
            </Typography>
            <IconButton onClick={handleOpenInfoModal} sx={{ marginLeft: '10px', bottom:'5px' }}>
              <InfoOutlinedIcon sx={{ fontSize: {xs: '1.2rem', sm: '1.3rem'} }} />
            </IconButton>
          </Box>

        {/* Modális ablak */}
        <Dialog open={openInfoModal} onClose={handleCloseInfoModal}>
          <DialogTitle>Szoba Információ</DialogTitle>
          <DialogContent>
            <Typography variant="body1">Létrehozó: {roomData.creator}</Typography>
            <Typography variant="body1">Létrehozva: {dayjs(roomData.created_at.toDate()).format('YYYY.MM.DD - HH:mm:ss')}</Typography>
            {roomData.is_private && <Typography variant="body1">Jelszó: {roomData.password}</Typography>}
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
          marginBottom: 1,
          padding: 2,
          boxShadow: 3,
          backgroundColor: '#fefffe'
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

      <Paper
        component="form"
        sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', width: '100%', marginBottom: 0 }}
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
      >
        <InputBase
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          sx={{ ml: 1, flex: 1, fontSize: {xs: '0.7rem', sm: '0.8rem', md: '0.9rem', lg: '1rem'} }}
          placeholder="Új üzenet"
          inputProps={{ 'aria-label': 'new message' }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSendMessage();
            }
          }}
        />
        <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
        <IconButton color="primary" onClick={handleSendMessage} sx={{ p: '10px' }} aria-label="send-button">
          <SendIcon sx={{fontSize: {xs: '0.7rem', sm: '0.8rem', md: '0.9rem', lg: '1rem'}}} />
        </IconButton>
      </Paper>
    </Box>
  );
}

export default ChatRoom;
