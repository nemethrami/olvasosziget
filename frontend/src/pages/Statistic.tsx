import Stat from '../components/Stat';
import AppFrame from '../components/AppFrame';

export default function Statistics() {
  return (
        <AppFrame> 
            <Stat 
                totalBooksRead={35}
                avgRating={4.2}
                favoriteAuthor="George Orwell">
            </Stat>
        </AppFrame>
  );
}