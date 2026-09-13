import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  CheckIcon,
  ShoppingCartIcon,
  ArrowLeftIcon,
  ShieldCheckIcon,
  CubeIcon,
  DocumentIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function BundleDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addItem, items } = useCart();
  const { user } = useAuth();
  const [bundle, setBundle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    api.get(`/bundles/by-slug/${slug}`)
      .then((r) => setBundle(r.data))
      .catch(() => setBundle(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse">
          <div className="aspect-[2/1] bg-dark-800 rounded-3xl mb-8" />
          <div className="h-10 bg-dark-800 rounded w-1/2 mb-4" />
          <div className="h-5 bg-dark-800 rounded w-3/4 mb-8" />
        </div>
      </div>
    );
  }

  if (!bundle) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <p className="text-5xl mb-4">😕</p>
        <h1 className="text-2xl font-bold mb-2">Bundle not found</h1>
        <p className="text-dark-400 mb-8">The bundle you're looking for doesn't exist or has been removed.</p>
        <Link to="/bundles" className="px-6 py-3 bg-brand-500 hover:bg-brand-400 text-white rounded-xl font-semibold inline-flex items-center gap-2">
          <ArrowLeftIcon className="w-5 h-5" /> Back to bundles
        </Link>
      </div>
    );
  }

  const discount = bundle.compare_at_price
    ? Math.round((1 - Number(bundle.price) / Number(bundle.compare_at_price)) * 100)
    : 0;
  const inCart = items.find((i) => i.id === bundle.id);
  const allImages = [bundle.thumbnail_url, ...(bundle.preview_images || [])].filter(Boolean);

  const handleBuyNow = () => {
    if (!user) {
      toast.error('Please sign in to purchase');
      navigate('/login', { state: { from: `/bundles/${slug}` } });
      return;
    }
    if (!inCart) addItem(bundle);
    navigate('/checkout');
  };

  const handleAddToCart = () => {
    addItem(bundle);
    toast.success('Added to cart!');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <Link to="/bundles" className="inline-flex items-center gap-2 text-dark-400 hover:text-white mb-8 text-sm font-medium">
        <ArrowLeftIcon className="w-4 h-4" /> Back to all bundles
      </Link>

      <div className="grid lg:grid-cols-5 gap-10">
        <div className="lg:col-span-3">
          <div className="glass rounded-2xl overflow-hidden aspect-video bg-dark-800 mb-4">
            <img src={allImages[activeImage]} alt={bundle.name} className="w-full h-full object-cover" />
          </div>
          {allImages.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {allImages.map((img, i) => (
                <button key={i} onClick={() => setActiveImage(i)} className={`aspect-video rounded-xl overflow-hidden border-2 transition-all ${i === activeImage ? 'border-brand-500' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          <div className="mt-10 glass rounded-2xl p-8">
            <h2 className="text-2xl font-bold mb-4">About this bundle</h2>
            <p className="text-dark-300 leading-relaxed whitespace-pre-line">{bundle.long_description || bundle.description}</p>

            {bundle.features?.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">What's included</h3>
                <ul className="grid md:grid-cols-2 gap-3">
                  {bundle.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-3 text-dark-200">
                      <CheckIcon className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="lg:sticky lg:top-24 space-y-6">
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-3">
                {bundle.is_featured && (
                  <span className="px-2.5 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-bold rounded-full">⭐ Featured</span>
                )}
                <span className="text-sm text-dark-400">{bundle.category?.name}</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold mb-2">{bundle.name}</h1>
              {bundle.tagline && <p className="text-dark-400 mb-6">{bundle.tagline}</p>}

              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-4xl font-extrabold">${Number(bundle.price).toFixed(2)}</span>
                {bundle.compare_at_price && (
                  <>
                    <span className="text-xl text-dark-500 line-through">${Number(bundle.compare_at_price).toFixed(2)}</span>
                    <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-sm font-bold rounded-md">Save {discount}%</span>
                  </>
                )}
              </div>

              <div className="space-y-3 mb-6">
                <button onClick={handleBuyNow} className="w-full py-3.5 bg-gradient-to-r from-brand-500 to-purple-600 hover:from-brand-400 hover:to-purple-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2">
                  <SparklesIcon className="w-5 h-5" /> Buy now
                </button>
                <button onClick={inCart ? () => navigate('/checkout') : handleAddToCart} className={`w-full py-3.5 font-semibold rounded-xl transition-all flex items-center justify-center gap-2 ${inCart ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'glass hover:bg-dark-700 text-white border border-dark-600'}`}>
                  {inCart ? (<><CheckIcon className="w-5 h-5" /> View in cart</>) : (<><ShoppingCartIcon className="w-5 h-5" /> Add to cart</>)}
                </button>
              </div>

              <div className="space-y-3 pt-4 border-t border-dark-700">
                <div className="flex items-center gap-3 text-sm text-dark-300">
                  <CubeIcon className="w-5 h-5 text-brand-400" />
                  <span><strong className="text-white">{bundle.asset_count}+</strong> assets included</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-dark-300">
                  <DocumentIcon className="w-5 h-5 text-brand-400" />
                  <span>Formats: <strong className="text-white">{bundle.file_formats?.join(', ')}</strong></span>
                </div>
                <div className="flex items-center gap-3 text-sm text-dark-300">
                  <ShieldCheckIcon className="w-5 h-5 text-brand-400" />
                  <span><strong className="text-white">B2B license</strong> included</span>
                </div>
              </div>
            </div>

            {bundle.tags?.length > 0 && (
              <div className="glass rounded-2xl p-6">
                <h3 className="text-sm font-semibold text-dark-300 mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {bundle.tags.map((t) => (
                    <span key={t} className="px-3 py-1 bg-dark-800 text-dark-300 text-xs rounded-lg">{t}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="glass rounded-2xl p-6 bg-gradient-to-br from-brand-600/10 to-purple-600/10 border-brand-500/20">
              <p className="text-sm text-dark-300">
                <strong className="text-white">⚡ Instant delivery</strong><br/>
                After purchase you'll receive a secure download link via email, valid for 24 hours.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
