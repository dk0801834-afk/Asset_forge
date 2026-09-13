import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../utils/api';

const roleBadge = (role) => role === 'admin'
  ? 'bg-purple-500/20 text-purple-400'
  : 'bg-blue-500/20 text-blue-400';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    api.get('/admin/users').then((r) => setUsers(r.data)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const toggleRole = async (user) => {
    try {
      const newRole = user.role === 'admin' ? 'customer' : 'admin';
      await api.patch(`/admin/users/${user.id}`, { role: newRole });
      toast.success(`Role updated to ${newRole}`);
      load();
    } catch (e) {
      toast.error('Failed to update');
    }
  };

  const toggleActive = async (user) => {
    try {
      await api.patch(`/admin/users/${user.id}`, { is_active: !user.is_active });
      toast.success(user.is_active ? 'User deactivated' : 'User activated');
      load();
    } catch (e) {
      toast.error('Failed to update');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-extrabold mb-2">Manage Users</h1>
      <p className="text-dark-400 mb-8">View and manage user accounts</p>

      <div className="glass rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center"><div className="animate-spin w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full mx-auto" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-dark-800/50">
                <tr className="text-dark-400">
                  <th className="text-left p-4 font-medium">Name</th>
                  <th className="text-left p-4 font-medium">Email</th>
                  <th className="text-left p-4 font-medium">Company</th>
                  <th className="text-left p-4 font-medium">Role</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Joined</th>
                  <th className="text-left p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-800">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-dark-800/30">
                    <td className="p-4 font-medium">{u.full_name}</td>
                    <td className="p-4 text-dark-300">{u.email}</td>
                    <td className="p-4 text-dark-400">{u.company_name || '—'}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${roleBadge(u.role)}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${u.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {u.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4 text-dark-500 text-xs">{new Date(u.created_at).toLocaleDateString()}</td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button onClick={() => toggleRole(u)}
                          className="px-3 py-1.5 text-xs bg-dark-700 hover:bg-dark-600 text-white rounded-lg">
                          {u.role === 'admin' ? 'Demote' : 'Promote'}
                        </button>
                        <button onClick={() => toggleActive(u)}
                          className={`px-3 py-1.5 text-xs rounded-lg ${u.is_active ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400' : 'bg-green-500/20 hover:bg-green-500/30 text-green-400'}`}>
                          {u.is_active ? 'Disable' : 'Enable'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
