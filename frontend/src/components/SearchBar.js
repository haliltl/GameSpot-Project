import React, { useState } from 'react';
import axios from 'axios';

const SearchBar = ({ onResults }) => {
    const [query, setQuery] = useState('');

    const searchGames = async () => {
        try {
            const response = await axios.get(`http://localhost:3000/search?q=${query}`);
            onResults(response.data);
        } catch (error) {
            console.error('Failed to fetch games', error);
        }
    };

    return (
        <div>
            <input
                type="text"
                placeholder="Search games..."
                value={query}
                onChange={e => setQuery(e.target.value)}
            />
            <button onClick={searchGames}>Search</button>
        </div>
    );
};

export default SearchBar;