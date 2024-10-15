import { Box, Button, Typography, List, ListItem, ListItemText } from '@mui/material';
import { useState } from 'react';

interface User {
  id: string;
  username: string;
}

const FollowComponent = () => {
  // Követők és követések listák
  const followers: User[] = [
    { id: '1', username: 'user1' },
    { id: '2', username: 'user2' },
    { id: '3', username: 'user3' },
  ];

  const following: User[] = [
    { id: '4', username: 'user4' },
    { id: '5', username: 'user5' },
  ];

  const [selectedTab, setSelectedTab] = useState<'followers' | 'following'>('followers');

  return (
    <Box sx={{ width: '100%', padding: 2, }}>
      {/* Fül navigáció */}
      <Box sx={{ display: 'flex', justifyContent: 'center', marginBottom: 2, }}>
        <Button
          variant={selectedTab === 'followers' ? 'contained' : 'outlined'}
          onClick={() => setSelectedTab('followers')}
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
          Követők
        </Button>
        <Button
          variant={selectedTab === 'following' ? 'contained' : 'outlined'}
          onClick={() => setSelectedTab('following')}
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
          Követések
        </Button>
      </Box>

      {/* Lista megjelenítése, az adott fül alapján */}
      {selectedTab === 'followers' && (
        <Box sx={{ marginTop: 2 }}>
          <Typography variant="h6"></Typography>
          <List>
            {followers.map((follower) => (
              <ListItem key={follower.id}>
                <ListItemText primary={follower.username} />
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      {selectedTab === 'following' && (
        <Box sx={{ marginTop: 2 }}>
          <Typography variant="h6"></Typography>
          <List>
            {following.map((user) => (
              <ListItem key={user.id}>
                <ListItemText primary={user.username} />
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </Box>
  );
};

export default FollowComponent;