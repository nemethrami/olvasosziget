import { Box, Button, Typography, List, ListItem, ListItemText, IconButton, TextField, Autocomplete } from '@mui/material';
import { DocumentData, QuerySnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { getCollectionDataByID, getCurrentUser, getDocData, userFollow, userUnFollow } from '@services/FirebaseService';
import AvatarComponent from '@components/AvatarComponent';
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
  const [selectedTab, setSelectedTab] = useState<'followers' | 'following'>('followers');
  const [followers, setFollowers] = useState<DocumentData[]>([]);
  const [following, setFollowing] = useState<DocumentData[]>([]);
  const [followerIds, setFollowerIds] = useState<string[]>([]);
  const [followingIds, setFollowingIds] = useState<string[]>([]);
  const [users, setUsers] = useState<DocumentData[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [followStatus, setFollowStatus] = useState<FollowStatus[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const usersSnapshot: QuerySnapshot<DocumentData, DocumentData> = await getCollectionDataByID('users');
      setUsers(usersSnapshot.docs.map(doc => {
        const firstLetter = doc.data().lastname[0].toUpperCase();

        return {
          id: doc.id,
          firstLetter: /[0-9]/.test(firstLetter) ? '0-9' : firstLetter,
          ...doc.data()
        }
      }))
      const currentUser: User | null = getCurrentUser();
      if (currentUser) setCurrentUserId(currentUser.uid);
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    setFollowStatus((prevFollowStatus) => {
      const updatedFollowStatus = [...prevFollowStatus];
    
      users.forEach((user) => {
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
  }, [users]);
  
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
  }, []);

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
  }, [followerIds]);

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
  }, [followingIds]);

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
    <Box sx={{ display: 'flex', width: '100%', padding: 2, flexDirection: {xs: 'column', md: 'row'}, alignItems: {xs: 'center', md: 'start'} }}>
      {/* Felhasználók keresése / követése */}
      <Autocomplete
        id="user-select"
        sx={{ width: {xs: '90%', md: '50%'}, marginBottom: { xs: '40px', md: '0px' } }}
        options={users.filter((user) => user.uid !== currentUserId).sort((a, b) => -b.firstLetter.localeCompare(a.firstLetter))}
        groupBy={(option) => option.firstLetter}
        autoHighlight
        getOptionLabel={(user) => `${user.lastname} ${user.firstname}`}
        renderOption={(props, user) => {
          const userStatus = followStatus.filter((fStatus) => fStatus.uid === user.uid)[0]
          const isFollowing = userStatus?.isFollowing;
          const isNotFollowing = !isFollowing;

          return (
            <Box
              key={user.id}
              component="li"
              sx={{ '& > img': { mr: 2, flexShrink: 0 } }}
            >
              <Button sx={{ color: 'grey', textTransform: 'none' }} onClick={() => navigateToProfile(user.username)}>
                <AvatarComponent aUrl={user.avatar_url}></AvatarComponent>
                <Typography sx={{ marginLeft: 1, color:'#895737' }}>
                  {user.lastname} {user.firstname} (@{user.username})
                </Typography>
              </Button>
              <IconButton onClick={() => handleFollow(user.uid)} sx={{ fontSize: "1em", color: 'grey' }} disabled={isFollowing}> 
                <PersonAddIcon></PersonAddIcon>
              </IconButton>
              <IconButton onClick={() => handleUnFollow(user.uid)} sx={{ fontSize: "1em", color: 'grey' }} disabled={isNotFollowing}> 
                <PersonRemoveIcon></PersonRemoveIcon>
              </IconButton>
            </Box>
          );
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Keress felhasználókat"
          />
        )}
        filterOptions={(options, state) => {
          if (!state.inputValue) return options;

          return options.filter((user) =>
            user.lastname.toLowerCase().startsWith(state.inputValue.toLowerCase()) || 
            user.firstname.toLowerCase().startsWith(state.inputValue.toLowerCase()) ||
            user.username.toLowerCase().startsWith(state.inputValue.toLowerCase())
          );
        }}
      />

      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'start',
          borderRadius: '8px',
          marginLeft: {xs: 0, md: 2},
          padding: {xs: 0, md: 2},
          overflow: 'auto',
          minHeight: { xs: '70vh', md: '80vh', lg: '83vh', xl: '90vh'},
          maxHeight: {xs: '70vh', md: '80vh', lg: '83vh', xl: '90vh'},
          width: {xs: '90%', md: '50%'}, 
          boxShadow: 2
        }}
      >
        {/* Fül navigáció */}
        <Box sx={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: {xs: 'space-around', md: 'center'}, gap: {xs: 0, md: 5}, padding: 1 }}>
          <Button
            variant={selectedTab === 'followers' ? 'contained' : 'outlined'}
            onClick={() => setSelectedTab('followers')}
            sx={{ 
              backgroundColor: '#eae2ca', 
              color: '#895737',
              fontWeight: '600',
              fontFamily: 'Times New Roman', 
              borderRadius: '8px',
              cursor: 'pointer',
              border: 'none',
              fontSize: { xs: '0.8em', sm: '1em', md: '0.8em', lg: '1em' },
              transition: 'background-color 0.8s ease',
              '&:hover': {
                backgroundColor: '#90784f',
                color: '#f3e9dc',
                border: 'none',
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
              cursor: 'pointer',
              border: 'none',
              fontSize: { xs: '0.8em', sm: '1em', md: '0.8em', lg: '1em' },
              transition: 'background-color 0.8s ease',
              '&:hover': {
                backgroundColor: '#90784f',
                color: '#f3e9dc',
                border: 'none',
              }
            }}
          >
            Követések
          </Button>
        </Box>

        {/* Lista megjelenítése, az adott fül alapján */}
        {selectedTab === 'followers' && (
          <Box>
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
          <Box>
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
    </Box>
  );
};

export default FollowComponent;