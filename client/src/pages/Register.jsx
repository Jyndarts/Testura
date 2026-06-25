import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleClick = async () => {
    try {
      setError('');
      await register({ name, email, password });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-paper">
      <div className="bg-card border border-line rounded-xl p-5 w-full max-w-sm">
        <h1 className="text-[20px] font-display font-medium text-ink mb-6 text-center">
          Register
        </h1>
        {error && (
          <p className="text-xs font-mono text-fail mb-4 text-center">{error}</p>
        )}
        <input
          className="w-full border border-line rounded-lg px-3 py-2 mb-3 text-sm font-body text-ink bg-card placeholder:text-muted/60 focus:outline-none focus:border-ink transition-colors"
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="w-full border border-line rounded-lg px-3 py-2 mb-3 text-sm font-body text-ink bg-card placeholder:text-muted/60 focus:outline-none focus:border-ink transition-colors"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="w-full border border-line rounded-lg px-3 py-2 mb-4 text-sm font-body text-ink bg-card placeholder:text-muted/60 focus:outline-none focus:border-ink transition-colors"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          className="w-full bg-ink text-paper py-2 rounded-lg text-sm font-body font-medium hover:opacity-90 transition-opacity"
          onClick={handleClick}
        >
          Register
        </button>
        <p className="text-sm font-body text-muted text-center mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-ink underline underline-offset-2">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
