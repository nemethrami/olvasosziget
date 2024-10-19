import { useState, useEffect } from 'react';
import { TextField, List, ListItem, ListItemText, CircularProgress } from '@mui/material';
import "./PeopleSearch.css";
import Box from '@mui/material/Box';
import { getCollectionDataByID, getCurrentUserName } from '../services/FirebaseService';
import { DocumentData, QuerySnapshot } from 'firebase/firestore';
import AvatarComponent from './AvatarComponent';


const PeopleSearch = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<DocumentData[]>([]);
  const [users, setUsers] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentUserName, setCurrentUserName] = useState<string>('');

  useEffect(() => {
    const fetchUsers = async () => {
      const usersSnapshot: QuerySnapshot<DocumentData, DocumentData> = await getCollectionDataByID('users');
      setUsers(usersSnapshot.docs.map(doc => doc.data()))
      setCurrentUserName(await getCurrentUserName());
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
  }, [searchQuery, currentUserName, users]);
  
  return (
    <div>
      <TextField
        label="Keresés"
        variant="outlined"
        fullWidth
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <Box sx={{ display: 'flex', justifyContent: 'center', margin: '10px' }}>
        {loading ? (
          <CircularProgress />
        ) : (
          <List>
            {searchResults.map((user) => (
              <ListItem key={user.username}>
                <AvatarComponent aUrl={user.avatar_url}></AvatarComponent>
                <ListItemText primary={`${user.lastname} ${user.firstname} (@${user.username})`} sx={{ marginLeft: 1, color:'#895737' }}/>
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    </div>
  );
};

export default PeopleSearch;