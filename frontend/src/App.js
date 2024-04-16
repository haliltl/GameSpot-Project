import Navigation from "./components/Navigation";
import Home from "./components/Home";
import { Routes, Route } from 'react-router-dom';
import React, { useState } from 'react';
import SearchBar from './components/SearchBar';
import Game from './components/Game';
import GameDetails from "./components/GameDetails";


export default function App() {
  const [games, setGames] = useState([]);
    
  return (
    <>
      <Navigation />
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<SearchBar />} />
          <Route path="/details" element={<GameDetails />}></Route>
        </Routes>

      </div>
    </>
  );
}