import { useActionState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { useAppDispatch } from '../store/hooks';
import { setUser } from '../store/authSlice';

// Login page: signs in using Supabase email/password and redirects to home
export default function Login() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Handler used by `useActionState` which receives the FormData
  async function handleLogin(_prevState: any, formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    // Call Supabase sign-in method
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) return { error: error.message };

    dispatch(setUser(data?.session?.user ?? null));

    // On success navigate to home
    navigate('/');
    return { success: true };
  }

  // `useActionState` wires the handler up to the form `action` prop
  const [state, formAction, isPending] = useActionState(handleLogin, null);

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-4">
      {/* Login form */}
      <form action={formAction} className="w-full max-w-md bg-slate-900 p-8 rounded-xl shadow-lg flex flex-col gap-4 border border-gray-700">
        <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-white font-medium">Email</label>
          <input name="email" type="email" required className="text-white border border-slate-500 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-white font-medium">Password</label>
          <input name="password" type="password" required className="text-white border border-slate-500 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>

        <button
          disabled={isPending}
          className="bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition-colors mt-2"
        >
          {isPending ? 'Signing in...' : 'Login'}
        </button>

        {/* Show sign-in errors from the action */}
        {state?.error && <p className="text-red-500 text-center text-sm">{state.error}</p>}

        <p className="text-center text-sm text-gray-300 mt-2">
          Don't have an account? <Link to="/register" className="text-blue-400 hover:underline">Register</Link>
        </p>
      </form>
    </div>
  );
}