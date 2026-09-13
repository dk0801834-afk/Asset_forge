import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeftIcon, CheckCircleIcon, ClockIcon, ArrowDownTrayIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import api from '../utils/api';

const statusConfig = {
  pending: { label: 'Awaiting payment', color: 'text-yellow-400 bg-yellow-500/20' },
  paid: { label: 'Payment received', color: 'text-blue-400 bg-blue-500/20' },
  processing: { label: 'Preparing your files', color: 'text-purple-400 bg-purple-500/20' },
  completed: { label: 'Ready for download', color: 'text-green-400 bg-green-500/20' },
  failed: { label: 'Payment failed', color: 'text-red-400 bg-red-500/20' },
  refunded: { label: 'Refunded', color: 'text-dark-400 bg-dark-700' },
};

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pollCount, setPollCount] = useState(0);

  useEffect(() => {
    api.get(`/orders/${id}`).then((r) => setOrder(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  // Poll for order completion if still processing
  useEffect(() => {
    if (order && ['pending', 'paid', 'processing'].includes(order.status) && pollCount < 15) {
      const timer = setTimeout(() => {
        api.get(`/orders/${id}`).then((r) => {
          setOrder(r.data);
          setPollCount(pollCount + 1);
        }).catch(() => {});
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [order, pollCount, id]);

  if (loading || !order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-dark-800 rounded w-1/3" />
          <div className="h-40 bg-dark-800 rounded-2xl" />
        </div>
      </div>
    );
  }

  const cfg = statusConfig[order.status];
  const isComplete = order.status === 'completed';

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link to="/orders" className="inline-flex items-center gap-2 text-dark-400 hover:text-white mb-8 text-sm font-medium">
        <ArrowLeftIcon className="w-4 h-4" /> Back to orders
      </Link>

      <div className="glass rounded-2xl p-8 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-extrabold mb-1">Order {order.order_number}</h1>
            <p className="text-dark-400 text-sm">
              Placed on {new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold ${cfg.color}`}>
            {isComplete ? <CheckCircleIcon className="w-5 h-5" /> : <ClockIcon className="w-5 h-5 animate-spin" />}
            {cfg.label}
          </span>
        </div>

        {isComplete ? (
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-5 mb-6">
            <div className="flex items-start gap-3">
              <EnvelopeIcon className="w-6 h-6 text-green-400 flex-shrink-0" />
              <div>
                <p className="font-semibold text-green-300 mb-1">Your files are ready!</p>
                <p className="text-sm text-dark-300">A download email has been sent to <strong>{order.customer_email}</strong>. You can also download your purchases directly below. Links expire in 24 hours.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-5 mb-6">
            <div className="flex items-start gap-3">
              <ClockIcon className="w-6 h-6 text-blue-400 flex-shrink-0 animate-pulse" />
              <div>
                <p className="font-semibold text-blue-300 mb-1">Preparing your order</p>
                <p className="text-sm text-dark-300">Your bundles are being packaged. This usually takes 30-60 seconds. This page will auto-update when ready.</p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Items ({order.items?.length})</h2>
          {order.items?.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-4 bg-dark-800/50 rounded-xl">
              <div className="flex-1">
                <Link to={`/bundles/${item.bundle_slug}`} className="font-semibold text-white hover:text-brand-300">
                  {item.bundle_name}
                </Link>
                <p className="text-sm text-dark-400">Qty: {item.quantity}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-bold">${Number(item.price_paid).toFixed(2)}</span>
                {isComplete && item.download_token && (
                  <a
                    href={`${import.meta.env.VITE_API_URL || ''}/api/v1/downloads/${item.download_token}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-400 text-white text-sm font-semibold rounded-lg transition-colors"
                  >
                    <ArrowDownTrayIcon className="w-4 h-4" /> Download
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t border-dark-700 space-y-2 text-sm">
          <div className="flex justify-between text-dark-300"><span>Subtotal</span><span>${Number(order.subtotal).toFixed(2)}</span></div>
          <div className="flex justify-between text-dark-300"><span>Tax</span><span>${Number(order.tax).toFixed(2)}</span></div>
          <div className="flex justify-between text-lg font-bold pt-2 border-t border-dark-700"><span>Total</span><span>${Number(order.total).toFixed(2)}</span></div>
        </div>
      </div>
    </div>
  );
}
