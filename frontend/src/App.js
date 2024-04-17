import Navigation from "./components/Navigation";
import Home from "./components/Home";
import { Routes, Route } from 'react-router-dom';
import React, { useState } from 'react';
import SearchBar from './components/SearchBar';
import GameDetails from "./components/GameDetails";
import Register from "./components/Register";


const isLoggedIn = async () => {
  const response = await fetch('http://localhost:3000/user/profile');
  return response.ok;
}

export default function App() {
  const [games, setGames] = useState([]);
    
  return (
    <>
      <Navigation />
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<SearchBar />} />
          <Route path="/game/:gameId" element={<GameDetails />} />
          <Route path="/register" element={<Register />} />
        </Routes>

      </div>
    </>
  );
}