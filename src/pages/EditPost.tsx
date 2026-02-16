import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

// EditPost page: fetches a single post by id and allows the owner
// to update title/content, replace the image, or delete the post.
export default function EditPost() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [newImage, setNewImage] = useState<File | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState(''); // holds the existing image URL

  // Fetch the post data when component mounts (or id changes)
  useEffect(() => {
    async function fetchPost() {
      console.log('Fetching data for ID:', id);
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Supabase Error:', error.message);
      } else if (data) {
        // Populate form fields with fetched data
        console.log('Found post:', data.title);
        setTitle(data.title);
        setContent(data.content);
        setCurrentImageUrl(data.image_url);
      }
      setLoading(false);
    }
    fetchPost();
  }, [id]);

  // Update handler: optionally uploads a new image and updates the post
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    // Start with the existing image URL as the final URL
    let finalImageUrl = currentImageUrl;

    // If a new image was selected, upload it and update the final URL
    if (newImage) {
      const fileExt = newImage.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `post-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('blog-images')
        .upload(filePath, newImage);

      if (!uploadError) {
        const { data } = supabase.storage.from('blog-images').getPublicUrl(filePath);
        finalImageUrl = data.publicUrl; // set to newly uploaded image
      }
    }

    // Persist the updated fields to the DB
    const { error } = await supabase
      .from('posts')
      .update({ title, content, image_url: finalImageUrl, is_edited: true })
      .eq('id', id);

    if (error) alert(error.message);
    else navigate('/');
  };

  // Delete handler: confirm then delete the post
  const handleDelete = async () => {
    const confirmDelete = window.confirm('Are you sure you want to delete this post?');
    if (confirmDelete) {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', id);

      if (!error) {
        alert('Post deleted.');
        navigate('/');
      }
    }
  };

  if (loading) return <div className="p-10 text-white text-center">Loading post details...</div>;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-slate-800 rounded-lg mt-10 text-white">

      {/* Edit form header */}
      <h2 className="text-2xl font-bold mb-4">Edit Post</h2>
      <form onSubmit={handleUpdate} className="space-y-4">
        <div>
          <label className="block mb-1">Title</label>
          <input
            className="w-full p-2 rounded bg-slate-700 border border-slate-600"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div>
          <label className="block mb-1">Content</label>
          <textarea
            className="w-full p-2 rounded bg-slate-700 border border-slate-600 h-40"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        {/* Current Image preview */}
        <div className="mb-4">
          <label className="block mb-2 font-bold">Current Image</label>
          {currentImageUrl && (
            <img src={currentImageUrl} alt="Current" className="w-40 h-auto rounded mb-2 opacity-50" />
          )}

          {/* Replace Image input */}
          <label className="block mb-2 text-sm text-slate-400">Replace Image (Optional):</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setNewImage(e.target.files ? e.target.files[0] : null)}
            className="block w-full text-sm text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded file:bg-slate-700 file:text-white file:border-0 hover:file:bg-slate-600 cursor-pointer"
          />
        </div>

        {/* Actions: Save, Cancel, Delete */}
        <div className="flex gap-4">
          <button type="submit" className="bg-blue-600 px-6 py-2 rounded font-bold hover:bg-blue-700">Save Changes</button>
          <button type="button" onClick={() => navigate('/')} className="bg-slate-600 px-6 py-2 rounded font-bold hover:bg-slate-500">Cancel</button>
          <button type="button" onClick={handleDelete} className="bg-red-600 px-4 py-2 rounded text-white font-bold ml-4">Delete Post</button>
        </div>
      </form>
    </div>
  );
}