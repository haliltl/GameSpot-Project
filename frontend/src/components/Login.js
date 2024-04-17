import {useState} from "react";

const Login = () => {
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.target);
    const jsonFormData = {
      username: formData.get('username'),
      password: formData.get('password')
    };

    const response = await fetch('http://localhost:3000/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(jsonFormData)
    });

    if (!response.ok) {
      const data = await response.text();
      setError(data);
      return;
    }

    const data = await response.json();
    localStorage.setItem('token', data.token);

    window.location.href = '/';
  }

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="username">Username:</label>
        <input type="text" id="username" name="username" required/>
        <label htmlFor="password">Password:</label>
        <input type="password" id="password" name="password" required/>
        <button type="submit">Login</button>
        {error && <p className="error">{error}</p>}
      </form>
    </div>
  )
}

export default Login;