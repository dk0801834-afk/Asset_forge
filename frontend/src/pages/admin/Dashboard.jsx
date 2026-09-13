import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  UsersIcon,
  CubeIcon,
  ShoppingBagIcon,
  CurrencyDollarIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import api from '../../utils/api';

const statCards = [
  { key: 'total_users', label: 'Customers', icon: UsersIcon, color: 'from-blue-500 to-cyan-500' },
  { key: 'total_bundles', label: 'Active Bundles', icon: CubeIcon, color: 'from-purple-500 to-pink-500' },
  { key: 'paid_orders', label: 'Paid Orders', icon: ShoppingBagIcon, color: 'from-green-500 to-emerald-500' },
  { key: 'total_revenue', label: 'Total Revenue', icon: CurrencyDollarIcon, color: 'from-yellow-500 to-orange-500', prefix: '$' },
];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats').then((r) => setStats(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-extrabold mb-2">Admin Dashboard</h1>
          <p className="text-dark-400">Overview of your AssetForge store</p>
        </div>
        <Link to="/admin/orders" className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-400 text-white rounded-lg font-medium text-sm">
          Manage orders <ArrowRightIcon className="w-4 h-4" />
        </Link>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((s) => (
          <div key={s.key} className="glass rounded-2xl p-6">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-4`}>
              <s.icon className="w-6 h-6 text-white" />
            </div>
            <p className="text-3xl font-extrabold mb-1">
              {loading ? '...' : `${s.prefix || ''}${Number(stats?.[s.key] || 0).toLocaleString(undefined, s.key === 'total_revenue' ? { minimumFractionDigits: 2, maximumFractionDigits: 2 } : {})}`}
            </p>
            <p className="text-dark-400 text-sm">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Recent orders</h2>
          <Link to="/admin/orders" className="text-brand-400 hover:text-brand-300 text-sm font-medium inline-flex items-center gap-1">
            View all <ArrowRightIcon className="w-4 h-4" />
          </Link>
        </div>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-dark-800 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : stats?.recent_orders?.length === 0 ? (
          <p className="text-dark-500 text-center py-8">No orders yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-dark-400 border-b border-dark-700">
                  <th className="text-left py-3 font-medium">Order</th>
                  <th className="text-left py-3 font-medium">Customer</th>
                  <th className="text-left py-3 font-medium">Amount</th>
                  <th className="text-left py-3 font-medium">Status</th>
                  <th className="text-left py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-800">
                {stats?.recent_orders?.map((o) => (
                  <tr key={o.id} className="hover:bg-dark-800/50">
                    <td className="py-3 font-mono text-xs">{o.order_number}</td>
                    <td className="py-3">{o.customer_email || '—'}</td>
                    <td className="py-3 font-semibold">${Number(o.total).toFixed(2)}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        o.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                        o.status === 'paid' ? 'bg-blue-500/20 text-blue-400' :
                        o.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                        o.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                        'bg-dark-700 text-dark-400'
                      }`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="py-3 text-dark-400">
                      {new Date(o.created_at).toLocaleDateString()}
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
