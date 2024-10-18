import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Registration from "./pages/Registration";
import MainHome from "./pages/MainHome";
import UserProfile from "./pages/Profile";
import Follow from "./pages/Follow";
import ChatRoomsPage from "./pages/ChatroomsPage";
import Statistics from "./pages/Statistic";
import Goal from "./pages/Goal";
import ChatRoomPage from "./pages/ChatroomPage";
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
        <Route path="/mainhome" element={!user ? <MainHome /> : <Navigate to="/home" replace />} />
        <Route path="/home" element={user ? <Home /> : <Navigate to="/mainhome" replace />} />
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/home" replace />} />
        <Route path="/registration" element={!user ? <Registration /> : <Navigate to="/home" replace />} />
        <Route path="/profile" element={user ? <UserProfile /> : <Navigate to="/mainhome" replace />} />
        <Route path="/follow" element={user ? <Follow /> : <Navigate to="/mainhome" replace />} />
        <Route path="/chatrooms" element={user ? <ChatRoomsPage /> : <Navigate to="/mainhome" replace />} />
        <Route path="/statistics" element={user ? <Statistics /> : <Navigate to="/mainhome" replace />} />
        <Route path="/goal" element={user ? <Goal /> : <Navigate to="/mainhome" replace />} />
        <Route path="/chatrooms/:id" element={user ? <ChatRoomPage /> : <Navigate to="/mainhome" replace />} />
      </Routes>
    </BrowserRouter>
  </div>;
}

export default App;