import axios from 'axios';
import { useState, useRef } from 'react';
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

function BookSearch() {
    const [book, setBook] = useState<string>('');
    const [books, setBooks] = useState<BookModel[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const linkRef = useRef<HTMLAnchorElement>(null);
    const API_KEY = 'AIzaSyCZ0PamLM1OwHLSQ-qNab8hUhHGjGr0Bjs';
    //const API_KEY = process.env.REACT_APP_GOOGLE_BOOKS_API_KEY;

    const fetchBooks = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();

        if (!book.trim()) {
            // Do not proceed if the search query is an empty string
            setBooks([]);
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

    return (
        <>
            <form className='form'>
                <InputBase
                    onChange={(e) => setBook(e.target.value)}
                    sx={{ flex: 1}}
                    placeholder="Search for books"
                    inputProps={{ 'aria-label': 'search books' }}
                    autoComplete='off'
                />
                <IconButton type="submit" sx={{ p: '10px' }} aria-label="search" onClick={(e) => fetchBooks(e)}>
                    <SearchIcon />
                </IconButton>
            </form>
            {loading && <p>Loading...</p>}
            {error && <p>Error: {error}</p>}
            <ImageList sx={{ width: '100%', height: '80vh', margin: '0', padding: '0' }} cols={8}>
                {books.map((book: BookModel) => (
                    <ImageListItem key={book.volumeInfo.imageLinks?.thumbnail.replace('http://', 'https://') || edition_placeholder}>
                        <img
                            srcSet={`${book.volumeInfo.imageLinks?.thumbnail.replace('http://', 'https://') || edition_placeholder}?w=248&fit=crop&auto=format&dpr=2 2x`}
                            src={`${book.volumeInfo.imageLinks?.thumbnail.replace('http://', 'https://') || edition_placeholder}?w=248&fit=crop&auto=format`}
                            alt={book.volumeInfo.title}
                            loading="lazy"
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
        </>
    )
}

export default BookSearch;