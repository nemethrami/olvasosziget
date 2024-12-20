import axios from 'axios';
import { useState, useRef, useEffect } from 'react';
import { BookModel } from '@models/BookModel';
import edition_placeholder from '@assets/edition_placeholder.png'
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import ImageListItemBar from '@mui/material/ImageListItemBar';
import IconButton from '@mui/material/IconButton';
import InfoIcon from '@mui/icons-material/Info';
import SearchIcon from '@mui/icons-material/Search';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Rating, TextField, Typography, useMediaQuery, useTheme } from '@mui/material';
import { addDataToCollectionWithAutoID, getCollectionByID, getCollectionDataByID, getCurrentUserName, getDocsByQuery } from '@services/FirebaseService';
import { CollectionReference, DocumentData, query, Query, QueryDocumentSnapshot, QuerySnapshot, Timestamp, where } from 'firebase/firestore';
import { ReviewModel } from '@models/ReviewModel';
import InputAdornment from '@mui/material/InputAdornment';
import { useNavigate } from 'react-router-dom';


function BookSearch() {
    const navigate = useNavigate();
    const theme = useTheme();
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
    const isXs: boolean = useMediaQuery(theme.breakpoints.down('sm'));
    const isSm: boolean = useMediaQuery(theme.breakpoints.up('sm') && theme.breakpoints.down('md'));
    const cols: number = isXs ? 2 : isSm ? 3 : 4;

    const fetchPosts = async () => {
        const currentUid: string | null = localStorage.getItem('uid')
        if (!currentUid) return;

        setCurrentUsername(await getCurrentUserName());

        const reviewsRef: CollectionReference<DocumentData, DocumentData> = getCollectionByID('reviews');
        const q: Query<DocumentData, DocumentData> = query(reviewsRef, where('created_uid', '==', currentUid))
  
        const querySnapshot: QueryDocumentSnapshot<DocumentData, DocumentData>[] = await getDocsByQuery(q);
        if (!querySnapshot) return;

        const datas: BookModel[] = querySnapshot.map(doc => doc.data().book)
        const uniqueItems = datas.filter((item, index, self) =>
          index === self.findIndex((t) => t.id === item.id)
        );
        setBooks(uniqueItems);
    }

    useEffect(() => {
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
            if (numbers.length === 0) return 0.0;
          
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
                <form className='form' style={{ display: 'flex', width: '100%', maxWidth: '900px', justifyContent: 'center' }} >
                    <TextField
                    label="Keresés"
                    variant="outlined"
                    sx={{ width: '140%', maxWidth: '600px' }}
                    onChange={(e) => setBook(e.target.value)}
                    InputProps={{
                        endAdornment: (
                        <InputAdornment position="end">
                            <IconButton type="submit" sx={{ p: '10px' }} aria-label="search" onClick={(e) => fetchBooks(e)}>
                                <SearchIcon />
                            </IconButton>
                        </InputAdornment>
                        ),
                    }}
                    />

                </form>
                {loading && <p>Loading...</p>}
                {error && <p style={{color: 'red'}}>Error: {error}</p>}
                <ImageList sx={{ width: '100%', maxWidth: '900px', maxHeight: '80vh', padding: '20px', paddingLeft: '0px' }} cols={cols} gap={20}>
                    {books.map((book: BookModel) => (
                        <ImageListItem 
                            sx={{  }}
                            key={book.id}
                        >
                            <img
                                srcSet={`${book.volumeInfo.imageLinks?.thumbnail.replace('http://', 'https://') || edition_placeholder}?w=248&fit=crop&auto=format&dpr=2 2x`}
                                src={`${book.volumeInfo.imageLinks?.thumbnail.replace('http://', 'https://') || edition_placeholder}?w=248&fit=crop&auto=format`}
                                alt={book.volumeInfo.title}
                                loading="lazy"
                                onClick={() => openAddReviewDialog(book)}
                            />
                            <ImageListItemBar
                                sx={{ maxHeight: '20%' }}
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
                        <span 
                            style={{ marginLeft: '10px', cursor: 'pointer', color: 'blue' }} 
                            onClick={() => navigate(`/review/${currentBook.id}`)}
                            onMouseEnter={(e) => {
                                const target = e.target as HTMLSpanElement;
                                target.style.textDecoration = 'underline';
                            }}
                            onMouseLeave={(e) => {
                                const target = e.target as HTMLSpanElement;
                                target.style.textDecoration = 'none';
                            }}
                        >
                            {avgRating.toFixed(1)}
                        </span>
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