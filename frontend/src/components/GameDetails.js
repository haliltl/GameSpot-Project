import React, { useState, useEffect } from 'react';



const GameDetails = ({ gameId }) => {
  const [gameDetails, setGameDetails] = useState(null);
  const [similarGames, setSimilarGames] = useState([]);
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const detailsResponse = await fetch({
          method: 'POST',
          url: `https://localhost:3000/game/${gameId}`,
        });

        // const similarResponse = await fetch({
        //   method: 'POST',
        //   url: `https://api.igdb.com/v4/games/${gameId}`,
        // });

        // const commentsResponse = await axios.get(`https://api.igdb.com/v4/games/${gameId}/comment`);

        setGameDetails(detailsResponse.data);
        // setSimilarGames(similarResponse.data);
        // setComments(commentsResponse.data);
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError("Failed to load data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [gameId]);

  if (isLoading) return <p>Loading game details...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h1>Game Details</h1>
      {gameDetails && (
        <div>
          <h2>{gameDetails.name}</h2>
          {gameDetails.cover && <img src={gameDetails.cover.url} alt={`Cover for ${gameDetails.name}`} />}
          <p><strong>Release Date:</strong> {new Date(gameDetails.first_release_date).toLocaleDateString()}</p>
          {gameDetails.total_rating && <p><strong>Rating:</strong> {gameDetails.total_rating.toFixed(2)}</p>}
          <h3>Similar Games</h3>
          <ul>
            {similarGames.map(game => <li key={game.id}>{game.name}</li>)}
          </ul>
          <h3>Comments</h3>
          <ul>
            {comments.map(comment => <li key={comment._id}>{comment.comment}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
};

export default GameDetails;