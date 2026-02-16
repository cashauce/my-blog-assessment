import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

// PostZoom page: shows a single post in full detail and its comments.
// Allows logged-in users to post comments with optional images.
export default function PostZoom() {
  const { id } = useParams();
  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState('');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [commentImage, setCommentImage] = useState<File | null>(null);

  useEffect(() => {
    // 1) Get current user to know if comment form should be shown
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    // 2) Fetch post details and comments for this `id`
    fetchPostAndComments();
  }, [id]);

  // Helper: fetch the post and its comments from Supabase
  async function fetchPostAndComments() {
    setLoading(true);

    // Fetch the post itself, joined with profile email
    const { data: postData } = await supabase
      .from('posts')
      .select('*, profiles(email)')
      .eq('id', id)
      .single();

    // Fetch comments related to the post, newest first
    const { data: commentData } = await supabase
      .from('comments')
      .select('*, profiles(email)')
      .eq('post_id', id)
      .order('created_at', { ascending: false });

    if (postData) setPost(postData);
    if (commentData) setComments(commentData);
    setLoading(false);
  }

  // Handle comment submission: optional image upload, then insert comment
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let uploadedImageUrl = '';

    // Prevent submitting empty comments
    if (!commentText.trim()) return;

    if (!user) {
      alert('You must be logged in to comment!');
      return;
    }

    // If an image is attached, upload it and get public URL
    if (commentImage) {
      const fileName = `${Math.random()}-${commentImage.name}`;
      const { data } = await supabase.storage
        .from('blog-images')
        .upload(fileName, commentImage);
      if (data) {
        const { data: urlData } = supabase.storage
          .from('blog-images')
          .getPublicUrl(data.path);
        uploadedImageUrl = urlData.publicUrl;
      }
    }

    // Insert comment record referencing this post
    const { error } = await supabase
      .from('comments')
      .insert([
        {
          post_id: id,
          content: commentText,
          user_id: user.id,
          user_email: user.email, // store for easy display
          image_url: uploadedImageUrl,
        }
      ]);

    if (error) {
      alert(error.message);
    } else {
      // Clear input and refresh comments
      setCommentText('');
      setCommentImage(null);
      fetchPostAndComments();
    }
  };

  if (loading) return <div className="text-slate-900 p-10 text-center">Loading...</div>;
  if (!post) return <div className="text-slate-900 p-10 text-center">Post not found.</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 text-slate-200">
      {/* Back link */}
      <Link to="/" className="text-blue-400 hover:underline mb-6 inline-block">Back to Feed</Link>

      {/* Post Content: title, author, date, image, body */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold mb-2">{post.title}</h1>
        <div className="mt-4 text-xs text-slate-500">Posted by: {post.profiles?.email || 'Unknown User'}</div>
        <p className="text-slate-400 text-sm mb-6">
          Posted on {new Date(post.created_at).toLocaleDateString()}
          {post.isEdited && <span className="ml-2 text-yellow-500 font-medium">(Edited)</span>}
        </p>

        {/* Optional post image */}
        {post.image_url && (
          <img src={post.image_url} alt="Post" className="w-full h-auto max-h-96 object-cover rounded-xl mb-6 shadow-lg" />
        )}

        <div className="text-lg leading-relaxed whitespace-pre-wrap">{post.content}</div>
      </div>

      <hr className="border-slate-700 mb-10" />

      {/* Comment Section: form for logged-in users and list of comments */}
      <section>
        <h3 className="text-2xl font-bold mb-6">Comments ({comments.length})</h3>

        {user ? (
          <form onSubmit={handleCommentSubmit} className="mb-8">
            <textarea
              className="w-full p-4 rounded-lg bg-slate-900 border border-slate-700 text-white focus:border-blue-500 outline-none transition"
              placeholder="Join the conversation..."
              rows={3}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <div className="flex items-center gap-4 mt-2">
              <label className="cursor-pointer bg-slate-700 p-2 rounded hover:bg-slate-600 transition">
                <span>Add Image</span>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => setCommentImage(e.target.files?.[0] || null)}
                />
              </label>
              <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Post Comment</button>
            </div>
            {commentImage && <p className="text-xs text-green-600">Image selected: {commentImage.name}</p>}
          </form>
        ) : (
          <p className="mb-8 p-4 bg-slate-900 rounded text-slate-400 italic text-center">Please <Link to="/login" className="text-blue-400 underline">login</Link> to leave a comment.</p>
        )}

        <div className="space-y-4">
          {comments.length > 0 ? (
            comments.map((c) => (
              <div key={c.id} className="bg-slate-900 p-4 rounded-lg border border-slate-800">
                <p className="text-blue-400 text-sm font-bold mb-1">{c.user_email?.split('@')[0]}</p>
                <p className="text-slate-200">{c.content}</p>
                {c.image_url && (
                  <div className="mt-2">
                    <img src={c.image_url} alt="Comment attachment" className="rounded-lg max-w-full h-auto border border-gray-100 shadow-sm" />
                  </div>
                )}
                <p className="text-[10px] text-slate-500 mt-2 uppercase tracking-widest">{new Date(c.created_at).toLocaleTimeString()}</p>
              </div>
            ))
          ) : (
            <p className="text-slate-500">No comments yet. Be the first!</p>
          )}
        </div>
      </section>
    </div>
  );
}