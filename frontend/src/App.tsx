import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "@pages/Home";
import Login from "@pages/Login";
import Registration from "@pages/Registration";
import MainHome from "@pages/MainHome";
import FollowPage from "@pages/FollowPage";
import ChatRoomsPage from "@pages/ChatroomsPage";
import Statistics from "@pages/Statistic";
import ProfilePage from "@pages/ProfilePage";
import AdminPage from "@pages/AdminPage";
import "App.css";
import 'index.css';
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@config/FirebaseConfig";
import { useAuthState } from "react-firebase-hooks/auth";
import ReviewPage from "@pages/ReviewPage";

function App() {
  const [user] = useAuthState(auth);
  const [isUserOk, setIsUserOk] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        localStorage.setItem('uid', user.uid);
        if (user.emailVerified) {
          setIsUserOk(true);
        } else {
          setIsUserOk(false);
        }
      } else {
        localStorage.removeItem('uid');
        setIsUserOk(false);
      }
    });
    return () => unsubscribe();
  }, []);
  
  return <div className="App" style={{ width: '100%', height: '100%' }}>
    <BrowserRouter>
      <Routes>
        <Route index element={<MainHome />} />
        <Route path="/mainhome" element={!isUserOk ? <MainHome /> : <Navigate to="/home" replace />} />
        <Route path="/home" element={isUserOk ? <Home /> : <Navigate to="/mainhome" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registration" element={<Registration />} />
        <Route path="/follow" element={isUserOk ? <FollowPage /> : <Navigate to="/mainhome" replace />} />
        <Route path="/chatrooms" element={isUserOk ? <ChatRoomsPage /> : <Navigate to="/mainhome" replace />} />
        <Route path="/statistics" element={isUserOk ? <Statistics /> : <Navigate to="/mainhome" replace />} />
        <Route path="/profile/:id" element={isUserOk ? <ProfilePage /> : <Navigate to="/mainhome" replace />} />
        <Route path="/review/:id" element={isUserOk ? <ReviewPage /> : <Navigate to="/mainhome" replace />} />
        <Route path="/admin" element={isUserOk ? <AdminPage /> : <Navigate to="/mainhome" replace />} />
      </Routes>
    </BrowserRouter>
  </div>;
}

export default App;