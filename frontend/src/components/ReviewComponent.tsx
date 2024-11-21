import { Box, Button, Paper, Rating, TextField, Typography, useMediaQuery, useTheme } from "@mui/material";
import { getAvatarUrlByUserName, getCollectionDataByID } from "@services/FirebaseService";
import dayjs from "dayjs";
import { DocumentData, QuerySnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import edition_placeholder from '@assets/edition_placeholder.png'
import { Variant } from "@mui/material/styles/createTypography";
import AvatarComponent from "./AvatarComponent";


export default function ReviewComponent() {
    const theme = useTheme();
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [reviews, setReviews] = useState<DocumentData[]>([]);
    const [title, setTitle] = useState<string>('');
    const [avatarUrl, setAvatarUrl] = useState<string[]>([]);
    const isXs: boolean = useMediaQuery(theme.breakpoints.down('sm'));
    const isSm: boolean = useMediaQuery(theme.breakpoints.up('sm') && theme.breakpoints.down('md'));
    const variant: Variant = isXs ? 'body1' : isSm ? 'h5' : 'h4'

    useEffect(() => {
        const fetchReviews = async () => {
            const data: QuerySnapshot<DocumentData, DocumentData> = await getCollectionDataByID('reviews');
            const reviewData: DocumentData[] = data.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));

            const filteredReviews: DocumentData[] = reviewData.filter((doc) => doc.book.id === id);

            setReviews(filteredReviews);
            setTitle(filteredReviews[0].book.volumeInfo.title || '')

            const avatarUrlResult = await Promise.all(
                filteredReviews.map(async (doc) => {
                    return await getAvatarUrlByUserName(doc.created_username);
                })
            )

            setAvatarUrl(avatarUrlResult);
        }

        fetchReviews();
    }, [])

    function navigateToProfile(username: string) {
        navigate(`/profile/${username}`);
    }

    return (
        <Box 
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column'
            }}
        >
            <Typography variant={variant} sx={{ marginBottom: 5, color: 'grey' }}>
                Értékelések a {title} című könyvről
            </Typography>
            {reviews.map((post, index) => {
                const postId = post.id;

                return (
                    <Paper 
                        sx={{ padding: 2, marginBottom: 2, width: '90%', maxWidth: '1500px', overflow: 'hidden', wordWrap: 'break-word', overflowWrap: 'break-word', wordBreak: 'break-all' }} 
                        key={postId}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="body1" gutterBottom sx={{ marginRight: 'auto', fontSize: {xs: '0.7rem', sm: '0.8rem', md: '0.9rem', lg: '1rem'}, }}>
                                {post.book.volumeInfo.title}
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 1 }}>
                            <Button sx={{ textTransform: 'none', paddingLeft: 0 }} onClick={() => navigateToProfile(post.created_username)}>
                                <AvatarComponent aUrl={avatarUrl[index]}></AvatarComponent>
                                <Typography sx={{ marginLeft: 1, color: 'black' }} >
                                    {post.created_username}
                                </Typography>
                            </Button>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-start', width: '100%' }}>
                            <Box sx={{ display: {xs: 'none', sm: 'flex'}, width: '10%', flexDirection: 'column' }}>
                                <Box
                                    component="img"
                                    src={`${post.book.volumeInfo.imageLinks?.thumbnail.replace('http://', 'https://') || edition_placeholder}?w=248&fit=crop&auto=format`}
                                    alt={post.book.volumeInfo.title}
                                    loading="lazy"
                                    id={`thumbnail-img-${postId}`}
                                    sx={{
                                        width: '100%',
                                    }}
                                />
                                <Box></Box>
                            </Box>
                            <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', marginLeft: {xs: 0, sm: '10px'} }}>
                                <TextField 
                                    fullWidth 
                                    value={post.text}
                                    disabled
                                    multiline
                                    sx={{
                                        alignItems: 'flex-start',
                                        '& .MuiInputBase-input.Mui-disabled': {
                                            padding: 0,
                                            fontSize: {xs: '0.7rem', sm: '0.8rem', md: '0.9rem', lg: '1rem'},
                                            WebkitTextFillColor: 'black',
                                            color: 'black',
                                        },
                                        '& .MuiInputBase-root': {
                                            fontSize: {xs: '0.7rem', sm: '0.8rem', md: '0.9rem', lg: '1rem'},
                                        }
                                    }}
                                />
                                <Box sx={{ display: 'flex', flexDirection: {xs: 'column', sm: 'row'}, width: '100%', marginTop: '5px' }}>
                                    <Typography variant="body1" gutterBottom sx={{ marginRight: '10px', fontSize: {xs: '0.7rem', sm: '0.8rem', md: '0.9rem', lg: '1rem'} }}>
                                        Rating: 
                                    </Typography>
                                    <Rating name="read-only" value={post.rating} readOnly sx={{fontSize: {xs: '0.7rem', sm: '0.8rem', md: '0.9rem', lg: '1rem'}}} />
                                </Box>
                            </Box>
                        </Box>
                        <Typography variant="caption" color="textSecondary" sx={{fontSize: {xs: '0.7rem', sm: '0.8rem', md: '0.9rem', lg: '1rem'}}}>
                            {dayjs(post.created_at.toDate()).format('YYYY.MM.DD - HH:mm:ss')}
                        </Typography>
                    </Paper>
                )
            })}
        </Box>
    )
}