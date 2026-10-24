import { useAuth } from '../auth/AuthContext';

export default function Home() {
  const { user, logout } = useAuth();
  return (
    <div className="container">
      <h2>Welcome to Skribl</h2>
      <p>Logged in as: {user?.username} ({user?.email})</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
