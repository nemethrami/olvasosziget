import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Dialog, DialogTitle, DialogActions, Button, IconButton, Divider, List, ListItemText, ListItem, TextField, Rating, Tabs, Tab, DialogContent } from '@mui/material';
import { getStorageRef, getDocRef, getAvatarUrlByUserName, getCollectionByID, postLike, postDislike, getCurrentUserName, postComment, postCommentDelete, deleteDocDataByID, updateGoalAttributes, addDataToCollectionWithAutoID } from '../services/FirebaseService';
import { getDownloadURL, uploadBytes } from 'firebase/storage';
import { DocumentData, onSnapshot, QueryDocumentSnapshot, Timestamp, updateDoc } from 'firebase/firestore';
import AvatarComponent from './AvatarComponent';
import { useParams } from 'react-router-dom';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import dayjs from 'dayjs';
import edition_placeholder from '../assets/edition_placeholder.png'
import { CommentModel } from '../models/ReviewModel';
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';
import CircularProgress, {
  CircularProgressProps,
} from '@mui/material/CircularProgress';
import { GoalModel } from '../models/GoalModel';

function CircularProgressWithLabel(
  props: CircularProgressProps & { value: number },
) {
  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      <CircularProgress variant="determinate" {...props} />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography
          variant="caption"
          component="div"
          sx={{ color: 'text.secondary' }}
        >{`${Math.round(props.value)}%`}</Typography>
      </Box>
    </Box>
  );
}

const UserProfile: React.FC = () => {
  const currentUserId: string | null = localStorage.getItem('uid');
  const { id } = useParams<{ id: string }>();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [tabValue, setTabValue] = React.useState(0);

  const [newComments, setNewComments] = useState<string[]>([]);
  const [posts, setPosts] = useState<QueryDocumentSnapshot<DocumentData, DocumentData>[] >([]);
  const [postDatas, setPostDatas] = useState<DocumentData[]>([]);

  const [doneGoalDatas, setDoneGoalDatas] = useState<DocumentData[]>([]);
  const [unDoneGoalDatas, setUnDoneGoalDatas] = useState<DocumentData[]>([]);
  const [doneGoals, setDoneGoals] = useState<DocumentData[]>([]);
  const [unDoneGoals, setUnDoneGoals] = useState<DocumentData[]>([]);
  const [targetDate, setTargetDate] = useState<string>('');
  const [newGoalName, setNewGoalName] = useState<string>('');
  const [bookGoal, setBookGoal] = useState<number>(0);

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
      const goals: QueryDocumentSnapshot<DocumentData, DocumentData>[] = filteredResult.sort((a, b) => b.data().created_at.toDate().getTime() - a.data().created_at.toDate().getTime())
      const goalDatas: DocumentData[] = data.sort((a, b) => b.created_at.toDate().getTime() - a.created_at.toDate().getTime())
      setDoneGoals(goals.filter((doc) => doc.data().is_done))
      setUnDoneGoals(goals.filter((doc) => !doc.data().is_done))
      setDoneGoalDatas(goalDatas.filter((doc) => doc.is_done))
      setUnDoneGoalDatas(goalDatas.filter((doc) => !doc.is_done))
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

  const handleGoalComplete = async (goalId: string) => {
    console.log(goalId)
    await updateGoalAttributes(goalId, {
      is_done: true
    })
  }

  const handleBookRead = async (goalId: string, idx: number) => {
    let comp_books: number = -1;
    let goal_am: number = -1;

    setUnDoneGoalDatas((prevItems) =>
      prevItems.map((item, index) => {
          comp_books = item.completed_books + 1;
          goal_am = item.goal_amount - 1;
          return index === idx ? { ...item, completed_books: comp_books, goal_amount: goal_am } : item
        }
      )
    );

    if (comp_books === -1 || goal_am === -1) return;

    await updateGoalAttributes(goalId, {
      completed_books: comp_books, 
      goal_amount: goal_am
    })
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

  const handleDeleteDoneGoal = async (idx: number, goalId: string) => {
    console.log(goalId)

    setDoneGoalDatas((prevItems) =>
      prevItems.filter((item, index) => index !== idx)
    );

    await deleteDocDataByID('goals', goalId);
  };

  const handleDeleteUnDoneGoal = async (idx: number, goalId: string) => {
    console.log(goalId)

    setUnDoneGoalDatas((prevItems) =>
      prevItems.filter((item, index) => index !== idx)
    );

    await deleteDocDataByID('goals', goalId);
  };

  const handleNewGoal = () => {
    setDialogOpen(true);
  };

  const addNewGoal = async () => {
    const currentUserName: string = await getCurrentUserName();

    const newGoal: GoalModel = {
      created_at: Timestamp.now(),
      created_uid: currentUserId,
      created_username: currentUserName,
      goal_amount: bookGoal,
      goal_name: newGoalName,
      completed_books: 0,
      is_done: false
    }

    await addDataToCollectionWithAutoID('goals', newGoal);

    handleDialogClose();
  }

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
            {doneGoals.length + unDoneGoals.length}
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
                    <DeleteForeverOutlinedIcon />
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
                        <DeleteForeverOutlinedIcon />
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
          <Box sx={{ display: 'flex', width: '100%' }} gap={5}>
            <Box sx={{ display: 'flex', justifyContent: 'center', width: '42%' }}>
              <Typography variant="h6" sx={{ 
                color: '#895737',
                fontWeight: '600',
                fontFamily: 'Times New Roman',  
                marginBottom: 1, // Opció: margó a célok oszlop és a cím között
                marginRight: '20px'
              }}>
                Elkezdett célok
              </Typography>
              <Button onClick={() => handleNewGoal()}
                sx={{ 
                  backgroundColor: '#eae2ca', 
                  color: '#895737',
                  fontWeight: '600',
                  height:'30px',
                  fontFamily: 'Times New Roman', 
                  borderRadius: '6px',
                  cursor: 'pointer',
                  border: 'none',
                  transition: 'background-color 0.8s ease', // Animáció a háttérszín változásához
                  '&:hover': {
                    backgroundColor: '#90784f', // Change background color on hover
                    color: '#f3e9dc',
                  }
                }}
                >
                + Új cél
              </Button>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'center', width: '42%' }}>
              <Typography variant="h6" sx={{
                  color: '#895737',
                  fontWeight: '600',
                  fontFamily: 'Times New Roman', 
              }}>
                Befejezett célok
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '100%' }} gap={5}>
            {/* Elkezdett célok cím */}
            <Box sx={{ display: 'flex', flexDirection: 'column', width: '42%', maxWidth: '1500px', border: '1px solid', borderColor: 'grey', padding: 2 }}>
              {unDoneGoalDatas.map((goal, index) => {
                const goalId = unDoneGoals[index].id;

                return (
                <Paper sx={{ padding: 2, marginBottom: 2, overflow: 'hidden', wordWrap: 'break-word', overflowWrap: 'break-word', wordBreak: 'break-all', backgroundColor: '#eae2ca' }} key={goalId}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                      <Box sx={{display:'flex', flexDirection:'row', width:'100%'}}>
                        <Box sx={{display:'flex', width:'50%', flexDirection:'column', marginRight:'auto',}}>
                          <Typography variant="body1" sx={{ marginRight: 'auto', fontFamily: 'Times New Roman', fontWeight: '600', color: '#895737' }}>
                            Célnév: {goal.goal_name}
                          </Typography>
                          <Typography variant="body1" sx={{ marginRight: 'auto', fontFamily: 'Times New Roman', fontWeight: '600', color: '#895737' }}>
                            Elolvasandó könyvek száma: {goal.goal_amount}
                          </Typography>
                          <Typography variant="body1" sx={{ marginRight: 'auto', fontFamily: 'Times New Roman', fontWeight: '600', color: '#895737' }}>
                            Elolvasott könyvek száma: {goal.completed_books}
                          </Typography>
                        </Box>
                        <Box sx={{display:'flex', width:'50%', justifyContent:'center', alignItems:'center'}}>
                          <CircularProgressWithLabel value={(goal.completed_books / (goal.goal_amount + goal.completed_books)) * 100} />
                        </Box>
                      </Box>
                      <Divider sx={{ borderWidth: '1px', backgroundColor: '#895737', margin: '8px 0' }} variant='middle' />
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, marginBottom: '16px' }}>
                        <Button 
                          variant="contained" 
                          onClick={() => handleBookRead(goalId, index)} 
                          sx={{ 
                            backgroundColor: '#eae2ca',  
                            color: '#895737', 
                            width:'190px', 
                            transition: 'background-color 0.8s ease', // Animáció a háttérszín változásához
                            '&:hover': {
                              backgroundColor: '#90784f', // Change background color on hover
                              color: '#f3e9dc',
                            } }}
                        >
                          + Könyv elolvasva
                        </Button>
                        <Button 
                          variant="contained" 
                          onClick={() => handleGoalComplete(goalId)} 
                          sx={{ 
                            backgroundColor: '#eae2ca',  
                            color: '#895737', 
                            width:'190px', 
                            transition: 'background-color 0.8s ease', // Animáció a háttérszín változásához
                            '&:hover': {
                              backgroundColor: '#90784f', // Change background color on hover
                              color: '#f3e9dc',
                            } }}
                          disabled={goal.goal_amount !== 0}
                        >
                          Cél befejezése
                        </Button>
                        <IconButton onClick={() => handleDeleteUnDoneGoal(index, goalId)} sx={{ marginRight:'10px' }}>
                          <DeleteForeverOutlinedIcon/>
                        </IconButton>
                      </Box>
                    </Box>

                  </Box>
                </Paper>

              );
            })}
            </Box>

            {/* Completed Goals Column */}
            <Box sx={{ display: 'flex', flexDirection: 'column', width: '42%', maxWidth: '1500px', border: '1px solid', borderColor: 'grey', padding: 2 }}>
              {doneGoalDatas.map((goal, index) => {
                const goalId = doneGoals[index].id;

                return (
                  <Paper sx={{ padding: 2, marginBottom: 2, overflow: 'hidden', wordWrap: 'break-word', overflowWrap: 'break-word', wordBreak: 'break-all', backgroundColor: '#eae2ca' }} key={goalId}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="body1" sx={{ marginRight: 'auto', fontFamily: 'Times New Roman', fontWeight: '600', color: '#895737' }}>
                          Célnév: {goal.goal_name}
                        </Typography>
                        <Typography variant="body1" sx={{ marginRight: 'auto', fontFamily: 'Times New Roman', fontWeight: '600', color: '#895737' }}>
                          Elolvasott könyvek száma: {goal.completed_books}
                        </Typography>
                        <Divider sx={{ borderWidth: '1px', backgroundColor :'#895737', marginBottom:'8px' }} variant='middle' />
                      </Box>
                      <IconButton onClick={() => handleDeleteDoneGoal(index, goalId)} sx={{ marginLeft: 'auto' }}>
                        <DeleteForeverOutlinedIcon />
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

      {/* Dialog a cél létrehozásához */}
      <Dialog open={dialogOpen} onClose={handleDialogClose}>
        <DialogTitle>Új olvasási cél létrehozása</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
            <TextField
              label="Nevezd el a célodat"
              type="text"
              value={newGoalName}
              onChange={(e) => setNewGoalName(e.target.value)}
              fullWidth
              sx={{ margin: '10px' }}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Cél dátuma"
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              fullWidth
              sx={{ margin: '10px' }}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Könyvek száma"
              type="number"
              value={bookGoal}
              onChange={(e) => setBookGoal(Number(e.target.value))}
              fullWidth
              sx={{ margin: '10px' }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Mégse</Button>
          <Button onClick={() => addNewGoal()}>Létrehozás</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserProfile;
