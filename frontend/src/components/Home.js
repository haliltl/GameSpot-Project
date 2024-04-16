import React, { useState } from 'react';

const Home = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleUsernameChange = (e) => {
      setUsername(e.target.value);
    }

    const handlePasswordChange = (e) => {
      setPassword(e.target.value);
    }
    
    const handleSubmit = (e) => {
      e.preventDefault();
      // Perform your login operation here
      console.log(`Logging in with username: ${username} and password: ${password}`);
    }

    return (
      <div className="Home">
          <h1>Welcome!</h1>
          <form onSubmit={handleSubmit}>
              <label>
                  Username:
                  <input 
                      type="text"
                      value={username}
                      onChange={handleUsernameChange}
                  />
              </label>
              <label>
                  Password:
                  <input
                      type="password"
                      value={password}
                      onChange={handlePasswordChange}
                  />
              </label>
              <input type="submit" value="Login" />
          </form>
      </div>
    );
}

export default Home;
