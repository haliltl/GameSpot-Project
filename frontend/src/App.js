import Navigation from "./components/Navigation";
import Home from "./components/Home";
import { Routes, Route } from 'react-router-dom';
import React, { useState } from 'react';
import SearchBar from './components/SearchBar';
import GameDetails from "./components/GameDetails";
import Register from "./components/Register";
import Login from "./components/Login";
import Logout from "./components/Logout";
import {AuthProvider} from "./context/AuthContext";



export default function App() {
  const [games, setGames] = useState([]);
    
  return (
    <>
      <AuthProvider>
        <Navigation />
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<SearchBar />} />
          <Route path="/game/:gameId" element={<GameDetails />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/logout" element={<Logout />} />
        </Routes>
      </div>
      </AuthProvider>
    </>
  );
}