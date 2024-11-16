import React, { useState, useEffect } from 'react';
import { Box, Checkbox, Typography, Paper, Dialog, DialogTitle, DialogActions, Button, IconButton, Divider, List, ListItemText, ListItem, TextField, Rating, Tabs, Tab, DialogContent, Autocomplete, ListItemAvatar, Avatar, Stack, RadioGroup, Radio, FormControlLabel } from '@mui/material';
import { getStorageRef, getDocRef, getAvatarUrlByUserName, getCollectionByID, postLike, postDislike, getCurrentUserName, postComment, postCommentDelete, deleteDocDataByID, updateGoalAttributes, addDataToCollectionWithAutoID, isUserAdmin, getUidByUserName } from '../services/FirebaseService';
import { getDownloadURL, uploadBytes } from 'firebase/storage';
import { DocumentData, onSnapshot, QueryDocumentSnapshot, Timestamp, updateDoc } from 'firebase/firestore';
import AvatarComponent from './AvatarComponent';
import { useParams } from 'react-router-dom';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import DeleteIcon from '@mui/icons-material/Delete';
import dayjs from 'dayjs';
import edition_placeholder from '../assets/edition_placeholder.png'
import { CommentModel } from '../models/ReviewModel';
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';
import CircularProgress, {
  CircularProgressProps,
} from '@mui/material/CircularProgress';
import { GoalBooksModel, GoalModel } from '../models/GoalModel';
import { BookModel } from '../models/BookModel';
import axios from 'axios';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import { ReportModel } from '../models/ReportModel';

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
  const API_KEY = 'AIzaSyCZ0PamLM1OwHLSQ-qNab8hUhHGjGr0Bjs';
  const currentUserId: string | null = localStorage.getItem('uid');
  const { id } = useParams<{ id: string }>();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogGoalOpen, setGoalDialogOpen] = useState(false);
  const [openSelectedDialog, setOpenSelectedDialog] = useState(false);
  const [openReportDialog, setOpenReportDialog] = useState(false);
  const [openReportReviewDialog, setOpenReportReviewDialog] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [tabValue, setTabValue] = React.useState(0);

  const [newComments, setNewComments] = useState<string[]>([]);
  const [posts, setPosts] = useState<QueryDocumentSnapshot<DocumentData, DocumentData>[] >([]);
  const [postDatas, setPostDatas] = useState<DocumentData[]>([]);

  const [doneGoalDatas, setDoneGoalDatas] = useState<DocumentData[]>([]);
  const [unDoneGoalDatas, setUnDoneGoalDatas] = useState<DocumentData[]>([]);
  const [expiredGoalDatas, setExpiredGoalDatas] = useState<DocumentData[]>([]);
  const [doneGoals, setDoneGoals] = useState<DocumentData[]>([]);
  const [unDoneGoals, setUnDoneGoals] = useState<DocumentData[]>([]);
  const [expiredGoals, setExpiredGoals] = useState<DocumentData[]>([]);
  const [targetDate, setTargetDate] = useState<string>('');
  const [newGoalName, setNewGoalName] = useState<string>('');
  const [selectedBooks, setSelectedBooks] = useState<BookModel[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [options, setOptions] = useState<BookModel[]>([]);
  const [currentGoal, setCurrentGoal] = useState<DocumentData | null>(null);
  const [currentGoalId, setCurrentGoalId] = useState<string>('');
  const [currentPostId, setCurrentPostId] = useState<string | null>(null);
  const [currentComment, setCurrentComment] = useState<CommentModel | null>(null);
  const [isReview, setIsReview] = useState<boolean>(false);

  const [reportReason, setReportReason] = useState<'spam' | 'offensive' | 'risk' | 'behaviour' | 'other'>('behaviour');
 
  const [isAdmin, setIsAdmin] = React.useState<boolean>(false);
  const [currentUserName, setCurrentUserName] = React.useState<string>('');
  const [textInput, setTextInput] = useState('');
  const [error, setError] = useState(false);

  React.useEffect(() => {
    const fetchIsAdmin = async () => {
      const admin: boolean = await isUserAdmin();
      const uName: string = await getCurrentUserName();
      //const userName: string = await Promise.resolve('test_user_name');
      setIsAdmin(admin);
      setCurrentUserName(uName);
    }

    fetchIsAdmin();
  }, []);

  // Fetch books from Google Books API
  const fetchBooks = async (query: string) => {
    try {
      const response = await axios.get('https://www.googleapis.com/books/v1/volumes', {
        params: {
          q: query,
          key: API_KEY,
          maxResults: 10,
        },
      });

      setOptions(response.data.items || []);
      console.log(options)
    } catch (error) {
      console.error("Error fetching data from Google Books API", error);
    }
  };

  function handleOptionClick(event: React.ChangeEvent<HTMLInputElement>, selectedBook: BookModel | null) {
    if (!selectedBook) return;

    console.log(selectedBooks)
    setSelectedBooks((prevList) => {
      const exists = prevList.some(item => item.id === selectedBook.id);
      return exists ? prevList : [...prevList, selectedBook];
    });
    setSearchQuery('');
  }

  function deleteListItem(id: string) {
    setSelectedBooks((prevItems) => prevItems.filter(item => item.id !== id));
  }

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
      const now = new Date();
      const filteredResult = querySnapshot.docs.filter(doc => doc.data().created_username === id);
      const data: DocumentData[] = filteredResult.map(doc => doc.data());
      const goals: QueryDocumentSnapshot<DocumentData, DocumentData>[] = filteredResult.sort((a, b) => b.data().created_at.toDate().getTime() - a.data().created_at.toDate().getTime())
      const goalDatas: DocumentData[] = data.sort((a, b) => b.created_at.toDate().getTime() - a.created_at.toDate().getTime())
      setDoneGoals(goals.filter((doc) => doc.data().is_done))
      setUnDoneGoals(goals.filter((doc) => !doc.data().is_done && doc.data().target_date.toDate() >= now))
      setDoneGoalDatas(goalDatas.filter((doc) => doc.is_done))
      setUnDoneGoalDatas(goalDatas.filter((doc) => !doc.is_done &&  doc.target_date.toDate() >= now))
      setExpiredGoals(goals.filter((doc) => doc.data().target_date.toDate() < now))
      setExpiredGoalDatas(goalDatas.filter((doc) => doc.target_date.toDate() < now))
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

  const handleGoalDialogClose = () => {
    setGoalDialogOpen(false);
  };

  const handleSelectedCloseDialog = () => {
    setOpenSelectedDialog(false);
  };

  const handleReportCloseDialog = () => {
    setOpenReportDialog(false);
  };

  const sendReport = async () => {
    const uidOfProfile: string = await getUidByUserName(id);
    if (!currentUserId && !uidOfProfile) return;

    if (textInput.trim() === '') {
      setError(true);
      return;
    }

    const reportObj: ReportModel = {
      created_uid: currentUserId,
      created_at: Timestamp.now(),
      content_type: 'user',
      reason: reportReason,
      explanation: textInput,
      reported_content: uidOfProfile,
    }

    await addDataToCollectionWithAutoID('reports', reportObj);
    handleReportCloseDialog();
    setTextInput('');
  }

  function handleReportReviewCloseDialog() {
    setOpenReportReviewDialog(false);
  }

  function handleReviewOpenDialog(postId: string, content_type: string, comment: CommentModel | null = null) {
    setOpenReportReviewDialog(true);
    setCurrentPostId(postId)
    setIsReview(content_type === 'review' ? true : false)
    if (comment) {
      setCurrentComment(comment);
    }
  }

  async function sendReportReview() {
    if (!currentUserId || !currentPostId) return;

    if (textInput.trim() === '') {
      setError(true);
      return;
    }

    const reportObj: ReportModel = {
      created_uid: currentUserId,
      created_at: Timestamp.now(),
      content_type: 'review',
      reason: reportReason,
      explanation: textInput,
      reported_content: currentPostId,
    };

    if (!isReview) {
      reportObj['content_type'] = 'comment';
      reportObj['comment'] = {
        created_at: currentComment.created_at,
        text: currentComment.text,
        username: currentComment.username,
      };
    }

    await addDataToCollectionWithAutoID('reports', reportObj);
    handleReportReviewCloseDialog();
    setTextInput('');
  }

  const handleSelectedOpenDialog = (goal: DocumentData, goalId: string) => {
    setOpenSelectedDialog(true);
    setCurrentGoal(goal);
    setCurrentGoalId(goalId);
  };

  const handleGoalComplete = async (goalId: string) => {
    await updateGoalAttributes(goalId, {
      is_done: true
    })
  }

  const handleBookRead = async () => {
    if (currentGoal.goal_amount < 0) return;

    const { trueCount, falseCount } = currentGoal.books_to_read.reduce(
      (acc: {trueCount: number; falseCount: number}, item: GoalBooksModel) => {
        if (item.is_checked) {
          acc.trueCount += 1;
        } else {
          acc.falseCount += 1;
        }
        return acc;
      },
      { trueCount: 0, falseCount: 0 }
    );

    await updateGoalAttributes(currentGoalId, {
      completed_books: trueCount, 
      goal_amount: falseCount
    });

    handleSelectedCloseDialog();
  };

  const handleBookReadSelect = async (event: React.ChangeEvent<HTMLInputElement>, goalBook: GoalBooksModel) => {
    setCurrentGoal((prevState) => ({
      ...prevState,
      books_to_read: prevState.books_to_read.map((item: GoalBooksModel) =>
        item.book === goalBook.book ? { ...item, is_checked: event.target.checked } : item
      )
    }));

    const otherBooks: GoalBooksModel[] = currentGoal.books_to_read.filter((item: GoalBooksModel) => item.book !== goalBook.book);

    await updateGoalAttributes(currentGoalId, {
      books_to_read: [...otherBooks, {book: goalBook.book, is_checked: event.target.checked}]
    });
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
    setDoneGoalDatas((prevItems) =>
      prevItems.filter((item, index) => index !== idx)
    );

    await deleteDocDataByID('goals', goalId);
  };

  const handleDeleteUnDoneGoal = async (idx: number, goalId: string) => {
    setUnDoneGoalDatas((prevItems) =>
      prevItems.filter((item, index) => index !== idx)
    );

    await deleteDocDataByID('goals', goalId);
  };

  const handleDeleteExpiredGoal = async (idx: number, goalId: string) => {
    setExpiredGoalDatas((prevItems) =>
      prevItems.filter((item, index) => index !== idx)
    );

    await deleteDocDataByID('goals', goalId);
  };

  const handleNewGoal = () => {
    setGoalDialogOpen(true);
  };

  const addNewGoal = async () => {
    const dateObject = new Date(targetDate);
    const booksToRead: GoalBooksModel[] = selectedBooks.map((book: BookModel) => ({
      book: book,
      is_checked: false
    }));

    const newGoal: GoalModel = {
      created_at: Timestamp.now(),
      created_uid: currentUserId,
      created_username: currentUserName,
      goal_amount: selectedBooks.length,
      goal_name: newGoalName,
      completed_books: 0,
      is_done: false,
      target_date: Timestamp.fromDate(dateObject),
      books_to_read: booksToRead
    }

    await addDataToCollectionWithAutoID('goals', newGoal);

    handleGoalDialogClose();
    setNewGoalName('');
    setTargetDate('');
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ marginBottom: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'row', gap: '100px' }}>
      <Box>
          <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
            <AvatarComponent
              sx={{ width: 80, height: 80, cursor: 'pointer' }}
              onClick={handleDialogOpen}
              aUrl={avatarUrl}
            />
            <Typography variant="h6" sx={{ color: 'black' }}>@{id}</Typography>
            <IconButton onClick={() => setOpenReportDialog(true)}>
              <FlagOutlinedIcon sx={{color: 'black'}}/>
            </IconButton>
          </Stack>
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
              <Paper 
                sx={{ padding: 2, marginBottom: 2, width: '90%', maxWidth: '1500px', overflow: 'hidden', wordWrap: 'break-word', overflowWrap: 'break-word', wordBreak: 'break-all' }} 
                key={postId}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>
                  <Typography variant="body1" gutterBottom sx={{ marginRight: 'auto' }}>
                    {post.book.volumeInfo.title}
                  </Typography>
                  {(isAdmin || currentUserId === post.created_uid) && (
                    <IconButton onClick={() => {handleDeletePost(index, postId)}} sx={{ alignItems: 'start' }}>
                      <DeleteForeverOutlinedIcon />
                    </IconButton>
                  )}
                  <IconButton onClick={() => handleReviewOpenDialog(postId, 'review')}>
                    <FlagOutlinedIcon sx={{color: 'black'}}/>
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
                  <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                    <TextField 
                      fullWidth 
                      value={post.text}
                      disabled
                      multiline
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
                    <Box sx={{ display: 'flex', flexDirection: 'row', width: '100%', marginLeft: '10px', marginTop: '5px' }}>
                      <Typography variant="body1" gutterBottom sx={{ marginRight: '10px' }}>
                        Rating: 
                      </Typography>
                      <Rating name="read-only" value={post.rating} readOnly />
                    </Box>
                  </Box>
                </Box>
                <Typography variant="caption" color="textSecondary">
                  {dayjs(post.created_at.toDate()).format('YYYY.MM.DD - HH:mm:ss')}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', marginTop: 1 }}>
                  <IconButton 
                    onClick={() => post.likes.includes(currentUserId) ? handleDislike(index, post.likes, postId) : handleLike(index, post.likes, postId)}
                    sx={{ color: post.likes.includes(currentUserId) ? 'blue' : 'grey' }}
                  >
                    <ThumbUpIcon />
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
                      {(isAdmin || currentUserName === comment.username) && (
                        <IconButton onClick={() => handleDeleteComment(index, post.comments, postId, comment)} sx={{ alignItems: 'center' }}>
                          <DeleteForeverOutlinedIcon />
                        </IconButton>
                      )}
                      <IconButton onClick={() => handleReviewOpenDialog(postId, 'comment', comment)}>
                        <FlagOutlinedIcon sx={{color: 'black'}}/>
                      </IconButton>
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
            <Box sx={{ display: 'flex', justifyContent: 'center', width: '33%' }}>
              <Typography variant="h6" sx={{ 
                color: '#895737',
                fontWeight: '600',
                fontFamily: 'Times New Roman',  
                marginBottom: 1, // Opció: margó a célok oszlop és a cím között
                marginRight: '15px'
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
            <Box sx={{ display: 'flex', justifyContent: 'center', width: '33%' }}>
            <Typography variant="h6" sx={{ 
                color: '#895737',
                fontWeight: '600',
                fontFamily: 'Times New Roman',  
                marginBottom: 1, // Opció: margó a célok oszlop és a cím között
                marginRight: '15px'
              }}>
                Befejezett célok
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'center', width: '33%' }}>
            <Typography variant="h6" sx={{ 
                color: '#895737',
                fontWeight: '600',
                fontFamily: 'Times New Roman',  
                marginBottom: 1, // Opció: margó a célok oszlop és a cím között
                marginRight: '15px'
              }}>
                Elbukott célok
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '100%' }} gap={3}>
            {/* Elkezdett célok cím */}
            <Box sx={{ display: 'flex', flexDirection: 'column', width: '33%', maxWidth: '1500px', border: '1px solid', borderColor: 'grey', padding: 2 }}>
              {unDoneGoalDatas.map((goal, index) => {
                const goalId = unDoneGoals[index].id;

                return (
                <Paper sx={{ padding: 2, width:'100%', marginBottom: 2, overflow: 'hidden', wordWrap: 'break-word', overflowWrap: 'break-word', wordBreak: 'break-all', backgroundColor: '#eae2ca' }} key={goalId}>
                  <Box sx={{ display: 'flex', flexDirection:'column', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                      <Box sx={{display:'flex', flexDirection:'row', width:'100%'}}>
                        <Box sx={{display:'flex', width:'50%', flexDirection:'column', marginRight:'auto',}}>
                          <Typography variant="body1" sx={{ marginRight: 'auto', fontFamily: 'Times New Roman', fontWeight: '600', color: '#895737', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                            Célnév: {goal.goal_name}
                          </Typography>
                          <Typography variant="body1" sx={{ marginRight: 'auto', fontFamily: 'Times New Roman', fontWeight: '600', color: '#895737', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                            Elolvasandó könyvek száma: {goal.goal_amount}
                          </Typography>
                          <Typography variant="body1" sx={{ marginRight: 'auto', fontFamily: 'Times New Roman', fontWeight: '600', color: '#895737', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                            Elolvasott könyvek száma: {goal.completed_books}
                          </Typography>
                        </Box>
                        <Box sx={{display:'flex', justifyContent:'flex-end', alignItems:'center'}}>
                          <CircularProgressWithLabel value={(goal.completed_books / (goal.goal_amount + goal.completed_books)) * 100} />
                        </Box>
                      </Box>
                      <Divider sx={{ borderWidth: '1px', backgroundColor: '#895737', margin: '8px 0' }} variant='middle' />
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, marginBottom: '16px', width: '100%' }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}> {/* Új oszlopirányú box a gombokhoz */}
                          <Button 
                            variant="contained" 
                            onClick={() => handleSelectedOpenDialog(goal, goalId)} 
                            sx={{ 
                              backgroundColor: '#eae2ca',  
                              color: '#895737', 
                              width: '95%',  // Gomb szélessége kitölti az oszlopot
                              height: '35px',
                              transition: 'background-color 0.8s ease',
                              '&:hover': {
                                backgroundColor: '#90784f',
                                color: '#f3e9dc',
                              }
                            }}
                          >
                            + Könyv elolvasva
                          </Button>
                          <Button 
                            variant="contained" 
                            onClick={() => handleGoalComplete(goalId)} 
                            sx={{ 
                              backgroundColor: '#eae2ca',  
                              color: '#895737', 
                              width: '95%',  // Gomb szélessége kitölti az oszlopot
                              height: '35px',
                              transition: 'background-color 0.8s ease',
                              '&:hover': {
                                backgroundColor: '#90784f',
                                color: '#f3e9dc',
                              }
                            }}
                            disabled={goal.goal_amount !== 0}
                          >
                            Cél befejezése
                          </Button>
                        </Box>
                        {(isAdmin || currentUserName === goal.created_username) && (
                          <IconButton onClick={() => handleDeleteUnDoneGoal(index, goalId)}>
                            <DeleteForeverOutlinedIcon />
                          </IconButton>
                        )}
                      </Box>
                  </Box>
                </Paper>

              );
            })}
            </Box>

            {/* Completed Goals Column */}
            <Box sx={{ display: 'flex', flexDirection: 'column', width: '33%', maxWidth: '1500px', border: '1px solid', borderColor: 'grey', padding: 2 }}>
              {doneGoalDatas.map((goal, index) => {
                const goalId = doneGoals[index].id;

                return (
                  <Paper sx={{ padding: 2, width:'100%', marginBottom: 2, overflow: 'hidden', wordWrap: 'break-word', overflowWrap: 'break-word', wordBreak: 'break-all', backgroundColor: '#eae2ca' }} key={goalId}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="body1" sx={{ marginRight: 'auto', fontFamily: 'Times New Roman', fontWeight: '600', color: '#895737' }}>
                          Célnév: {goal.goal_name}
                        </Typography>
                        <Typography variant="body1" sx={{ marginRight: 'auto', fontFamily: 'Times New Roman', fontWeight: '600', color: '#895737' }}>
                          Elolvasott könyvek száma: {goal.completed_books}
                        </Typography>
                      </Box>
                      {(isAdmin || currentUserName === goal.created_username) && (
                        <IconButton onClick={() => handleDeleteDoneGoal(index, goalId)} sx={{ marginLeft: 'auto' }}>
                          <DeleteForeverOutlinedIcon />
                        </IconButton>
                      )}
                    </Box>
                  </Paper>
                );
              })}
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', width: '33%', maxWidth: '1500px', border: '1px solid', borderColor: 'grey', padding: 2 }}>
              {expiredGoalDatas.map((goal, index) => {
                const goalId = expiredGoals[index].id;

                return (
                  <Paper sx={{ padding: 2, width:'100%', marginBottom: 2, overflow: 'hidden', wordWrap: 'break-word', overflowWrap: 'break-word', wordBreak: 'break-all', backgroundColor: '#eae2ca' }} key={goalId}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="body1" sx={{ marginRight: 'auto', fontFamily: 'Times New Roman', fontWeight: '600', color: '#895737' }}>
                          Célnév: {goal.goal_name}
                        </Typography>
                        <Typography variant="body1" sx={{ marginRight: 'auto', fontFamily: 'Times New Roman', fontWeight: '600', color: '#895737' }}>
                          Elolvasott könyvek száma: {goal.completed_books}
                        </Typography>
                      </Box>
                      {(isAdmin || currentUserName === goal.created_username) && (
                        <IconButton onClick={() => handleDeleteExpiredGoal(index, goalId)} sx={{ marginLeft: 'auto' }}>
                          <DeleteForeverOutlinedIcon />
                        </IconButton>
                      )}
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
      <Dialog open={dialogGoalOpen} onClose={() => setGoalDialogOpen(false)}>
      <DialogTitle>Új olvasási cél létrehozása</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <TextField
              label="Nevezd el a célodat"
              value={newGoalName}
              onChange={(e) => setNewGoalName(e.target.value)}
              fullWidth
              sx={{ margin: '10px' }}
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
            <Autocomplete
              options={options}
              getOptionLabel={(option) => `${option.volumeInfo.authors}: ${option.volumeInfo.title}`}
              inputValue={searchQuery}
              onInputChange={(event, newInputValue) => {
                setSearchQuery(newInputValue);
                if (newInputValue) {
                  fetchBooks(newInputValue);
                } else {
                  setOptions([]); // Clear options if the input is empty
                }
              }}
              renderInput={(params) => (
                <TextField {...params} label="Search for books" variant="outlined" />
              )}
              renderOption={(props, option) => (
                <li {...props} key={option.id}> {/* Use a unique key here */}
                  {`${option.volumeInfo.authors}: ${option.volumeInfo.title}`}
                </li>
              )}
              open={searchQuery !== '' && options.length > 0} // Only open if there are results and input is not empty
              onChange={handleOptionClick}
              sx={{}}
              fullWidth
            />
            <List dense={false}>
              {selectedBooks.map((item) => (
                <ListItem 
                  key={item.id}
                  secondaryAction={
                    <IconButton edge="end" aria-label="delete" onClick={() => deleteListItem(item.id)}>
                      <DeleteIcon />
                    </IconButton>
                  }
                >
                  <ListItemAvatar>
                    <Avatar>
                      <img 
                        src={item.volumeInfo.imageLinks?.thumbnail.replace('http://', 'https://') || edition_placeholder} 
                        alt="Book thumbnail"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }} 
                      />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={`${item.volumeInfo.authors}: ${item.volumeInfo.title}`}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGoalDialogOpen(false)}>Mégse</Button>
          <Button onClick={addNewGoal}>Létrehozás</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog megjelenítése a `books_to_read` listával */}
      <Dialog open={openSelectedDialog} onClose={handleSelectedCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Elolvasandó Könyvek</DialogTitle>
        <DialogContent>
          <List>
            {currentGoal && currentGoal.books_to_read.map((goalBook: GoalBooksModel) => (
              <ListItem key={goalBook.book.id}>
                <Checkbox
                  checked={goalBook.is_checked}
                  onChange={(e) => handleBookReadSelect(e, goalBook)}
                />
                <ListItemAvatar>
                    <Avatar>
                      <img 
                        src={goalBook.book.volumeInfo.imageLinks?.thumbnail.replace('http://', 'https://') || edition_placeholder} 
                        alt="Book thumbnail"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }} 
                      />
                    </Avatar>
                  </ListItemAvatar>
                <ListItemText primary={`${goalBook.book.volumeInfo.authors}: ${goalBook.book.volumeInfo.title}`} />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSelectedCloseDialog} color="primary">
            Bezár
          </Button>
          <Button onClick={handleBookRead} color="primary">
            Mentés
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openReportDialog} onClose={handleReportCloseDialog }>
        <DialogTitle>Válaszd ki a jelentés okát:</DialogTitle>
        <DialogContent>
          <RadioGroup
            aria-labelledby="demo-radio-buttons-group-label"
            defaultValue="behaviour"
            name="radio-buttons-group"
          >
            <FormControlLabel value='behaviour' control={<Radio onClick={() => setReportReason('behaviour')} />} label="Nem megfelelő viselkedés a közösségben." />
            <FormControlLabel value='spam' control={<Radio onClick={() => setReportReason('spam')} />} label="Tiltott tevékenység/Spam." />
            <FormControlLabel value='offensive' control={<Radio onClick={() => setReportReason('offensive')} />} label="Sértő tartalom vagy tevékenység." />
            <FormControlLabel value='risk' control={<Radio onClick={() => setReportReason('risk')} />} label="Biztonsági kockázatok vagy visszaélések." />
            <FormControlLabel value='other' control={<Radio onClick={() => setReportReason('other')} />} label="Egyéb:" />
          </RadioGroup>
          <TextField 
            label='Indoklás'
            value={textInput}
            onChange={(event) => setTextInput(event.target.value)}
            error={error && textInput.trim() === ''}
            helperText={error && textInput.trim() === '' ? 'Ez a mező kötelező' : ''}
          >
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleReportCloseDialog}>Mégse</Button>
          <Button onClick={sendReport}>Jelentés</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openReportReviewDialog} onClose={handleReportReviewCloseDialog}>
        <DialogTitle>Válaszd ki a jelentés okát:</DialogTitle>
        <DialogContent>
          <RadioGroup
            aria-labelledby="demo-radio-buttons-group-label"
            defaultValue="behaviour"
            name="radio-buttons-group"
          >
            <FormControlLabel value='behaviour' control={<Radio onClick={() => setReportReason('behaviour')} />} label="Nem megfelelő viselkedés a közösségben." />
            <FormControlLabel value='spam' control={<Radio onClick={() => setReportReason('spam')} />} label="Tiltott tevékenység/Spam." />
            <FormControlLabel value='offensive' control={<Radio onClick={() => setReportReason('offensive')} />} label="Sértő tartalom vagy tevékenység." />
            <FormControlLabel value='risk' control={<Radio onClick={() => setReportReason('risk')} />} label="Biztonsági kockázatok vagy visszaélések." />
            <FormControlLabel value='other' control={<Radio onClick={() => setReportReason('other')} />} label="Egyéb:" />
          </RadioGroup>
          <TextField 
            label='Indoklás'
            value={textInput}
            onChange={(event) => setTextInput(event.target.value)}
            error={error && textInput.trim() === ''}
            helperText={error && textInput.trim() === '' ? 'Ez a mező kötelező' : ''}
          >
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleReportReviewCloseDialog}>Mégse</Button>
          <Button onClick={sendReportReview}>Jelentés</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserProfile;
