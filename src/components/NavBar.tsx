import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAppSelector } from '../store/hooks';
import { useAppDispatch } from '../store/hooks';
import { setUser } from '../store/authSlice';


// Global navigation bar. Shows different links depending on auth state.
export default function Navbar() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  // Grab the auth state from Redux
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  // Logout by calling Supabase signOut; auth listener in App will update Redux
  const handleLogout = async () => {
    await supabase.auth.signOut();
    dispatch(setUser(null));
    navigate('/login');

  };

  return (
    <nav className="sticky top-0 z-10 flex items-center justify-between p-4 bg-slate-900 text-white shadow-md">
      {/* Logo / home link */}
      <Link to="/" className="text-xl font-bold tracking-tight">MyBlog<span className="text-blue-400">.</span></Link>

      <div className="flex items-center gap-6 position">
        {/* If authenticated, show Home and New Post actions */}
        {isAuthenticated && (
          <>
            <Link to="/" className="hover:text-blue-400 transition-colors">Home</Link>
            <Link
              to="/create"
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors"
            >
              + New Post
            </Link>
          </>
        )}

        {/* Right side: user info + auth actions */}
        {isAuthenticated ? (
          <>
            <span className="text-sm text-slate-400">Hi, {user?.email}</span>
            <button
              onClick={handleLogout}
              className="bg-red-500/10 text-red-400 border border-red-500/50 px-3 py-1 rounded-lg hover:bg-red-500 hover:text-white transition-all text-sm"
            >
              Logout
            </button>
          </>
        ) : (
          <div className="flex gap-4">
            <Link to="/login" className="px-4 py-1 hover:text-blue-400 transition-colors">Login</Link>
            <Link to="/register" className="bg-blue-600 px-4 py-1 rounded-lg hover:bg-blue-700 transition-colors">Sign Up</Link>
          </div>
        )}
      </div>
    </nav>
  );
}