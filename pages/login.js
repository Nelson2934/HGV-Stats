import { useState } from 'react';

export default function LoginPage() {
  const [message, setMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: e.target.username.value,
        password: e.target.password.value,
      }),
    });

    const data = await res.json();
    setMessage(data.message);
  };

  return (
    <div style={{ textAlign: 'center', paddingTop: '50px' }}>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input name="username" placeholder="Username" required /><br /><br />
        <input type="password" name="password" placeholder="Password" required /><br /><br />
        <button type="submit">Login</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}
