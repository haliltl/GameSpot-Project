import React from 'react';
import axios from 'axios';

const Game = ({ game }) => {
    const viewDetails = async () => {
        try {
            const response = await axios.get(`http://localhost:3000/${game.id}`);
            console.log(response.data);
        } catch (error) {
            console.error('Failed to fetch game details', error);
        }
    };

    return (
        <div>
            <h3>{game.name}</h3>
            <button onClick={viewDetails}>View Details</button>
        </div>
    );
};

export default Game;