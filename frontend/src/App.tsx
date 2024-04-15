import { useEffect, useState } from "react";

import BookSearch from "./components/BookSearch";
import Toggle from "./components/Toggle";
import "./App.css";

function App() {
  const storedIsDark = JSON.parse(localStorage.getItem('isDark') as string);

  const [isDark, setIsDark] = useState(storedIsDark);

  useEffect(() => {
    localStorage.setItem('isDark', JSON.stringify(isDark))
  }, [isDark])
  
  return <div className="App" data-theme={isDark ? "dark" : "light"}>
    <Toggle isChecked={isDark} handleChange={() => setIsDark(!isDark)}></Toggle>
    <h1 className="title">Super Pancake</h1>
    <BookSearch></BookSearch>
  </div>;
}

export default App;