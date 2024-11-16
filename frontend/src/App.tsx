import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Registration from "./pages/Registration";
import MainHome from "./pages/MainHome";
import FollowPage from "./pages/FollowPage";
import ChatRoomsPage from "./pages/ChatroomsPage";
import Statistics from "./pages/Statistic";
import ProfilePage from "./pages/ProfilePage";
import AdminPage from "./pages/AdminPage";
import "./App.css";
import './index.css';
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./config/FirebaseConfig";
import { useAuthState } from "react-firebase-hooks/auth";

function App() {
  const [user] = useAuthState(auth);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        localStorage.setItem('uid', user.uid)
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  return <div className="App" style={{ width: windowSize.width, height: windowSize.height }}>
    <BrowserRouter>
      <Routes>
        <Route index element={<MainHome />} />
        <Route path="/mainhome" element={<MainHome />} />
        <Route path="/home" element={user ? <Home /> : <Navigate to="/mainhome" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registration" element={!user ? <Registration /> : <Navigate to="/home" replace />} />
        <Route path="/follow" element={user ? <FollowPage /> : <Navigate to="/mainhome" replace />} />
        <Route path="/chatrooms" element={user ? <ChatRoomsPage /> : <Navigate to="/mainhome" replace />} />
        <Route path="/statistics" element={user ? <Statistics /> : <Navigate to="/mainhome" replace />} />
        <Route path="/profile/:id" element={user ? <ProfilePage /> : <Navigate to="/mainhome" replace />} />
        <Route path="/admin" element={user ? <AdminPage /> : <Navigate to="/mainhome" replace />} />
      </Routes>
    </BrowserRouter>
  </div>;
}

export default App;