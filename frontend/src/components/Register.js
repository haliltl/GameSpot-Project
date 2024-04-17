import {useState} from "react";
import {useAuth} from "../context/AuthContext";

const Register = () => {
  const [error, setError] = useState(null);

  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    window.location.href = '/';
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.target);
    const data = {
      username: formData.get('username'),
      password: formData.get('password')
    };

    const response = await fetch('http://localhost:3000/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const data = await response.text();
      setError(data);
      return;
    }

    window.location.href = '/login';
  }

  return (
    <div>
      <div className="register">
        <h1>Register</h1>
        <form onSubmit={handleSubmit}>
          <label htmlFor="username">Username:</label>
          <input type="text" id="username" name="username" required/>
          <label htmlFor="password">Password:</label>
          <input type="password" id="password" name="password" required/>
          <button type="submit">Register</button>
          {error && <p className="error">{error}</p>}
        </form>
      </div>
    </div>
  )
}

export default Register;