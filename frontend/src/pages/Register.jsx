import { useState, useContext } from 'react'; // Added useContext
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import AuthContext from '../context/AuthContext'; // Import your context

const Register = () => {
  const { login } = useContext(AuthContext); // Get the login function
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState(''); // State to show errors on screen instead of alert
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors

    try {
      // 1. Call the backend
      const { data } = await api.post('/auth/register', formData);
      
      // 2. Log the user in immediately using the token returned by the backend
      // data should contain { token, user: { id, username, email } }
      if (data.token) {
        login(data.token, data.user);
        navigate('/dashboard'); // Go straight to the app!
      } else {
        // Fallback if your backend doesn't return a token on registration
        navigate('/login');
      }
    } catch (err) {
      // Capture the specific error (like "Password too short") from the backend
      setError(err.response?.data?.message || 'Registration failed. Try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 animate-fade-in">
      <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 w-96">
        <h2 className="text-3xl font-bold mb-6 text-center text-blue-600">Create Account</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 text-sm rounded-lg border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-1">Username</label>
            <input 
              type="text" 
              placeholder="johndoe"
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-1">Email</label>
            <input 
              type="email" 
              placeholder="name@company.com"
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-1">Password</label>
            <input 
              type="password" 
              placeholder="••••••••"
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />
            <p className="text-xs text-gray-500 mt-1">Must be at least 6 characters.</p>
          </div>

          <button 
            type="submit" 
            className="w-full btn-primary mt-2" // Using the custom class from index.css
          >
            Register Account
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 font-bold hover:underline">
            Login here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;