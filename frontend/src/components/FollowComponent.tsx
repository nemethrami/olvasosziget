import { Box, Button, Typography, List, ListItem, ListItemText } from '@mui/material';
import { DocumentData } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { getDocData } from '../services/FirebaseService';
import AvatarComponent from './AvatarComponent';

const FollowComponent = () => {
  const [selectedTab, setSelectedTab] = useState<'followers' | 'following'>('followers');
  const [followers, setFollowers] = useState<DocumentData[]>([]);
  const [following, setFollowing] = useState<DocumentData[]>([]);
  const [followerIds, setFollowerIds] = useState<string[]>([]);
  const [followingIds, setFollowingIds] = useState<string[]>([]);
  
  useEffect(() => {
    async function fetchFollowIds() {
      const uid = localStorage.getItem('uid');
      if (!uid) return;

      const userDocData = await getDocData('users', uid);

      if (userDocData) {
        setFollowerIds(userDocData.followers || []);
        setFollowingIds(userDocData.following || []);
      }
    }

    fetchFollowIds();
  }, []); // Runs once on component mount

  // Fetch follower data when followerIds state changes
  useEffect(() => {
    async function fetchFollowData() {
      if (followerIds.length === 0) {
        setFollowers([]);
        return;
      }

      const followersPromises = followerIds.map(async (uid: string) => {
        return await getDocData('users', uid);
      });

      const followersResult: (DocumentData | null)[] = await Promise.all(followersPromises);
      const filteredResult: DocumentData[] = followersResult.filter((user): user is DocumentData => user !== null)
      setFollowers(filteredResult);
    }

    fetchFollowData();
  }, [followerIds]); // Runs whenever followerIds changes

  // Fetch following data when followingIds state changes
  useEffect(() => {
    async function fetchFollowData() {
      if (followingIds.length === 0) {
        setFollowing([]);
        return;
      }

      const followingPromises = followingIds.map(async (uid: string) => {
        return await getDocData('users', uid);
      });

      const followingResult: (DocumentData | null)[] = await Promise.all(followingPromises);
      const filteredResult: DocumentData[] = followingResult.filter((user): user is DocumentData => user !== null)
      setFollowing(filteredResult);
    }

    fetchFollowData();
  }, [followingIds]); // Runs whenever followingIds changes

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
            {followers.map((follower: DocumentData) => (
              <ListItem key={follower.username}>
                <AvatarComponent aUrl={follower.avatar_url}></AvatarComponent>
                <ListItemText primary={`${follower.lastname} ${follower.firstname}`} sx={{ marginLeft: 1, color: '#895737' }} />
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      {selectedTab === 'following' && (
        <Box sx={{ marginTop: 2 }}>
          <Typography variant="h6"></Typography>
          <List>
            {following.map((user: DocumentData) => (
              <ListItem key={user.username}>
                <AvatarComponent aUrl={user.avatar_url}></AvatarComponent>
                <ListItemText primary={`${user.lastname} ${user.firstname}`} sx={{ marginLeft: 1, color: '#895737' }} />
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </Box>
  );
};

export default FollowComponent;