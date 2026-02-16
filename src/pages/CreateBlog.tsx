import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAppSelector } from '../store/hooks';
import { useNavigate } from 'react-router-dom';

// Page to create a new blog post. Handles optional image upload
// and then inserts the post record into Supabase.
export default function CreateBlog() {
  const { user } = useAppSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Form submit handler: uploads image (if provided) then inserts post
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    // 1) Collect values from the form
    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const file = formData.get('image') as File;

    // Prepare a string that will hold the public URL (if we upload an image)
    let image_url = "";

    // 2) If a file was selected, upload it to Supabase Storage
    if (file && file.size > 0) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('blog-images')
        .upload(fileName, file);

      // Log upload errors to help debugging
      if (uploadError) {
        console.error('Upload Error:', uploadError.message);
      }

      // If upload succeeded, get the public URL for the uploaded file
      if (uploadData) {
        const { data } = supabase.storage
          .from('blog-images')
          .getPublicUrl(fileName);

        // Assign the public URL string to `image_url` so the DB insert can use it
        image_url = data.publicUrl;
      }
    }

    // 3) Insert the new post (title, content, optional image URL, and current user id)
    const { error } = await supabase.from('posts').insert([
      {
        title,
        content,
        image_url,
        user_id: user?.id,
      }
    ]);

    setLoading(false);

    if (!error) alert('Blog posted!');
    // Navigate back to home after posting
    navigate('/');
  };

  return (
    // Create post form: title, content and optional image
    <form onSubmit={handleSubmit} className="p-8 max-w-2xl mx-auto flex flex-col gap-4">
      <div className="font-bold text-white text-center text-4xl">Create New Blog Post</div>
      <input name="title" placeholder="Title" className="border border-slate-700 p-2 rounded bg-slate-900 text-white" required />
      <textarea name="content" placeholder="Content" className="border border-slate-700 p-2 rounded h-40 bg-slate-900 text-white" required />
      <input type="file" name="image" accept="image/*" className="border border-slate-700 p-2 bg-slate-900 text-white rounded" />
      <button disabled={loading} className="bg-blue-600 text-white p-2 rounded">
        {loading ? 'Posting...' : 'Publish Blog'}
      </button>
    </form>
  );
}