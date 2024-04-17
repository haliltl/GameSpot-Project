import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Home.css';
const Home = () => {
    const [genres, setGenres] = useState([]);
    const [selectedGenre, setSelectedGenre] = useState(null);
    const [games, setGames] = useState([]);  // Ensure 'games' is defined in state
    const [error, setError] = useState('');

    // Fetching genres
    useEffect(() => {
        fetch('http://localhost:3000/game/search/genres')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch genres');
                }
                return response.json();
            })
            .then(data => setGenres(data))
            .catch(error => {
                console.error('Error fetching genres:', error);
                setError('Failed to fetch genres');
            });
    }, []);

    // Fetching games when a genre is selected
    useEffect(() => {
        if (selectedGenre) {
            fetch(`http://localhost:3000/game/search/genres?g=${selectedGenre}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to fetch games');
                    }
                    return response.json();
                })
                .then(data => setGames(data))
                .catch(error => {
                    console.error(`Error fetching games for genre ${selectedGenre}:`, error);
                    setError(`Failed to fetch games for genre: ${selectedGenre}`);
                });
        }
    }, [selectedGenre]);

    return (
        <div className="home">
            <h1>Game Genres</h1>
            {error && <p className="error">{error}</p>}
            <ul className="genre-list">
                {genres.map(genre => (
                    <li key={genre.id} onClick={() => setSelectedGenre(genre.id)}>
                        {genre.name}
                    </li>
                ))}
            </ul>
            {selectedGenre && (
                <div>
                    <h2>Games in {genres.find(genre => genre.id === selectedGenre)?.name}</h2>
                    <div className="game-list">
                        {games.map(game => (
                            <div key={game.id} className="game-item">
                                <Link to={`/game/${game.id}`}>
                                    <img src={`https://images.igdb.com/igdb/image/upload/t_720p/${game.cover?.url.split('/').pop()}`}  alt={`${game.name} cover`} />
                                    <div>
                                        <h3>{game.name}</h3>
                                        <p>Rating: {game.total_rating?.toFixed(2)}</p>
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Home;