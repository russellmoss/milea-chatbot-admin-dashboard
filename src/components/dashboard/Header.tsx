import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Header() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  
  async function handleLogout() {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  }
  
  return (
    <header className="bg-white shadow-sm h-16 flex items-center justify-between px-6">
      <h1 className="text-xl font-semibold text-primary">Dashboard</h1>
      
      <div className="flex items-center">
        {currentUser && (
          <>
            <span className="text-sm text-gray-700 mr-4">
              {currentUser.email}
            </span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-darkBrown text-white rounded hover:bg-darkBrownHover transition-colors"
            >
              Log Out
            </button>
          </>
        )}
      </div>
    </header>
  );
}