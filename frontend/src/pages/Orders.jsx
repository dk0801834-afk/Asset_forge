import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ClockIcon, CheckCircleIcon, ArrowRightIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import api from '../utils/api';

const statusConfig = {
  pending: { label: 'Pending', color: 'text-yellow-400 bg-yellow-500/20', icon: ClockIcon },
  paid: { label: 'Processing', color: 'text-blue-400 bg-blue-500/20', icon: ClockIcon },
  processing: { label: 'Preparing', color: 'text-purple-400 bg-purple-500/20', icon: ClockIcon },
  completed: { label: 'Completed', color: 'text-green-400 bg-green-500/20', icon: CheckCircleIcon },
  failed: { label: 'Failed', color: 'text-red-400 bg-red-500/20', icon: ClockIcon },
  refunded: { label: 'Refunded', color: 'text-dark-400 bg-dark-700', icon: ClockIcon },
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders').then((r) => setOrders(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-extrabold mb-8">My Orders</h1>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass rounded-2xl p-6 animate-pulse">
              <div className="h-6 bg-dark-800 rounded w-1/4 mb-3" />
              <div className="h-4 bg-dark-800 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="glass rounded-2xl p-16 text-center">
          <DocumentArrowDownIcon className="w-16 h-16 text-dark-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No orders yet</h2>
          <p className="text-dark-400 mb-6">Start browsing our collection of premium assets.</p>
          <Link to="/bundles" className="px-6 py-3 bg-brand-500 hover:bg-brand-400 text-white rounded-xl font-semibold inline-flex items-center gap-2">
            Browse bundles <ArrowRightIcon className="w-5 h-5" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const cfg = statusConfig[order.status] || statusConfig.pending;
            const StatusIcon = cfg.icon;
            const isComplete = order.status === 'completed';
            return (
              <Link
                key={order.id}
                to={`/orders/${order.id}`}
                className="block glass rounded-2xl p-6 hover:border-brand-500/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <p className="text-sm text-dark-400 mb-1">Order {order.order_number}</p>
                    <p className="text-xs text-dark-500">{new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${cfg.color}`}>
                    <StatusIcon className="w-4 h-4" /> {cfg.label}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {order.items?.map((item) => (
                    <span key={item.id} className="px-2.5 py-1 bg-dark-800 text-dark-200 text-xs rounded-lg">
                      {item.bundle_name}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-dark-700">
                  <span className="text-lg font-bold">${Number(order.total).toFixed(2)}</span>
                  <span className="text-brand-400 text-sm font-medium inline-flex items-center gap-1">
                    {isComplete ? 'View downloads' : 'View details'} <ArrowRightIcon className="w-4 h-4" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
