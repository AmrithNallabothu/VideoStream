import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Import Link
import AuthContext from '../context/AuthContext';
import api from '../api/axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 1. Send Login Request
      const { data } = await api.post('/auth/login', { email, password });
      
      // 2. Save Token & User via Context
      login(data.token, data.user);
      
      // 3. Redirect to Dashboard
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">Login</h2>
        
        {error && <div className="bg-red-100 text-red-600 p-2 rounded mb-4 text-sm">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Email</label>
            <input 
              type="email" 
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Password</label>
            <input 
              type="password" 
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition">
            Login
          </button>
        </form>

        {/* 👇 NEW REGISTRATION LINK 👇 */}
        <div className="mt-4 text-center text-sm">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 hover:underline font-semibold">
              Register here
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default Login;