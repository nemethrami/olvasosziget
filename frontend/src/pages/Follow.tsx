import FollowComponent from '../components/FollowComponent';
import AppFrame from '../components/AppFrame';
import PeopleSearch from '../components/PeopleSearch';

export default function Follow() {
  return (
      <AppFrame> 
          <PeopleSearch></PeopleSearch>
          <FollowComponent></FollowComponent>
      </AppFrame>
  );
}