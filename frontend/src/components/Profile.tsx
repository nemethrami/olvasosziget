import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Dialog, DialogTitle, DialogActions, Button, IconButton, Divider, List, ListItemText, ListItem, TextField, Rating, Tabs, Tab } from '@mui/material';
import { getStorageRef, getDocRef, getAvatarUrlByUserName, getCollectionByID, postLike, postDislike, getCurrentUserName, postComment, postCommentDelete, deleteDocDataByID } from '../services/FirebaseService';
import { getDownloadURL, uploadBytes } from 'firebase/storage';
import { DocumentData, onSnapshot, QueryDocumentSnapshot, Timestamp, updateDoc } from 'firebase/firestore';
import AvatarComponent from './AvatarComponent';
import { useParams } from 'react-router-dom';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import dayjs from 'dayjs';
import edition_placeholder from '../assets/edition_placeholder.png'
import { CommentModel } from '../models/ReviewModel';
import CloseIcon from '@mui/icons-material/Close';


const UserProfile: React.FC = () => {
  const currentUserId: string | null = localStorage.getItem('uid');
  const { id } = useParams<{ id: string }>();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [tabValue, setTabValue] = React.useState(0);

  const [posts, setPosts] = useState<QueryDocumentSnapshot<DocumentData, DocumentData>[] >([]);
  const [postDatas, setPostDatas] = useState<DocumentData[]>([]);
  const [goals, setGoals] = useState<QueryDocumentSnapshot<DocumentData, DocumentData>[] >([]);
  const [goalDatas, setGoalDatas] = useState<DocumentData[]>([]);
  const [newComments, setNewComments] = useState<string[]>([]);

  useEffect(() => {
    // Set up the real-time listener
    const unsubscribe = onSnapshot(getCollectionByID('reviews'), (querySnapshot) => {
      const filteredResult = querySnapshot.docs.filter(doc => doc.data().created_username === id);
      const data: DocumentData[] = filteredResult.map(doc => doc.data());
      setPosts(filteredResult.sort((a, b) => b.data().created_at.toDate().getTime() - a.data().created_at.toDate().getTime()));
      setPostDatas(data.sort((a, b) => b.created_at.toDate().getTime() - a.created_at.toDate().getTime()))
      setNewComments(Array(data.length).fill(''));
    }, (error) => {
      console.error('Error fetching review data:', error);
    });

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, [id]);

  useEffect(() => {
    // Set up the real-time listener
    const unsubscribe = onSnapshot(getCollectionByID('goals'), (querySnapshot) => {
      const filteredResult = querySnapshot.docs.filter(doc => doc.data().created_username === id);
      const data: DocumentData[] = filteredResult.map(doc => doc.data());
      setGoals(filteredResult.sort((a, b) => b.data().created_at.toDate().getTime() - a.data().created_at.toDate().getTime()));
      setGoalDatas(data.sort((a, b) => b.created_at.toDate().getTime() - a.created_at.toDate().getTime()))
    }, (error) => {
      console.error('Error fetching goal data:', error);
    });

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, [id]);

  useEffect(() => {
    const fetchAvatarUrl = async () => {
      if (!id) return;

      const aUrl: string = await getAvatarUrlByUserName(id);
      setAvatarUrl(aUrl);
    }

    fetchAvatarUrl();
  }, [id]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedImage(event.target.files[0]);
    }
  };

  const handleSaveImage = async () => {
    if (!selectedImage) {
      setDialogOpen(false);
      setSelectedImage(null);
      return;
    }
    
    const userId = localStorage.getItem('uid');
    if (!userId) {
      setDialogOpen(false);
      setSelectedImage(null);
      return;
    }

    const storageRef = getStorageRef(`profilePictures/${userId}.jpg`);

    try {
        // Upload file to Firebase Storage
        await uploadBytes(storageRef, selectedImage);
        // Get the download URL
        const downloadURL = await getDownloadURL(storageRef);
    
        // Save the URL to Firestore
        await updateDoc(getDocRef('users', userId), {
            avatar_url: downloadURL,
        });

        alert('Profile picture uploaded successfully!');
    } catch (error) {
        console.error('Error uploading profile picture:', error);
    } finally {
        setSelectedImage(null);
        setDialogOpen(false);
    }
  }

  const handleDialogOpen = () => {
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedImage(null);
  };

  const handleBookRead = async (goalId) => {
    console.log(goalId)
    /* try {
      const goalRef = doc(firestore, 'goals', goalId); // Cseréld ki a 'goals' a megfelelő kollekció nevére
      await updateDoc(goalRef, {
        completed_books: increment(1), // Növeli az elolvasott könyvek számát
        goal_amount: increment(-1) // Csökkenti a célzott könyvek számát
      });
      // Opció: Töltsd fel az állapotot, hogy a felhasználó láthassa a frissítést
    } catch (error) {
      console.error("Hiba történt a könyv elolvasásakor:", error);
    } */
  };

  const handleLike = async (idx: number, likes: string[], postId: string) => {
    if (!currentUserId) return;

    const newValue: string[] = [...likes, currentUserId];

    setPostDatas((prevItems) =>
      prevItems.map((item, index) =>
        index === idx ? { ...item, likes: newValue } : item
      )
    );

    await postLike(postId, currentUserId)
  };

  const handleDislike = async (idx: number, likes: string[], postId: string) => {
    if (!currentUserId) return;

    const newValue: string[] = likes.filter(item => item !== currentUserId);

    setPostDatas((prevItems) =>
      prevItems.map((item, index) =>
        index === idx ? { ...item, likes: newValue } : item
      )
    );

    await postDislike(postId, currentUserId)
  };

  const handleAddComment = async (idx: number, comments: CommentModel[], newComment: string, postId: string) => {
    const currentUserName: string = await getCurrentUserName();
    const newValue: CommentModel[] = [...comments, {username: currentUserName, text: newComment, created_at: Timestamp.now()}]

    setPostDatas((prevItems) =>
      prevItems.map((item, index) =>
        index === idx ? { ...item, comments: newValue } : item
      )
    );

    await postComment(postId, {username: currentUserName, text: newComment, created_at: Timestamp.now()});

    handleCommentChange(idx, '');
  };

  const handleDeleteComment = async (idx: number, comments: CommentModel[], postId: string, comment: CommentModel) => {
    const newValue: CommentModel[] = comments.filter(com => com !== comment)

    setPostDatas((prevItems) =>
      prevItems.map((item, index) =>
        index === idx ? { ...item, comments: newValue } : item
      )
    );

    await postCommentDelete(postId, comment);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>, idx: number, comments: CommentModel[], newComment: string, postId: string) => {
    if (event.key === 'Enter') {
      handleAddComment(idx, comments, newComment,  postId);
    }
  };

  const handleCommentChange = (index: number, value: string) => {
    const newComms = [...newComments];
    newComms[index] = value;
    setNewComments(newComms);
  };

  function handleTabChange(event: React.SyntheticEvent, newValue: number) {
    setTabValue(newValue);
  }

  const handleDeletePost = async (idx: number, postId: string) => {
    setPostDatas((prevItems) =>
      prevItems.filter((item, index) => index !== idx)
    );

    await deleteDocDataByID('reviews', postId);
  };

  const handleDeleteGoal = async (idx: number, goalId: string) => {
    console.log(goalId)

    setGoalDatas((prevItems) =>
      prevItems.filter((item, index) => index !== idx)
    );

    // await deleteDocDataByID('goals', goalId);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ marginBottom: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'row', gap: '100px' }}>
        <Box>
          <AvatarComponent
            sx={{ width: 80, height: 80, margin: '13px auto', cursor: 'pointer' }} 
            onClick={handleDialogOpen}
            aUrl={avatarUrl}
          />
          <Typography variant="h6" align="center" sx={{ color: 'black' }}>@{id}</Typography>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography variant="body1" gutterBottom sx={{ marginRight: '10px', color: 'black' }}>
            {posts.length}
          </Typography>
          <Typography variant="body1" gutterBottom sx={{ marginRight: '10px', color: 'black' }}>
            Értékelés
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography variant="body1" gutterBottom sx={{ marginRight: '10px', color: 'black' }}>
            {goals.length}
          </Typography>
          <Typography variant="body1" gutterBottom sx={{ marginRight: '10px', color: 'black' }}>
            Célok
          </Typography>
        </Box>
      </Box>
      <Tabs value={tabValue} onChange={handleTabChange} centered 
        sx={{ 
          marginBottom: '40px',
          '& .MuiTabs-indicator': {
            backgroundColor: '#794f29', 
          }
          }}>
        <Tab label="Könyv értékelések" 
          sx={{ 
            color:'#794f29', 
            '&.Mui-selected': {
              color: '#794f29',
            },
          }}
        />
        <Tab label="Célok" 
          sx={{ 
            color:'#794f29', 
            '&.Mui-selected': {
              color: '#794f29',
            },
          }}
        />
      </Tabs>
      {tabValue === 0 && (
        <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
          {postDatas.map((post, index) => {
            const postId = posts[index].id;

            return (
              <Paper sx={{ padding: 2, marginBottom: 2, width: '90%', maxWidth: '1500px', overflow: 'hidden', wordWrap: 'break-word', overflowWrap: 'break-word', wordBreak: 'break-all' }} key={postId}>
                <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>
                  <Typography variant="body1" gutterBottom sx={{ marginRight: 'auto' }}>
                    {post.book.volumeInfo.title}
                  </Typography>
                  <Typography variant="body1" gutterBottom sx={{ marginRight: '10px' }}>
                    Rating: 
                  </Typography>
                  <Rating name="read-only" value={post.rating} readOnly />
                  <IconButton onClick={() => {handleDeletePost(index, postId)}}>
                    <CloseIcon />
                  </IconButton>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'flex-start', width: '100%' }}>
                  <img
                      src={`${post.book.volumeInfo.imageLinks?.thumbnail.replace('http://', 'https://') || edition_placeholder}?w=248&fit=crop&auto=format`}
                      alt={post.book.volumeInfo.title}
                      loading="lazy"
                      style={{ width: '10%', height: 'auto' }}
                      id={`thumbnail-img-${postId}`}
                  />
                  <TextField 
                    fullWidth 
                    value={post.text}
                    disabled
                    multiline
                    InputProps={{
                      style: {
                        height: document.getElementById(`thumbnail-img-${postId}`)?.clientHeight || 'auto',
                      },
                    }}
                    sx={{
                      marginLeft: '10px',
                      alignItems: 'flex-start',
                      // Override the styles for the disabled state
                      '& .MuiInputBase-input.Mui-disabled': {
                        WebkitTextFillColor: 'black', // For webkit-based browsers
                        color: 'black', // For other browsers
                      },
                    }}
                  />
                </Box>
                <Typography variant="caption" color="textSecondary">
                  {dayjs(post.created_at.toDate()).format('YYYY.MM.DD - HH:mm:ss')}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', marginTop: 1 }}>
                  <IconButton onClick={() => post.likes.includes(currentUserId) ? handleDislike(index, post.likes, postId) : handleLike(index, post.likes, postId)}>
                    {post.likes.includes(currentUserId) ? <ThumbDownIcon /> : <ThumbUpIcon />}
                  </IconButton>
                  <Typography variant="body2">{post.likes.length} likes</Typography>
                </Box>
                <Divider sx={{ marginY: 2, borderColor: 'black' }} />
                <Typography variant="subtitle1">Comments</Typography>
                <Box sx={{ display: 'flex', marginTop: 1 }}>
                  <TextField
                    value={newComments[index]}
                    onChange={(e) => handleCommentChange(index, e.target.value)}
                    placeholder="Write a comment..."
                    variant="outlined"
                    size="small"
                    fullWidth
                    sx={{ marginRight: 1 }}
                    onKeyDown={(e) => handleKeyDown(e, index, post.comments, newComments[index], postId)}
                  />
                  <Button variant="contained" onClick={() => handleAddComment(index, post.comments, newComments[index], postId)}>
                    Add
                  </Button>
                </Box>
                <List sx={{ maxHeight: 200, overflowY: 'auto' }}>
                  {post.comments.map((comment, com_index) => (
                    <Box sx={{ marginBottom: '10px', backgroundColor: '#d0e7d0', borderRadius: '20px', display: 'flex', flexDirection: 'row' }} key={com_index}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', flexDirection: 'column', marginRight: 'auto' }}>
                        <Typography variant="body1" color="textSecondary" sx={{ paddingLeft: '15px' }}>
                          {comment.username}
                        </Typography>
                        <ListItem key={com_index} sx={{ wordWrap: 'break-word', overflowWrap: 'break-word', wordBreak: 'break-all', p: '0', paddingLeft: '15px' }}>
                          <ListItemText primary={comment.text} />
                        </ListItem>
                        <Typography variant="caption" color="textSecondary" sx={{ paddingLeft: '15px' }}>
                          {dayjs(comment.created_at.toDate()).format('YYYY.MM.DD - HH:mm:ss')}
                        </Typography>
                      </Box>
                      {<IconButton onClick={() => {handleDeleteComment(index, post.comments, postId, comment)}} sx={{ alignItems: 'start' }}>
                        <CloseIcon />
                      </IconButton>}
                    </Box>
                  ))}
                </List>
              </Paper>
            )
          })}
        </Box>
      )}

      {tabValue === 1 && (
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexDirection: 'column', width: '100%' }}>
          <Box sx={{ display: 'flex', width: '100%' }}>
            <Typography variant="h6" sx={{ 
              color: '#895737',
              fontWeight: '600',
              fontFamily: 'Times New Roman',  
              width: '49%',
              marginBottom: 2, // Opció: margó a célok oszlop és a cím között
              marginRight: 'auto'
            }}>
              Elkezdett célok
            </Typography>
            <Typography variant="h6" sx={{
                color: '#895737',
                fontWeight: '600',
                fontFamily: 'Times New Roman', 
                width: '49%', 
            }}>
              Befejezett célok
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', width: '100%' }}>
            {/* Elkezdett célok cím */}
            <Box sx={{ display: 'flex', flexDirection: 'column', width: '49%', maxWidth: '1500px', marginRight: 'auto', border: '1px solid', borderColor: 'grey', padding: 2 }}>
              {goalDatas.filter((goal) => !goal.is_done).map((goal, index) => {
                const goalId = goals[index].id;
              return (
              <Paper sx={{ padding: 2, marginBottom: 2, overflow: 'hidden', wordWrap: 'break-word', overflowWrap: 'break-word', wordBreak: 'break-all', backgroundColor: '#eae2ca' }} key={goalId}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                    <Typography variant="body1" sx={{ marginRight: 'auto', fontFamily: 'Times New Roman', fontWeight: '600', color: '#895737' }}>
                      Célnév: {goal.goal_name}
                    </Typography>
                    <Typography variant="body1" sx={{ marginRight: 'auto', fontFamily: 'Times New Roman', fontWeight: '600', color: '#895737' }}>
                      Elolvasandó könyvek száma: {goal.goal_amount}
                    </Typography>
                    <Divider sx={{ borderWidth: '1px', backgroundColor: '#895737', margin: '8px 0' }} variant='middle' />
                    <Button 
                      variant="contained" 
                      onClick={() => handleBookRead(goalId)} 
                      sx={{ backgroundColor: '#794f29', color: '#f5e6d3', marginBottom: '16px' }}
                    >
                      Könyv elolvasva
                    </Button>
                  </Box>
                  <IconButton onClick={() => handleDeleteGoal(index, goalId)} sx={{ marginLeft: 'auto' }}>
                    <CloseIcon />
                  </IconButton>
                </Box>
              </Paper>

              );
            })}
            </Box>

            {/* Completed Goals Column */}
            <Box sx={{ display: 'flex', flexDirection: 'column', width: '49%', maxWidth: '1500px', border: '1px solid', borderColor: 'grey', padding: 2 }}>
              {goalDatas.filter((goal) => goal.is_done).map((goal, index) => {
                const goalId = goals[index].id;
                return (
                  <Paper sx={{ padding: 2, marginBottom: 2, overflow: 'hidden', wordWrap: 'break-word', overflowWrap: 'break-word', wordBreak: 'break-all', backgroundColor: '#eae2ca' }} key={goalId}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="body1" sx={{ marginRight: 'auto', fontFamily: 'Times New Roman', fontWeight: '600', color: '#895737' }}>
                          Célnév: {goal.goal_name}
                        </Typography>
                        <Typography variant="body1" sx={{ marginRight: 'auto', fontFamily: 'Times New Roman', fontWeight: '600', color: '#895737' }}>
                          Elolvasott könyvek száma: {goal.goal_amount}
                        </Typography>
                        <Divider sx={{ borderWidth: '1px', backgroundColor :'#895737', marginBottom:'8px' }} variant='middle' />
                      </Box>
                      <IconButton onClick={() => handleDeleteGoal(index, goalId)} sx={{ marginLeft: 'auto' }}>
                        <CloseIcon />
                      </IconButton>
                    </Box>
                  </Paper>
                );
              })}
            </Box>
          </Box>
        </Box>
      )}

      {/* Dialog a képfeltöltéshez */}
      <Dialog open={dialogOpen} onClose={handleDialogClose}>
        <DialogTitle>Válassz egy lehetőséget</DialogTitle>
        <DialogActions>
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="upload-button"
            type="file"
            onChange={handleImageUpload}
          />
          <label htmlFor="upload-button">
            <Button component="span">Feltöltés</Button>
          </label>
          <Button 
            onClick={handleSaveImage} 
            disabled={!selectedImage}
          >
            Mentés
          </Button>
          <Button onClick={handleDialogClose}>Mégse</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserProfile;
