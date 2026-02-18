import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import type { User } from '@supabase/supabase-js';

// Home page component
// - Lists latest blog posts
// - Handles pagination
// - Shows "Edit" link for posts owned by the current user

// Define the shape of a Post returned from Supabase
interface Post {
  id: string;
  title: string;
  content: string;
  image_url: string;
  created_at: string;
  user_id: string;
  profiles?: { email: string };
}

export default function Home() {
  // Component state
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [page, setPage] = useState(0);
  const POSTS_PER_PAGE = 4; // number of posts per page

  useEffect(() => {
    // Fetch the current user and a page of posts from Supabase
    const checkUserAndFetch = async () => {
      // Start loading
      setLoading(true);

      // 1) Get the currently logged-in user (if any). We use this
      //    to show user-specific actions like editing their posts.
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      // 2) Calculate pagination range for Supabase `.range(from, to)`
      const from = page * POSTS_PER_PAGE;
      const to = from + POSTS_PER_PAGE - 1;

      // 3) Fetch posts with their profile email joined in
      const { data, error } = await supabase
        .from('posts')
        .select('*, profiles(email)')
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) {
        // Log database errors to help debugging
        console.error('DATABASE ERROR:', error.message);
      } else {
        setPosts(data || []);
      }

      // Done loading
      setLoading(false);
    };

    checkUserAndFetch(); // Trigger fetch when `page` changes
  }, [page]);

  if (loading) return <div className="p-8 text-center text-slate-400">Loading posts...</div>;

  return (
    <div className="max-w-4xl mx-auto pt-24 px-4 space-y-4">
      {/* Page heading */}
      <h1 className="text-3xl font-bold mb-8 text-white">Latest Stories</h1>

      {/* Posts list: iterate over fetched posts */}
      {posts.map((post) => (
        <div key={post.id} className="p-6 bg-gray-900 border border-gray-800 rounded-lg hover:border-gray-700 transition">
          {/* Header row: title, optional image indicator, and date */}
          <div className="flex justify-between items-start mb-2">
            <div className="flex flex-col gap-1">
              <h2 className="text-xl font-semibold text-white">{post.title}</h2>
              {/* Small indicator if an image is attached */}
              {post.image_url && (
                <span className="flex items-center gap-1 text-gray-500 text-xs italic">Image Attached</span>
              )}
            </div>

            {/* Post date */}
            <span className="text-xs text-gray-500">{new Date(post.created_at).toLocaleDateString()}</span>
          </div>

          {/* Post excerpt */}
          <p className="text-gray-400 line-clamp-2 mb-4">{post.content}</p>

          {/* Footer row: author email and action links */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-blue-400">{post.profiles?.email}</span>
            <div className="flex gap-4">
              {/* Read More always visible */}
              <Link to={`/post/${post.id}`} className="text-sm font-medium hover:underline text-blue-400">Read More</Link>

              {/* Edit link only for post owner */}
              {user && user.id === post.user_id && (
                <Link to={`/edit/${post.id}`} className="text-sm font-medium hover:underline text-yellow-400">Edit</Link>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Pagination Controls: previous / next */}
      <div className="flex justify-center items-center gap-6 py-10">
        <button
          onClick={() => setPage(p => Math.max(0, p - 1))}
          disabled={page === 0}
          className="px-4 py-2 bg-gray-800 rounded disabled:opacity-30 text-white font-bold"
        >
          Previous
        </button>
        <span className="text-sm text-white">Page {page + 1}</span>
        <button
          onClick={() => setPage(p => p + 1)}
          disabled={posts.length < POSTS_PER_PAGE}
          className="px-4 py-2 bg-slate-500 rounded disabled:opacity-30 font-bold text-white"
        >
          Next
        </button>
      </div>
    </div>
  );
}