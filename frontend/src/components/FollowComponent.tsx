import { Box, Button, Typography, List, ListItem, ListItemText, IconButton, TextField, CircularProgress } from '@mui/material';
import { DocumentData, QuerySnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { getCollectionDataByID, getCurrentUser, getCurrentUserName, getDocData, userFollow, userUnFollow } from '../services/FirebaseService';
import AvatarComponent from './AvatarComponent';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { useNavigate } from 'react-router-dom';
import { User } from 'firebase/auth';

type FollowStatus = {
  uid: string,
  isFollowing: boolean,
}

const FollowComponent = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTab, setSelectedTab] = useState<'followers' | 'following'>('followers');
  const [followers, setFollowers] = useState<DocumentData[]>([]);
  const [following, setFollowing] = useState<DocumentData[]>([]);
  const [followerIds, setFollowerIds] = useState<string[]>([]);
  const [followingIds, setFollowingIds] = useState<string[]>([]);
  const [users, setUsers] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentUserName, setCurrentUserName] = useState<string>('');
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [searchResults, setSearchResults] = useState<DocumentData[]>([]);
  const [followStatus, setFollowStatus] = useState<FollowStatus[]>(
    searchResults.map(user => ({
      uid: user.uid,
      isFollowing: user.followers.includes(currentUserId),
    }))
  );

  useEffect(() => {
    const fetchUsers = async () => {
      const usersSnapshot: QuerySnapshot<DocumentData, DocumentData> = await getCollectionDataByID('users');
      setUsers(usersSnapshot.docs.map(doc => doc.data()))
      setCurrentUserName(await getCurrentUserName());
      const currentUser: User | null = getCurrentUser();
      if (currentUser) setCurrentUserId(currentUser.uid);
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    const filterUsers = (): DocumentData[] => {
      const lowerCaseQuery = searchQuery.toLowerCase();
      return users.filter(
        (user) =>
          lowerCaseQuery && user.username !== currentUserName &&
          (user.firstname.toLowerCase().includes(lowerCaseQuery) ||
          user.lastname.toLowerCase().includes(lowerCaseQuery) ||
          user.username.toLowerCase().includes(lowerCaseQuery))
      );
    };
    setLoading(true);
    setSearchResults(filterUsers());
    setLoading(false);
  }, [searchQuery]);

  useEffect(() => {
    setFollowStatus((prevFollowStatus) => {
      const updatedFollowStatus = [...prevFollowStatus];
    
      searchResults.forEach((user) => {
        const exists = updatedFollowStatus.some((status) => status.uid === user.uid);
    
        if (!exists) {
          updatedFollowStatus.push({
            uid: user.uid,
            isFollowing: user.followers.includes(currentUserId),
          });
        }
      });
    
      return updatedFollowStatus;
    });
  }, [searchResults]);
  
  useEffect(() => {
    async function fetchFollowIds() {
      const userId = localStorage.getItem('uid');

      if (!userId) return;

      const userDocData = await getDocData('users', userId);

      if (userDocData) {
        setFollowerIds(userDocData.followers || []);
        setFollowingIds(userDocData.following || []);
      }
    }

    fetchFollowIds();
  }, []); // Runs when component mounts

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

  async function handleFollow(uid: string) {
    userFollow(uid);

    setFollowStatus(prevStatus =>
      prevStatus.map(user =>
        user.uid === uid ? { ...user, isFollowing: true } : user
      )
    );

    setFollowingIds([...followingIds, uid])
  }

  async function handleUnFollow(uid: string) {
    userUnFollow(uid);

    setFollowStatus(prevStatus =>
      prevStatus.map(user =>
        user.uid === uid ? { ...user, isFollowing: false } : user
      )
    );

    setFollowingIds(followingIds.filter((id) => id !== uid))
  }

  function navigateToProfile(username: string) {
    navigate(`/profile/${username}`);
  }

  return (
    <Box sx={{ width: '100%', padding: 2, }}>
      {/* Felhasználók keresése / követése */}
      <TextField
        label="Keresés"
        variant="outlined"
        fullWidth
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      ></TextField>
      <Box sx={{ display: 'flex', justifyContent: 'center', margin: '10px' }}>
        {loading ? (
          <CircularProgress />
        ) : (
          <List>
            {searchResults.map((user) => {
              const userStatus = followStatus.filter((fStatus) => fStatus.uid === user.uid)[0]
              const isFollowing = userStatus?.isFollowing;
              const isNotFollowing = !isFollowing;

              return (
                <ListItem key={user.username}>
                  <Button sx={{ color: 'grey', textTransform: 'none' }} onClick={() => navigateToProfile(user.username)}>
                    <AvatarComponent aUrl={user.avatar_url}></AvatarComponent>
                    <ListItemText primary={`${user.lastname} ${user.firstname} (@${user.username})`} sx={{ marginLeft: 1, color:'#895737' }}/>
                  </Button>
                  <IconButton onClick={() => handleFollow(user.uid)} sx={{ fontSize: "1em", color: 'grey' }} disabled={isFollowing}> 
                    <PersonAddIcon></PersonAddIcon>
                  </IconButton>
                  <IconButton onClick={() => handleUnFollow(user.uid)} sx={{ fontSize: "1em", color: 'grey' }} disabled={isNotFollowing}> 
                    <PersonRemoveIcon></PersonRemoveIcon>
                  </IconButton>
                </ListItem>
              )
            })}
          </List>
        )}
      </Box>

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
                <Button sx={{ color: 'grey', textTransform: 'none' }} onClick={() => navigateToProfile(follower.username)}>
                  <AvatarComponent aUrl={follower.avatar_url}></AvatarComponent>
                  <ListItemText primary={`${follower.lastname} ${follower.firstname}`} sx={{ marginLeft: 1, color: '#895737' }} />
                </Button>
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
                <Button sx={{ color: 'grey', textTransform: 'none' }} onClick={() => navigateToProfile(user.username)}>
                  <AvatarComponent aUrl={user.avatar_url}></AvatarComponent>
                  <ListItemText primary={`${user.lastname} ${user.firstname}`} sx={{ marginLeft: 1, color: '#895737' }} />
                </Button>
                <IconButton onClick={() => handleUnFollow(user.uid)} sx={{ fontSize: "1em", color: 'grey' }}> 
                  <PersonRemoveIcon></PersonRemoveIcon>
                </IconButton>
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </Box>
  );
};

export default FollowComponent;