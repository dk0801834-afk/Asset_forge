import { Link } from 'react-router-dom';
import { ShoppingCartIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useCart } from '../context/CartContext';
import clsx from 'clsx';

export default function BundleCard({ bundle }) {
  const { items, addItem } = useCart();
  const inCart = items.find((i) => i.id === bundle.id);

  const discount = bundle.compare_at_price
    ? Math.round((1 - Number(bundle.price) / Number(bundle.compare_at_price)) * 100)
    : 0;

  return (
    <div className="group relative glass rounded-2xl overflow-hidden hover:border-brand-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-brand-500/10 hover:-translate-y-1">
      {bundle.is_featured && (
        <div className="absolute top-3 left-3 z-10 px-2.5 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold rounded-full">
          ⭐ Featured
        </div>
      )}
      {discount > 0 && (
        <div className="absolute top-3 right-3 z-10 px-2.5 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
          -{discount}%
        </div>
      )}

      <Link to={`/bundles/${bundle.slug}`} className="block overflow-hidden aspect-[4/3] bg-dark-800">
        {bundle.thumbnail_url ? (
          <img
            src={bundle.thumbnail_url}
            alt={bundle.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-600/30 to-purple-600/30">
            <span className="text-5xl">🎨</span>
          </div>
        )}
      </Link>

      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <Link to={`/bundles/${bundle.slug}`}>
            <h3 className="font-semibold text-white group-hover:text-brand-300 transition-colors line-clamp-1">
              {bundle.name}
            </h3>
          </Link>
        </div>

        {bundle.tagline && (
          <p className="text-sm text-dark-400 line-clamp-2 mb-3">{bundle.tagline}</p>
        )}

        <div className="flex flex-wrap gap-1.5 mb-4">
          {bundle.file_formats?.slice(0, 3).map((fmt) => (
            <span
              key={fmt}
              className="px-2 py-0.5 text-xs font-medium bg-dark-700 text-dark-300 rounded-md"
            >
              {fmt}
            </span>
          ))}
          {bundle.file_formats?.length > 3 && (
            <span className="px-2 py-0.5 text-xs font-medium bg-dark-700 text-dark-400 rounded-md">
              +{bundle.file_formats.length - 3}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">${Number(bundle.price).toFixed(0)}</span>
            {bundle.compare_at_price && (
              <span className="text-sm text-dark-500 line-through">
                ${Number(bundle.compare_at_price).toFixed(0)}
              </span>
            )}
          </div>
          <button
            onClick={() => addItem(bundle)}
            disabled={!!inCart}
            className={clsx(
              'p-2.5 rounded-xl transition-all',
              inCart
                ? 'bg-green-500/20 text-green-400'
                : 'bg-brand-500 hover:bg-brand-400 text-white shadow-lg shadow-brand-500/25'
            )}
          >
            {inCart ? <CheckIcon className="w-5 h-5" /> : <ShoppingCartIcon className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
