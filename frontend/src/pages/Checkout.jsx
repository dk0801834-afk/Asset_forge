import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { TrashIcon, ArrowLeftIcon, CreditCardIcon, ShieldCheckIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useCart } from '../context/CartContext';

export default function Checkout() {
  const { items, removeItem, total, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [paymentConfig, setPaymentConfig] = useState({ enabled: false, publishableKey: '' });
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/payments/config').then((r) => setPaymentConfig(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    // Check for success return
    const params = new URLSearchParams(window.location.search);
    if (params.get('success') === 'true') {
      toast.success('Payment successful! Check your email for download links.');
      clearCart();
      navigate('/orders');
    }
  }, []);

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <p className="text-5xl mb-4">🛒</p>
        <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
        <p className="text-dark-400 mb-8">Browse our collection to find the perfect assets.</p>
        <Link to="/bundles" className="px-6 py-3 bg-brand-500 hover:bg-brand-400 text-white rounded-xl font-semibold inline-flex items-center gap-2">
          <ArrowLeftIcon className="w-5 h-5" /> Browse bundles
        </Link>
      </div>
    );
  }

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/orders/checkout', {
        bundle_ids: items.map((i) => i.id),
      });

      if (paymentConfig.enabled && paymentConfig.publishableKey) {
        const stripe = await loadStripe(paymentConfig.publishableKey);
        if (stripe) {
          const { error } = await stripe.redirectToCheckout({ sessionId: data.session_id });
          if (error) toast.error(error.message);
        } else {
          window.location.href = data.checkout_url;
        }
      } else {
        // Mock / demo mode
        toast.success('Demo mode: Order processed! Check orders page.');
        clearCart();
        navigate('/orders');
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-extrabold mb-8">Checkout</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="glass rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <CreditCardIcon className="w-5 h-5 text-brand-400" /> Your cart ({items.length})
            </h2>
            <div className="divide-y divide-dark-700">
              {items.map((item) => (
                <div key={item.id} className="py-4 flex items-center gap-4">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-dark-800 flex-shrink-0">
                    {item.thumbnail ? (
                      <img src={item.thumbnail} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">🎨</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link to={`/bundles/${item.slug}`} className="font-semibold text-white hover:text-brand-300 line-clamp-1">
                      {item.name}
                    </Link>
                    <p className="text-sm text-dark-400">{item.asset_count} assets</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-white">${item.price.toFixed(2)}</p>
                    <button onClick={() => removeItem(item.id)} className="text-dark-400 hover:text-red-400 mt-1">
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass rounded-2xl p-6">
            <div className="flex items-start gap-3 text-sm text-dark-300">
              <ShieldCheckIcon className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-white mb-1">Secure checkout</p>
                <p>Payments are processed by Stripe with industry-leading encryption. Your payment details never touch our servers.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <div className="glass rounded-2xl p-6 lg:sticky lg:top-24">
            <h2 className="text-lg font-semibold mb-4">Order summary</h2>
            <div className="space-y-3 mb-4 text-sm">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-dark-300">
                  <span className="truncate pr-2">{item.name}</span>
                  <span>${item.price.toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-dark-700 pt-4 space-y-2">
              <div className="flex justify-between text-dark-300">
                <span>Subtotal</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-dark-300">
                <span>Tax</span>
                <span>$0.00</span>
              </div>
              <div className="flex justify-between text-xl font-bold pt-2 border-t border-dark-700">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
            <button
              onClick={handleCheckout}
              disabled={loading || items.length === 0}
              className="w-full mt-6 py-3.5 bg-gradient-to-r from-brand-500 to-purple-600 hover:from-brand-400 hover:to-purple-500 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2"
            >
              <LockClosedIcon className="w-5 h-5" />
              {loading ? 'Processing...' : paymentConfig.enabled ? `Pay $${total.toFixed(2)}` : `Complete order ($${total.toFixed(2)})`}
            </button>
            {!paymentConfig.enabled && (
              <p className="text-xs text-dark-500 text-center mt-3">
                Demo mode: Stripe not configured. Orders will auto-fulfill for testing.
              </p>
            )}
            <Link to="/bundles" className="flex items-center justify-center gap-1 text-dark-400 hover:text-white text-sm mt-4">
              <ArrowLeftIcon className="w-4 h-4" /> Continue shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
