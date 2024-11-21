import React, { useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography, Button, Paper, List, ListItem, ListItemAvatar, Avatar, ListItemText } from '@mui/material';
import ReadingGoalChart from '@components/ReadingGoalChart';
import { DocumentData, Timestamp } from 'firebase/firestore';
import { getCollectionDataByID } from '@services/FirebaseService';
import edition_placeholder from '@assets/edition_placeholder.png';


const StatisticsPage: React.FC = () => {
  const myUid = localStorage.getItem('uid');
  const [selectedStat, setSelectedStat] = useState<string | null>(null);
  const [myGoals, setMyGoals] = useState<DocumentData[]>([]);
  const [totalBooksRead, setTotalBooksRead] = useState<number>(0);
  const [booksReadByMonths, setBooksReadByMonths] = useState<number[]>(new Array(12).fill(0));
  const [avgRating, setAvgRating] = useState<number>(0);
  const [favoriteAuthor, setFavoriteAuthor] = useState<string>('Még nincs.');

  const findMostFrequentAuthor = (authors: string[]): string | null => {
    if (authors.length === 0) return null;
  
    const frequencyMap = authors.reduce((acc, str) => {
      acc.set(str, (acc.get(str) || 0) + 1);
      return acc;
    }, new Map<string, number>());
  
    let mostFrequent = "";
    let maxCount = 0;
  
    frequencyMap.forEach((count, str) => {
      if (count > maxCount) {
        mostFrequent = str;
        maxCount = count;
      }
    });
  
    return mostFrequent;
  };

  function countTimestampsByMonth(timestamps: Timestamp[]) {
    const currentYear: number = new Date().getFullYear();
    const counts: number[] = Array(12).fill(0);

    timestamps.forEach((timestamp: Timestamp) => {
      const date = timestamp.toDate();
      const year = date.getFullYear();
      const month = date.getMonth();
  
      if (year === currentYear) {
        counts[month] += 1;
      }
    });

    setBooksReadByMonths(counts);
  }

  useEffect(() => {
    const fetchData = async () => {
      if (!myUid) return;

      const data = await getCollectionDataByID('goals');
      const goalData: DocumentData[] = data.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const myGoalDatas: DocumentData[] = goalData.filter((doc) => doc.created_uid === myUid);
      const booksToRead: DocumentData[] = myGoalDatas.map((doc) => doc.books_to_read);
      const completedBookDates: Timestamp[] = booksToRead.map((data) => data.filter((bookInfo) => bookInfo.is_checked).map((bookInfo) => bookInfo.checked_at)).flat();
      const completedBookAuthors: string[] = booksToRead.map((data) => data.filter((bookInfo) => bookInfo.is_checked).map((bookInfo) => bookInfo.book.volumeInfo.authors).flat()).flat();

      setMyGoals(myGoalDatas);
      setTotalBooksRead(myGoalDatas.map((doc) => doc.completed_books).reduce((accumulator, currentValue) => accumulator + currentValue, 0));
      countTimestampsByMonth(completedBookDates);
      const mostFrequentAuthor = findMostFrequentAuthor(completedBookAuthors);
      if (mostFrequentAuthor) setFavoriteAuthor(mostFrequentAuthor);
    }

    fetchData();
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      if (!myUid) return;

      const data = await getCollectionDataByID('reviews');
      const goalData: DocumentData[] = data.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const myReviewDatas: DocumentData[] = goalData.filter((doc) => doc.created_uid === myUid);
      let sum: number = 0;

      myReviewDatas.forEach((doc) => {
        sum += doc.rating;
      });
      
      setAvgRating(sum / myReviewDatas.length || 0);
    }

    fetchData();
  }, [])

  const renderContent = () => {
    switch (selectedStat) {
      case 'goal':
        return <ReadingGoalChart bookNumbers={booksReadByMonths} />;
      case 'books':
        return <Paper
                  sx={{
                    flex: 1,
                    overflowY: 'auto',
                    marginBottom: 2,
                    padding: 2,
                    backgroundColor: '#f5f5f5',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                >
                  {myGoals && myGoals.map((goal) => (
                    <List sx={{ padding: 0 }}>
                      {goal.books_to_read.filter((bookData) => bookData.is_checked === true).map((bookData) => (
                        <ListItem
                          key={bookData.book.id}
                        >
                          <ListItemAvatar>
                            <Avatar>
                              <img 
                                src={bookData.book.volumeInfo.imageLinks?.thumbnail.replace('http://', 'https://') || edition_placeholder} 
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
                            primary={`${bookData.book.volumeInfo.title}: ${bookData.book.volumeInfo.authors}`}
                            primaryTypographyProps={{ fontSize: { xs: '0.6em', sm: '0.7em', md: '0.8em', lg: '1em' } }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  ))}
                  
                </Paper>
      default:
        return <ReadingGoalChart bookNumbers={booksReadByMonths} />;
    }
  };

  return (
    <Box sx={{ display: 'flex', width: '100%', minHeight: '85vh', flexDirection: 'column', alignItems: { xs: 'start',  sm: 'end'} }}>
      <Box 
        component='ul'
        sx={{ 
          display: 'flex',
          alignItems: 'center',
          justifyContent: {xs: 'center', sm: 'space-between'},
          flexDirection: {xs: 'column', sm: 'row'},
          gap: '2%',
          padding: 0,
          marginBottom: '20px', 
          width: {xs: '100%',  sm: '100%', md: '85%' }
        }}
      >
        <Box component='li' sx={{ width: {xs: '90%', sm: '30%'} }}>
          <Card sx={{ backgroundColor:'#d8daaf', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CardContent 
              sx={{
                "&:last-child": {
                  padding: 1,
                }, 
              }}
            >
              <Typography variant="h6" sx={{ color:'#895737', fontWeight: '600', fontFamily: 'Times New Roman', fontSize: { xs: '0.6em', sm: '0.7em', md: '0.8em', lg: '1em' } }}>Olvasott könyvek száma: {totalBooksRead}</Typography>
            </CardContent>
          </Card>
        </Box>
        <Box component='li' sx={{ margin: '10px', width: {xs: '90%', sm: '30%'} }}>
          <Card sx={{ backgroundColor:'#d8daaf', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CardContent 
              sx={{
                "&:last-child": {
                  padding: 1
                }, 
              }}
            >
              <Typography variant="h6" sx={{ color:'#895737', fontWeight: '600', fontFamily: 'Times New Roman', fontSize: { xs: '0.6em', sm: '0.7em', md: '0.8em', lg: '1em' }}}>Átlagos értékelés: {avgRating.toFixed(1)}</Typography>
            </CardContent>
          </Card>
        </Box>
        <Box component='li' sx={{ width: {xs: '90%', sm: '30%'} }}>
          <Card sx={{ backgroundColor:'#d8daaf', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CardContent 
              sx={{
                "&:last-child": {
                  padding: 1
                }, 
              }}
            >
              <Typography variant="h6" sx={{ color:'#895737', fontWeight: '600', fontFamily: 'Times New Roman', fontSize: { xs: '0.6em', sm: '0.7em', md: '0.8em', lg: '1em' }}}>Legolvasottabb szerző: {favoriteAuthor}</Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>

      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: {xs: 'column', sm: 'column',  md: 'row'},
          width: '100%' 
        }}
      >
        <Box 
          component='ul' 
          sx={{ 
            display: 'flex', 
            flexDirection: {xs: 'column', sm: 'row', md: 'column'},
            gap: '10px',
            alignItems: {xs: 'center', md: 'end'},
            justifyContent: 'center',
            backgroundColor: '#f6f5ec', 
            width: {xs: '100%',  md: '15%'}, 
            paddingRight: '20px' 
          }}
        >
          <Box component='li'>
            <Button fullWidth variant="contained" onClick={() => setSelectedStat('goal')}
              sx={{ 
                backgroundColor: '#eae2ca', 
                color: '#895737',
                fontWeight: '600',
                fontFamily: 'Times New Roman', 
                borderRadius: '8px',
                cursor: 'pointer',
                border: 'none',
                fontSize: { xs: '0.6em', sm: '0.7em', md: '0.8em', lg: '1em' },
                transition: 'background-color 0.8s ease',
                '&:hover': {
                  backgroundColor: '#90784f',
                  color: '#f3e9dc',
                }
              }}
            >
              Olvasási cél grafikon
            </Button>
          </Box>
          <Box component='li'>
            <Button fullWidth variant="contained" onClick={() => setSelectedStat('books')}
              sx={{ 
                backgroundColor: '#eae2ca', 
                color: '#895737',
                fontWeight: '600',
                fontFamily: 'Times New Roman', 
                borderRadius: '8px',
                cursor: 'pointer',
                border: 'none',
                fontSize: { xs: '0.6em', sm: '0.7em', md: '0.8em', lg: '1em' },
                transition: 'background-color 0.8s ease',
                '&:hover': {
                  backgroundColor: '#90784f',
                  color: '#f3e9dc',
                }
              }}
            >
              Olvasott könyvek listája
            </Button>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          {renderContent()}
        </Box>
      </Box>
    </Box>
  );
};

export default StatisticsPage;
