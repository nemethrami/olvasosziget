import { Box, Button, ListItemText, TextField, Typography } from "@mui/material";
import { arrayRemove, DocumentData, onSnapshot, QuerySnapshot, Timestamp, updateDoc } from "firebase/firestore";
import AvatarComponent from "@components/AvatarComponent";
import { useNavigate } from "react-router-dom";
import { addDataToCollection, deleteDocDataByID, getCollectionByID, getDocData, getDocRef, updateDocAttributes } from "@services/FirebaseService";
import { useEffect, useState } from "react";

type Props = {
    reportData: DocumentData,
}

function ContentComponent({ reportData }: Props)  {
    const [reportedContent, setReportedContent] = useState<DocumentData | null>(null);

    useEffect(() => {
        const collectionRef = getCollectionByID(reportData.content_type === 'user' ? 'users' : 'reviews');
    
        const unsubscribe = onSnapshot(collectionRef, (snapshot: QuerySnapshot<DocumentData>) => {
          const newData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).filter(doc => doc.id === reportData.reported_content);
          setReportedContent(newData[0]);
        });
    
        return () => unsubscribe();
    }, [reportData]);

    const navigate = useNavigate();

    function navigateToProfile(username: string) {
        navigate(`/profile/${username}`);
    }

    async function handleReportDelete() {
        await deleteDocDataByID('reports', reportData.id);
    }

    async function bannUser() {
        const docData = await getDocData('banned', reportData.reported_content);

        if (docData) {
            await updateDocAttributes('banned', reportData.reported_content, {banned_at: Timestamp.now()});
            return;
        }
        
        await addDataToCollection('banned', reportData.reported_content, {user: reportData.reported_content, banned_at: Timestamp.now()});
        await handleReportDelete();
    }   

    async function contentDelete() {
        if (reportData.comment) {
            const docRef = getDocRef('reviews', reportData.reported_content);

            await updateDoc(docRef, {
                comments: arrayRemove(reportData.comment),
            });
            
            await handleReportDelete();
            return;
        }

        await deleteDocDataByID('reviews', reportData.id);
        await handleReportDelete();
    }

    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent:'center',
                
                flexDirection: 'column',
                height: '85vh',
                backgroundColor: 'white',
                color:'#895737',
                gap: 6
            }}
        >
            {(reportData.content_type === 'user' && reportedContent) && (
                <>
                    <Typography sx={{ marginLeft: '180px', fontWeight: 'bold', }}> Jelentett felhasználó: {reportedContent.lastname} {reportedContent.firstname} (@{reportedContent.username})</Typography>
                    <Typography sx={{ marginLeft: '180px', fontWeight: 'bold', marginTop:4 }}> Jelentés oka: {reportData.explanation}</Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                        <Typography sx={{ marginLeft: '180px', fontWeight: 'bold' }}> Profil elérése: </Typography>
                        <Button sx={{ color: 'grey', textTransform: 'none' }} onClick={() => navigateToProfile(reportedContent.username)}>
                            <AvatarComponent aUrl={reportedContent.avatar_url}></AvatarComponent>
                            <ListItemText primary={`${reportedContent.lastname} ${reportedContent.firstname}`} sx={{ marginLeft: 1, color: '#895737' }} />
                        </Button>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
                        <Button onClick={handleReportDelete}
                            sx={{
                                backgroundColor: '#eae2ca',
                                color: '#895737',
                                fontWeight: '600',
                                fontFamily: 'Times New Roman',
                                borderRadius: '8px',
                                margin: '16px',
                                cursor: 'pointer',
                                border: 'none',
                                padding: '10px 20px',
                                transition: 'background-color 0.8s ease',
                                '&:hover': {
                                    backgroundColor: '#90784f',
                                    color: '#f3e9dc',
                                }
                            }}
                        >
                            Jelentés törlése
                        </Button>
                        <Button onClick={bannUser}
                            sx={{
                                backgroundColor: '#eae2ca',
                                color: '#895737',
                                fontWeight: '600',
                                fontFamily: 'Times New Roman',
                                borderRadius: '8px',
                                margin: '16px',
                                cursor: 'pointer',
                                border: 'none',
                                padding: '10px 20px',
                                transition: 'background-color 0.8s ease',
                                '&:hover': {
                                    backgroundColor: '#90784f',
                                    color: '#f3e9dc',
                                }
                            }}
                        >
                            Felhasználó tiltása
                        </Button>
                    </Box>
                </>
            )}

            {(reportData.content_type === 'comment' && reportedContent) && (
                <Box> 
                    <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', flexDirection:'column' }}>
                        <Typography variant="body1" sx={{ fontWeight: 'bold', justifyContent: 'center', marginLeft:'150px', marginBottom:10 }}>
                            Jelentett tartalomhoz tartozó felhasználó: {reportedContent.created_username || 'N/A'}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'center',  flexDirection:'row', alignItems: 'center' }}>
                            {reportedContent.book && (
                                <img
                                    src={reportedContent.book.volumeInfo.imageLinks.thumbnail || ''}
                                    alt={reportedContent.book.volumeInfo.title || 'Könyv borító'}
                                    loading="lazy"
                                    style={{ width: '10%', height: 'auto' }}
                                    id={`thumbnail-img-${reportData.id}`}
                                />
                            )}
                            <TextField
                            fullWidth
                            value={reportedContent.text || ''}
                            disabled
                            multiline
                            sx={{
                                marginTop: '10px',
                                marginLeft:'15px',
                                alignItems: 'flex-start',
                                '& .MuiInputBase-input.Mui-disabled': {
                                    WebkitTextFillColor: 'black',
                                    color: 'black',
                                },
                                justifyContent: 'center',
                                width:'350px'
                            }}
                            />
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', marginLeft: '10px', justifyContent: 'center' }}>
                                <Typography variant="body1" sx={{ marginLeft: '250px', fontWeight:'bold', marginTop:4 }}>
                                    Jelentés oka: {reportData.explanation || 'Nincs megadva'}
                                </Typography>
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', marginTop:6 }}>
                        <Button onClick={handleReportDelete}
                            sx={{
                                backgroundColor: '#eae2ca',
                                color: '#895737',
                                fontWeight: '600',
                                fontFamily: 'Times New Roman',
                                borderRadius: '8px',
                                margin: '16px',
                                cursor: 'pointer',
                                border: 'none',
                                padding: '10px 20px',
                                transition: 'background-color 0.8s ease',
                                '&:hover': {
                                    backgroundColor: '#90784f',
                                    color: '#f3e9dc',
                                }
                            }}
                        >
                            Jelentés törlése
                        </Button>
                        <Button onClick={contentDelete}
                            sx={{
                                backgroundColor: '#eae2ca',
                                color: '#895737',
                                fontWeight: '600',
                                fontFamily: 'Times New Roman',
                                borderRadius: '8px',
                                margin: '16px',
                                cursor: 'pointer',
                                border: 'none',
                                padding: '10px 20px',
                                transition: 'background-color 0.8s ease',
                                '&:hover': {
                                    backgroundColor: '#90784f',
                                    color: '#f3e9dc',
                                }
                            }}
                        >
                            Tartalom moderálás
                        </Button>
                    </Box>
                </Box>
            )}

            {(reportData.content_type === 'review' && reportedContent) && (
                <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', flexDirection:'column' }}>
                        <Typography variant="body1" sx={{ fontWeight: 'bold', justifyContent: 'center', marginLeft:'150px', marginBottom:10 }}>
                            Jelentett tartalomhoz tartozó felhasználó: {reportedContent.created_username || 'N/A'}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'center',  flexDirection:'row', alignItems: 'center' }}>
                            {reportedContent.book && (
                                <img
                                    src={reportedContent.book.volumeInfo.imageLinks.thumbnail || ''}
                                    alt={reportedContent.book.volumeInfo.title || 'Könyv borító'}
                                    loading="lazy"
                                    style={{ width: '10%', height: 'auto' }}
                                    id={`thumbnail-img-${reportData.id}`}
                                />
                            )}
                            <TextField
                            fullWidth
                            value={reportedContent.text || ''}
                            disabled
                            multiline
                            sx={{
                                marginTop: '10px',
                                alignItems: 'flex-start',
                                marginLeft:'15px',
                                '& .MuiInputBase-input.Mui-disabled': {
                                    WebkitTextFillColor: 'black',
                                    color: 'black',
                                },
                                justifyContent: 'center',
                                width:'350px'
                            }}
                            />
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', marginLeft: '10px', justifyContent: 'center' }}>
                                <Typography variant="body1" sx={{ marginLeft: '250px', fontWeight:'bold', marginTop:4 }}>
                                    Jelentés oka: {reportData.explanation || 'Nincs megadva'}
                                </Typography>
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', marginTop:6 }}>
                        <Button onClick={handleReportDelete}
                            sx={{
                                backgroundColor: '#eae2ca',
                                color: '#895737',
                                fontWeight: '600',
                                fontFamily: 'Times New Roman',
                                borderRadius: '8px',
                                margin: '16px',
                                cursor: 'pointer',
                                border: 'none',
                                padding: '10px 20px',
                                transition: 'background-color 0.8s ease',
                                '&:hover': {
                                    backgroundColor: '#90784f',
                                    color: '#f3e9dc',
                                }
                            }}
                        >
                            Jelentés törlése
                        </Button>
                        <Button onClick={contentDelete}
                            sx={{
                                backgroundColor: '#eae2ca',
                                color: '#895737',
                                fontWeight: '600',
                                fontFamily: 'Times New Roman',
                                borderRadius: '8px',
                                margin: '16px',
                                cursor: 'pointer',
                                border: 'none',
                                padding: '10px 20px',
                                transition: 'background-color 0.8s ease',
                                '&:hover': {
                                    backgroundColor: '#90784f',
                                    color: '#f3e9dc',
                                }
                            }}
                        >
                            Tartalom moderálás
                        </Button>
                    </Box>
                </Box>
            )}
        </Box>
    );
}

export default ContentComponent;