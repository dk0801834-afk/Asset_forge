import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../utils/api';

const STATUSES = ['pending', 'paid', 'processing', 'completed', 'failed', 'refunded'];

const statusBadge = (status) => {
  const cfg = {
    completed: 'bg-green-500/20 text-green-400',
    paid: 'bg-blue-500/20 text-blue-400',
    processing: 'bg-purple-500/20 text-purple-400',
    pending: 'bg-yellow-500/20 text-yellow-400',
    failed: 'bg-red-500/20 text-red-400',
    refunded: 'bg-dark-700 text-dark-400',
  };
  return cfg[status] || 'bg-dark-700 text-dark-400';
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => {
    const params = filter ? `?status=${filter}` : '';
    api.get(`/admin/orders${params}`).then((r) => setOrders(r.data)).finally(() => setLoading(false));
  };

  useEffect(load, [filter]);

  const handleRefund = async (id) => {
    if (!confirm('Issue refund for this order?')) return;
    try {
      await api.post(`/admin/orders/${id}/refund`);
      toast.success('Refund processed');
      load();
    } catch (e) {
      toast.error('Refund failed');
    }
  };

  const handleResend = async (id) => {
    try {
      await api.post(`/admin/orders/${id}/resend-download`);
      toast.success('Download email queued');
      load();
    } catch (e) {
      toast.error('Failed to resend');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-extrabold mb-2">Manage Orders</h1>
      <p className="text-dark-400 mb-8">View and manage all customer orders</p>

      <div className="mb-6 flex flex-wrap gap-2">
        <button onClick={() => setFilter('')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${!filter ? 'bg-brand-500 text-white' : 'bg-dark-800 text-dark-300 hover:bg-dark-700'}`}>
          All
        </button>
        {STATUSES.map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${filter === s ? 'bg-brand-500 text-white' : 'bg-dark-800 text-dark-300 hover:bg-dark-700'}`}>
            {s}
          </button>
        ))}
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center"><div className="animate-spin w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full mx-auto" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-dark-800/50">
                <tr className="text-dark-400">
                  <th className="text-left p-4 font-medium">Order</th>
                  <th className="text-left p-4 font-medium">Customer</th>
                  <th className="text-left p-4 font-medium">Items</th>
                  <th className="text-left p-4 font-medium">Total</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Delivery</th>
                  <th className="text-left p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-800">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-dark-800/30">
                    <td className="p-4 font-mono text-xs">{o.order_number}</td>
                    <td className="p-4">
                      <div className="font-medium">{o.customer_name || '—'}</div>
                      <div className="text-dark-500 text-xs">{o.customer_email}</div>
                    </td>
                    <td className="p-4 text-dark-300">{o.items?.length} item(s)</td>
                    <td className="p-4 font-semibold">${Number(o.total).toFixed(2)}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${statusBadge(o.status)}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="p-4 text-xs">
                      <span className={o.email_sent ? 'text-green-400' : 'text-dark-500'}>
                        {o.email_sent ? '✓ Email sent' : '○ Pending'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        {['paid', 'completed'].includes(o.status) && (
                          <button onClick={() => handleResend(o.id)}
                            className="px-3 py-1.5 text-xs bg-dark-700 hover:bg-dark-600 text-white rounded-lg">
                            Resend
                          </button>
                        )}
                        {o.status !== 'refunded' && o.status !== 'pending' && (
                          <button onClick={() => handleRefund(o.id)}
                            className="px-3 py-1.5 text-xs bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg">
                            Refund
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {orders.length === 0 && (
              <div className="p-16 text-center text-dark-500">No orders match this filter.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
