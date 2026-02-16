import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { useAppDispatch } from './store/hooks';
import { setUser } from './store/authSlice';

// Components
import Navbar from './components/NavBar';
import ProtectedRoute from './components/ProtectedRoute';
// Pages
import Register from './pages/Register';
import Login from './pages/Login';
import CreateBlog from './pages/CreateBlog';
import Home from './pages/Home';
import EditPost from './pages/EditPost';
import PostZoom from './pages/PostZoom';

function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // 1) On app load, get the current session and store the user in Redux
    supabase.auth.getSession().then(({ data: { session } }) => {
      dispatch(setUser(session?.user ?? null));
    });

    // 2) Subscribe to auth state changes to keep Redux in sync on login/logout
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      dispatch(setUser(session?.user ?? null));
    });

    // Clean up subscription when component unmounts
    return () => subscription.unsubscribe();
  }, [dispatch]);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-black">
        {/* Global navigation bar */}
        <Navbar />

        {/* Routes
            - ProtectedRoute wraps routes that require authentication
            - Public routes: /register and /login
        */}
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Home/>} />
            <Route path="/create" element={<CreateBlog />} />
            <Route path="/edit/:id" element={<EditPost />} />
            <Route path="/post/:id" element={<PostZoom />} />
          </Route>

          {/* Public routes */}
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;