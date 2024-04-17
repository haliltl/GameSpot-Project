import React, {useState, useEffect} from 'react';
import {useParams} from 'react-router-dom';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode';
import "../styles/GameDetails.css";

const GameDetails = () => {
  let {gameId} = useParams();

  const token = localStorage.getItem('token');
  const [currentUser, setCurrentUser] = useState(null);
  const userCache = {};

  const [gameDetails, setGameDetails] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchComments = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/game/${gameId}/comment`);
      const commentData = response.data;

      await Promise.all(commentData.map(async (comment) => {
        if (userCache[comment.user]) {
          comment.user = userCache[comment.user];
        } else {
          const userResponse = await axios.get(`http://localhost:3000/user/${comment.user.toString()}`);
          const userData = userResponse.data;
          userCache[comment.user] = userData;
          comment.user = userData;
        }
      }));

      setComments(commentData);

    } catch (error) {
      console.error('Failed to fetch comments:', error);
      setError("Failed to load comments");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const detailsResponse = await axios.get(`http://localhost:3000/game/${gameId}`, {
          headers: {
            Authorization: 'Bearer ' + token,
          }
        });

        console.log(detailsResponse.data)
        await fetchComments();
        setGameDetails(detailsResponse.data[0]);
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError("Failed to load data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    setCurrentUser(jwtDecode(token));
  }, []);

  const handleCommentSubmit = async (event) => {
    event.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      alert("You need to be logged in to add comments");
      return;
    }

    if (newComment.trim()) {
      const headers = { Authorization: `Bearer ${token}` };
      try {
        const response = await axios.post(
          `http://localhost:3000/game/${gameId}/comment`,
          { comment: newComment },
          { headers: headers }
        );
        await fetchComments();

        setNewComment('');
      } catch (error) {
        console.error('Error posting comment:', error);
        alert("Failed to post comment");
      }
    }
  };

  const deleteComment = async (commentId) => {
    const headers = { Authorization: `Bearer ${token}` };
    try {
      await axios.delete(`http://localhost:3000/game/${gameId}/comment/${commentId}`, { headers: headers });
      setComments(comments.filter(comment => comment._id !== commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert("Failed to delete comment");
    }
  }

  if (isLoading) return <p>Loading game details...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="game-details-container">
      <h1>Game Details</h1>
      {gameDetails && (
        <div>
          <h2>{gameDetails.name}</h2>
          <div className="game-image">
            {gameDetails.cover &&
              <img
                src={`https://images.igdb.com/igdb/image/upload/t_1080p/${gameDetails.cover.url.split('/').pop()}`}
                alt={`Cover for ${gameDetails.name}`}
                style={{height: '300px'}}
              />
            }
          </div>
          <div className="game-info">
            <p><strong>Release Date:</strong> {new Date(gameDetails.first_release_date * 1000).toDateString()}</p>
            {gameDetails.total_rating && <p><strong>Rating:</strong> {gameDetails.total_rating.toFixed(2)}</p>}
            <h3>Similar Games</h3>
            <ul>
              {gameDetails.similar_games && gameDetails.similar_games.length > 0 &&
                gameDetails.similar_games.map(game => <li key={game.id}>{game.name}</li>)}
            </ul>
          </div>
          <div className="comments-section">
            <h3>Comments</h3>
            <ul>
              {comments.map(comment =>
                <li key={comment._id} className="comment">
                  <strong>{comment.user.username}</strong>: {comment.comment}
                  {token && comment.user._id === currentUser._id && (
                    <button onClick={() => deleteComment(comment._id)}>Delete</button>
                  )}
                </li>
              )}
            </ul>
            {token ? (
              <form onSubmit={handleCommentSubmit}>
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Type your comment here..."
                />
                <button type="submit">Post Comment</button>
              </form>
            ) : (
              <p>You need to <a href="/login">login</a> to add comments.</p>  // Update this link as per your routing
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GameDetails;