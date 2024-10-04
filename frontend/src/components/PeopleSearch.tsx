import { useState, useEffect } from 'react';
import { TextField, List, ListItem, ListItemText, CircularProgress } from '@mui/material';
import axios from 'axios';
import "./PeopleSearch.css";

interface User {
  id: string;
  username: string;
}

const PeopleSearch = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Keresés beállítása, API hívással
  useEffect(() => {
    const fetchUsers = async () => {
      if (searchQuery.length > 2) {
        setLoading(true);
        try {
          // API hívás, hogy megszerezd a felhasználókat
          const response = await axios.get(`/api/searchUsers?query=${searchQuery}`);
          setSearchResults(response.data);
        } catch (error) {
          console.error('Hiba történt a keresés során:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setSearchResults([]);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchUsers();
    }, 500); // várunk 500ms-t, mielőtt hívjuk az API-t

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  return (
    <div>
      <TextField
        label="Keresés"
        variant="outlined"
        fullWidth
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      {loading ? (
        <CircularProgress />
      ) : (
        <List>
          {searchResults.map((user) => (
            <ListItem key={user.id} button>
              <ListItemText primary={user.username} />
            </ListItem>
          ))}
        </List>
      )}
    </div>
  );
};

export default PeopleSearch;