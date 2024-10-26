import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Dialog, DialogTitle, DialogActions, Button, IconButton, Divider, List, ListItemText, ListItem, TextField, Rating, Tabs, Tab } from '@mui/material';
import { getStorageRef, getDocRef, getAvatarUrlByUserName, getCollectionByID, getDocsByQuery } from '../services/FirebaseService';
import { getDownloadURL, uploadBytes } from 'firebase/storage';
import { CollectionReference, DocumentData, query, Query, QueryDocumentSnapshot, updateDoc, where } from 'firebase/firestore';
import AvatarComponent from './AvatarComponent';
import { useParams } from 'react-router-dom';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import dayjs from 'dayjs';
import edition_placeholder from '../assets/edition_placeholder.png'
import { CommentModel } from '../models/ReviewModel';


const UserProfile: React.FC = () => {
  const currentUserId: string | null = localStorage.getItem('uid');
  const { id } = useParams<{ id: string }>();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [tabValue, setTabValue] = React.useState(0);

  const [newComment, setNewComment] = useState('');
  const [posts, setPosts] = useState<QueryDocumentSnapshot<DocumentData, DocumentData>[] >([]);
  const [postDatas, setPostDatas] = useState<DocumentData[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      const currentUid: string | null = localStorage.getItem('uid')
      if (!id || !currentUid) return;

      const reviewsRef: CollectionReference<DocumentData, DocumentData> = getCollectionByID('reviews');
      const q: Query<DocumentData, DocumentData> = query(reviewsRef, where('created_uid', '==', currentUid))

      const querySnapshot: QueryDocumentSnapshot<DocumentData, DocumentData>[] = await getDocsByQuery(q);
      const data: DocumentData[] = querySnapshot.map(doc => doc.data());
      setPosts(querySnapshot.sort((a, b) => b.data().created_at.toDate().getTime() - a.data().created_at.toDate().getTime()));
      setPostDatas(data.sort((a, b) => b.created_at.toDate().getTime() - a.created_at.toDate().getTime()))
    }

    fetchPosts();
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

  const handleLike = (id: string, likes: string[]) => {
    if (!currentUserId) return;

    const newValue: string[] = [...likes, currentUserId];

    setPostDatas((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, likes: newValue } : item
      )
    );

    console.log(postDatas)
  };

  const handleAddComment = (postId: string, comments: CommentModel[], newComment: string) => {
    const newValue: CommentModel[] = [...comments, {username: id, text: newComment, created_at: new Date()}]

    setPostDatas((prevItems) =>
      prevItems.map((item) =>
        item.id === postId ? { ...item, comments: newValue } : item
      )
    );

    setNewComment('');
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>, id: string, comments: CommentModel[], newComment: string) => {
    if (event.key === 'Enter') {
      handleAddComment(id, comments, newComment);
    }
  };

  function handleTabChange(event: React.SyntheticEvent, newValue: number) {
    setTabValue(newValue);
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
            {0}
          </Typography>
          <Typography variant="body1" gutterBottom sx={{ marginRight: '10px', color: 'black' }}>
            Célok
          </Typography>
        </Box>
      </Box>
      <Tabs value={tabValue} onChange={handleTabChange} centered sx={{ marginBottom: '40px' }}>
        <Tab label="Könyv értékelések" />
        <Tab label="Célok" />
      </Tabs>
      {tabValue === 0 && (
        <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
          {postDatas.map((post, index) => {
            const postId = posts[index].id;

            return (
              <Paper sx={{ padding: 2, marginBottom: 2, width: '90%', maxWidth: '1500px', overflow: 'hidden', wordWrap: 'break-word', overflowWrap: 'break-word', wordBreak: 'break-all' }} key={postId}>
                <Box sx={{ display: 'flex', marginBottom: 2 }}>
                  <Typography variant="body1" gutterBottom sx={{ marginRight: 'auto' }}>
                    {post.book.volumeInfo.title}
                  </Typography>
                  <Typography variant="body1" gutterBottom sx={{ marginRight: '10px' }}>
                    Rating: 
                  </Typography>
                  <Rating name="read-only" value={post.rating} readOnly />
                  
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
                  <IconButton onClick={() => handleLike(postId, post.likes)}>
                    <ThumbUpIcon />
                  </IconButton>
                  <Typography variant="body2">{post.likes.length} likes</Typography>
                </Box>
                <Divider sx={{ marginY: 2, borderColor: 'black' }} />
                <Typography variant="subtitle1">Comments</Typography>
                <Box sx={{ display: 'flex', marginTop: 1 }}>
                  <TextField
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    variant="outlined"
                    size="small"
                    fullWidth
                    sx={{ marginRight: 1 }}
                    onKeyDown={(e) => handleKeyDown(e, postId, post.comments, newComment)}
                  />
                  <Button variant="contained" onClick={() => handleAddComment(postId, post.comments, newComment)}>
                    Add
                  </Button>
                </Box>
                <List sx={{ maxHeight: 200, overflowY: 'auto' }}>
                  {post.comments.map((comment, index) => (
                    <Box sx={{ marginBottom: '10px', backgroundColor: '#d0e7d0', borderRadius: '20px' }}>
                      <Typography variant="body1" color="textSecondary" sx={{ paddingLeft: '10px' }}>
                        {comment.username}
                      </Typography>
                      <ListItem key={index} sx={{ wordWrap: 'break-word', overflowWrap: 'break-word', wordBreak: 'break-all', p: '0', paddingLeft: '10px' }}>
                        <ListItemText primary={comment.text} />
                      </ListItem>
                      <Typography variant="caption" color="textSecondary" sx={{ paddingLeft: '10px' }}>
                        {dayjs(comment.created_at).format('YYYY.MM.DD - HH:mm:ss')}
                      </Typography>
                    </Box>
                  ))}
                </List>
              </Paper>
            )
          })}
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
