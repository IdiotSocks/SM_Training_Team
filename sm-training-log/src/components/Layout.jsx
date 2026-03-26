import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Layout({ children, title, userRole }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 className="text-2xl font-bold text-gray-900">
              {title || 'Training Log'}
            </h1>
            <div className="hidden sm:flex gap-4">
              {userRole === 'athlete' && (
                <>
                  <a
                    href="/log"
                    className="text-gray-600 hover:text-gray-900 font-medium"
                  >
                    Daily Log
                  </a>
                  <a
                    href="/history"
                    className="text-gray-600 hover:text-gray-900 font-medium"
                  >
                    History
                  </a>
                </>
              )}
              {userRole === 'coach' && (
                <a
                  href="/dashboard"
                  className="text-gray-600 hover:text-gray-900 font-medium"
                >
                  Dashboard
                </a>
              )}
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4 text-center text-gray-500 text-sm">
        <p>Simba Training Log • Built with React & Supabase</p>
      </footer>
    </div>
  );
}
