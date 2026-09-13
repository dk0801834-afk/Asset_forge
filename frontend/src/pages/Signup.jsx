import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { BoltIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const [form, setForm] = useState({ email: '', password: '', full_name: '', company_name: '' });
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signup(form.email, form.password, form.full_name, form.company_name);
      toast.success('Account created! Welcome to AssetForge.');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 justify-center mb-6">
            <BoltIcon className="w-8 h-8 text-brand-400" />
            <span className="text-2xl font-extrabold">Asset<span className="text-gradient">Forge</span></span>
          </Link>
          <h1 className="text-3xl font-bold mb-2">Create your account</h1>
          <p className="text-dark-400">Start downloading premium assets in minutes</p>
        </div>

        <div className="glass rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-dark-200 mb-2">Full name</label>
              <input type="text" value={form.full_name} onChange={update('full_name')} required minLength={2}
                className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:border-brand-500"
                placeholder="Jane Smith" />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-200 mb-2">Company <span className="text-dark-500">(optional)</span></label>
              <input type="text" value={form.company_name} onChange={update('company_name')}
                className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:border-brand-500"
                placeholder="Acme Inc." />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-200 mb-2">Work email</label>
              <input type="email" value={form.email} onChange={update('email')} required
                className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:border-brand-500"
                placeholder="you@company.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-200 mb-2">Password</label>
              <input type="password" value={form.password} onChange={update('password')} required minLength={8}
                className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:border-brand-500"
                placeholder="At least 8 characters" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-brand-500 to-purple-600 hover:from-brand-400 hover:to-purple-500 disabled:opacity-50 text-white font-semibold rounded-xl transition-all shadow-lg shadow-brand-500/25 mt-2">
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>
        </div>

        <p className="text-center text-dark-400 mt-6 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
