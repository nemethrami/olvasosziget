import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Toggle from "./components/Toggle";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Registration from "./pages/Registration";
import MainHome from "./pages/MainHome";
import Follow from "./pages/Follow";
import ChatRooms from "./pages/Chatrooms";
import Statistics from "./pages/Statistic";
import Goal from "./pages/Goal";
import "./App.css";


function App() {
  const storedIsDark = JSON.parse(localStorage.getItem('isDark') as string);

  const [isDark, setIsDark] = useState(storedIsDark);

  useEffect(() => {
    localStorage.setItem('isDark', JSON.stringify(isDark))
  }, [isDark])
  
  return <div className="App" data-theme={isDark ? "dark" : "light"}>
    <Toggle isChecked={isDark} handleChange={() => setIsDark(!isDark)}></Toggle>
    <BrowserRouter>
      <Routes>
        <Route index element={<MainHome />} />
        <Route path="/mainhome" element={<MainHome />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registration" element={<Registration />} />
        <Route path="/follow" element={<Follow />} />
        <Route path="/chatrooms" element={<ChatRooms />} />
        <Route path="/statistics" element={<Statistics />} />
        <Route path="/goal" element={<Goal />} />
      </Routes>
    </BrowserRouter>
  </div>;
}

export default App;