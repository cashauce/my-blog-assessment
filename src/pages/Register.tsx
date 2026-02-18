import { useActionState } from 'react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../store/hooks';
import { setUser } from '../store/authSlice';

// Registration page: collects email+password and calls Supabase signUp.
// Uses `useActionState` helper to integrate with the app's form action flow.
export default function Register() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Form handler used by `useActionState`.
  // Receives `FormData` from the form and calls Supabase signUp.
  async function handleRegister(_prevState: any, formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    // Call Supabase auth sign-up
    const { data, error } = await supabase.auth.signUp({ email, password });

    // If there's an error, return it to be shown in the UI
    if (error) return { error: error.message };

    // On successful sign-up, the user is automatically signed in.
    // We need to update our Redux store with the new user info.
    dispatch(setUser(data?.user ?? null));

    // On success navigate to home (note: path must be "/")
    navigate('/');
    return { success: 'Account created! You are now logged in.' };
  }

  // `useActionState` returns the form state, an action-bound `formAction` and a pending flag
  const [state, formAction, isPending] = useActionState(handleRegister, null);

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-4">
      {/* Registration form */}
      <form action={formAction} className="w-full max-w-md bg-slate-900 p-8 rounded-xl shadow-lg flex flex-col gap-4 border border-gray-700">
        <h2 className="text-3xl font-bold text-white">Create Account</h2>

        <div className="flex flex-col gap-1">
          <label className="text-white text-sm font-medium">Email</label>
          <input name="email" type="email" required className="text-white border border-slate-500 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-white text-sm font-medium">Password</label>
          <input name="password" type="password" required className="text-white border border-slate-500 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>

        <button
          disabled={isPending}
          className="bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
        >
          {isPending ? 'Processing...' : 'Register'}
        </button>

        {/* Show success / error messages returned from the action */}
        {state?.error && <p className="text-red-500 text-center text-sm">{state.error}</p>}
        {state?.success && <p className="text-green-600 text-center text-sm">{state.success}</p>}

        <p className="text-center text-sm text-gray-300 mt-2">
          Already have an account? <Link to="/login" className="text-blue-400 hover:underline">Log in</Link>
        </p>
      </form>
    </div>
  );
}