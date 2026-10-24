import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../api';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (username.length < 3) return setError('Username must be at least 3 chars');
    if (password.length < 8) return setError('Password must be at least 8 chars');
    setLoading(true);
    try {
      await register(username, email, password);
      navigate('/login');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" />
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" />
        <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" />
        <button disabled={loading} type="submit">{loading ? 'Registering...' : 'Register'}</button>
      </form>
      {error && <p className="error">{error}</p>}
      <p>Have an account? <Link to="/login">Login</Link></p>
    </div>
  );
}
