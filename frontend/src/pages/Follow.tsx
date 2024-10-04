import FollowPage from '../components/FollowPage';
import Profile from '../components/Profile';
import AppFrame from '../components/AppFrame';
import PeopleSearch from '../components/PeopleSearch';

export default function Follow() {
  return (
      <AppFrame> 
          <PeopleSearch></PeopleSearch>
          <Profile></Profile>
          <FollowPage></FollowPage>
      </AppFrame>
  );
}