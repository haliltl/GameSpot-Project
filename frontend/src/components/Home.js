import React, { useState, useEffect } from 'react';

const Home = () => {
    const [games, setGames] = useState([]);

    useEffect(() => {
        // Assuming the games data is fetched from an endpoint and set as state
        fetch('http://localhost:3000/api/games')
            .then(response => response.json())
            .then(data => {
                setGames(data);
            })
            .catch(error => console.error('Failed to fetch games', error));
    }, []);

    return (
        <div className="Home">
            <h1>Games Listing</h1>
            {games.map(game => (
                <div key={game.id} style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc' }}>
                    <h2>{game.name}</h2>
                    <div>
                        <strong>Genres:</strong>
                        <ul>
                            {game.genres.map(genre => (
                                <li key={genre.id}>{genre.name}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default Home;