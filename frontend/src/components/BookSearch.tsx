import axios from 'axios';
import { useState, useRef, useEffect } from 'react';
import { BookModel } from '../models/BookModel';
import edition_placeholder from '../assets/edition_placeholder.png'
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import ImageListItemBar from '@mui/material/ImageListItemBar';
import IconButton from '@mui/material/IconButton';
import InfoIcon from '@mui/icons-material/Info';
import "./BookSearch.css";
import InputBase from '@mui/material/InputBase';
import SearchIcon from '@mui/icons-material/Search';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Rating, TextField, Typography } from '@mui/material';
import { addDataToCollectionWithAutoID, getCollectionByID, getCollectionDataByID, getCurrentUserName, getDocsByQuery } from '../services/FirebaseService';
import { CollectionReference, DocumentData, query, Query, QueryDocumentSnapshot, QuerySnapshot, Timestamp, where } from 'firebase/firestore';
import { ReviewModel } from '../models/ReviewModel';


function BookSearch() {
    const [book, setBook] = useState<string>('');
    const [review, setReview] = useState<string>('');
    const [currentBook, setCurrentBook] = useState<BookModel | null>(null);
    const [currentUsername, setCurrentUsername] = useState<string>('');
    const [ratingValue, setRatingValue] = useState<number>(0);
    const [avgRating, setAvgRating] = useState<number>(0.0);
    const [books, setBooks] = useState<BookModel[]>([]);
    const [isNewReview, setIsNewReview] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [errorDialog, setErrorDialog] = useState<string | null>(null);
    const linkRef = useRef<HTMLAnchorElement>(null);
    const [openReviewDialog, setOpenReviewDialog] = useState<boolean>(false);
    const API_KEY = 'AIzaSyCZ0PamLM1OwHLSQ-qNab8hUhHGjGr0Bjs';
    //const API_KEY = process.env.REACT_APP_GOOGLE_BOOKS_API_KEY;
    const cols: number = 4;

    const fetchPosts = async () => {
        const currentUid: string | null = localStorage.getItem('uid')
        if (!currentUid) return;

        const reviewsRef: CollectionReference<DocumentData, DocumentData> = getCollectionByID('reviews');
        const q: Query<DocumentData, DocumentData> = query(reviewsRef, where('created_uid', '==', currentUid))
  
        const querySnapshot: QueryDocumentSnapshot<DocumentData, DocumentData>[] = await getDocsByQuery(q);
        const datas: BookModel[] = querySnapshot.map(doc => doc.data().book)
        const uniqueItems = datas.filter((item, index, self) =>
          index === self.findIndex((t) => t.id === item.id)
        );
        setBooks(uniqueItems);
        setCurrentUsername(await getCurrentUserName());
    }

    useEffect(() => {
        if (!localStorage.getItem('uid')) return;
        fetchPosts();
    }, []);

    const fetchBooks = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();

        if (!book.trim()) {
            // Do not proceed if the search query is an empty string
            fetchPosts();
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await axios.get(
                'https://www.googleapis.com/books/v1/volumes',
                {
                    params: {
                        q: book,
                        key: API_KEY,
                        maxResults: 40,
                    },
                }
            );

            setBooks(response.data.items || []);
        } catch (err) {
            setError(err.response?.data?.error?.message || 'Failed to fetch books');
        } finally {
            setLoading(false);
        }
    };

    function openNewWindow(previewLink: string) {
        window.open(previewLink, '_blank');
    }

    async function openAddReviewDialog(book: BookModel) {
        if (!localStorage.getItem('uid')) return;

        setCurrentBook(book);

        try {
            await getAverageRatingForBook(book.volumeInfo.title);
        } catch (error) {
            setErrorDialog(error);
        }

        setOpenReviewDialog(true);
    }

    function handleCloseAddReviewDialog() {
        setOpenReviewDialog(false);
        setRatingValue(0);
        setReview('');
        setIsNewReview(false);
    }

    async function getAverageRatingForBook(title: string) {
        function getAverage(numbers: number[]): number {
            if (numbers.length === 0) return 0.0; // Handle case when the array is empty
          
            const total = numbers.reduce((sum, num) => sum + num, 0);
            return total / numbers.length;
        }

        const reviews: QuerySnapshot<DocumentData, DocumentData> = await getCollectionDataByID('reviews');
        const ratings: number[] = reviews.docs.filter(doc => doc.data().book.volumeInfo.title === title).map(doc => doc.data().rating);
        setAvgRating(parseFloat(getAverage(ratings).toFixed(1)));
        setRatingValue(parseFloat(getAverage(ratings).toFixed(1)));
    }

    async function handleAddReview() {
        const currentUid: string | null = localStorage.getItem('uid')

        if (!currentUid) return;
        
        const newData: ReviewModel = {
            book: currentBook,
            created_uid: currentUid,
            created_username: currentUsername,
            created_at: Timestamp.now(),
            comments: [],
            likes: [],
            rating: ratingValue,
            text: review,
        }

        try {
            await addDataToCollectionWithAutoID('reviews', newData);
        } catch (error) {
            setErrorDialog(error);
        } finally {
            handleCloseAddReviewDialog();
        }
    }

    return (
        <>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <form className='form' style={{ display: 'flex', width: '100%', maxWidth: '900px' }} >
                    <InputBase
                        onChange={(e) => setBook(e.target.value)}
                        sx={{ width: '100%', maxWidth: '900px' }}
                        placeholder="Search for books"
                        inputProps={{ 'aria-label': 'search books' }}
                        autoComplete='off'
                    />
                    <IconButton type="submit" sx={{ p: '10px' }} aria-label="search" onClick={(e) => fetchBooks(e)}>
                        <SearchIcon />
                    </IconButton>
                </form>
                {loading && <p>Loading...</p>}
                {error && <p style={{color: 'red'}}>Error: {error}</p>}
                <ImageList sx={{ width: '100%', maxWidth: '900px', maxHeight: '80vh', padding: '20px', paddingLeft: '0px' }} cols={cols} gap={20}>
                    {books.map((book: BookModel) => (
                        <ImageListItem 
                            sx={{  }}
                            key={book.volumeInfo.imageLinks?.thumbnail.replace('http://', 'https://') || edition_placeholder}
                        >
                            <img
                                srcSet={`${book.volumeInfo.imageLinks?.thumbnail.replace('http://', 'https://') || edition_placeholder}?w=248&fit=crop&auto=format&dpr=2 2x`}
                                src={`${book.volumeInfo.imageLinks?.thumbnail.replace('http://', 'https://') || edition_placeholder}?w=248&fit=crop&auto=format`}
                                alt={book.volumeInfo.title}
                                loading="lazy"
                                onClick={() => openAddReviewDialog(book)}
                            />
                            <ImageListItemBar
                                title={book.volumeInfo.title}
                                subtitle={book.volumeInfo.authors}
                                actionIcon={
                                    <a href='#' ref={linkRef}>
                                        <IconButton
                                            sx={{ color: 'rgba(255, 255, 255, 0.54)' }}
                                            aria-label={`info about ${book.volumeInfo.title}`}
                                            onClick={() => openNewWindow(book.volumeInfo.previewLink)}
                                        >
                                            <InfoIcon />
                                        </IconButton>
                                    </a>
                                }
                            />
                        </ImageListItem>
                    ))}
                </ImageList>
            </Box>
            {/* Jelszó dialog a privát szobákhoz */}
            <Dialog 
                open={openReviewDialog} 
                onClose={handleCloseAddReviewDialog} 
                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
                <DialogTitle sx={{width: '600px'}}>Értékelés: {currentBook ? currentBook.volumeInfo.title : ''}</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex' }}>
                        <Rating
                            name="simple-controlled"
                            value={ratingValue}
                            onChange={(event, newValue) => {
                                setRatingValue(newValue);
                            }}
                        /> 
                        <Typography variant="body1" sx={{ marginLeft: '10px' }}>
                            {avgRating.toFixed(1)}
                        </Typography>
                    </Box>
                    <Divider></Divider>
                    <Button onClick={() => {setIsNewReview(!isNewReview)}} sx={{ marginTop: '10px' }}>Vélemény írása</Button>
                    {isNewReview && (
                        <TextField
                            label="Vélemény"
                            type="text"
                            fullWidth
                            multiline
                            value={review}
                            onChange={(e) => setReview(e.target.value)}
                            sx={{ marginTop: 2 }}
                        />
                    )}
                    {errorDialog && (
                        <Typography 
                            sx={{ color: 'red', marginTop: '16px' }} 
                            variant="body1"
                        >
                            {errorDialog}
                        </Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseAddReviewDialog}>Mégse</Button>
                    <Button onClick={() => {handleAddReview()}}>Elküld</Button>
                </DialogActions>
            </Dialog>
        </>
    )
}

export default BookSearch;