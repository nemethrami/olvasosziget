import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Registration from "./pages/Registration";
import MainHome from "./pages/MainHome";
import UserProfile from "./pages/Profile";
import Follow from "./pages/Follow";
import ChatRooms from "./pages/Chatrooms";
import Statistics from "./pages/Statistic";
import Goal from "./pages/Goal";
import "./App.css";
import './index.css';

function App() {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

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
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registration" element={<Registration />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/follow" element={<Follow />} />
        <Route path="/chatrooms" element={<ChatRooms />} />
        <Route path="/statistics" element={<Statistics />} />
        <Route path="/goal" element={<Goal />} />
      </Routes>
    </BrowserRouter>
  </div>;
}

export default App;