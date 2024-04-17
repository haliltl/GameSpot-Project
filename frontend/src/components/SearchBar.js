import React, {useState} from 'react';
import axios from 'axios';
import {Link} from "react-router-dom";

const SearchBar = ({onResults}) => {
  const [query, setQuery] = useState('');

  const [games, setGames] = useState(null);

  const searchGames = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/game/search?q=${query}`);
      const data = response.data;
      setGames(data);
      onResults(response.data);
    } catch (error) {
      console.error('Failed to fetch games', error);
    }
  };

  return (
    <div>
      <form onSubmit={e => {
        e.preventDefault();
        searchGames();
      }}>
        <input
          type="text"
          placeholder="Search games..."
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>
      {games && (
        <div className="game-list">
          {games.map(game => (
            <div key={game.id} className="game-item">
              <Link to={`/game/${game.id}`}>
                <img src={`https://images.igdb.com/igdb/image/upload/t_720p/${game.cover?.url.split('/').pop()}`}
                     alt={`${game.name} cover`}/>
                <div>
                  <h3>{game.name}</h3>
                  <p>Rating: {game.total_rating?.toFixed(2)}</p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;