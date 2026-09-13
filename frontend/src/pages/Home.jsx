import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRightIcon,
  SparklesIcon,
  ShieldCheckIcon,
  BoltIcon,
  CubeIcon,
  CloudArrowDownIcon,
} from '@heroicons/react/24/outline';
import api from '../utils/api';
import BundleCard from '../components/BundleCard';

const features = [
  {
    icon: CubeIcon,
    title: 'Premium Quality',
    desc: 'Hand-crafted assets by top-tier designers. Production-ready for any project.',
  },
  {
    icon: BoltIcon,
    title: 'Instant Delivery',
    desc: 'Secure time-limited download links delivered to your inbox within seconds.',
  },
  {
    icon: ShieldCheckIcon,
    title: 'B2B Licensed',
    desc: 'Every bundle comes with a commercial license for unlimited client projects.',
  },
  {
    icon: SparklesIcon,
    title: 'AI Generation',
    desc: 'Generate custom high-resolution assets on-demand with our integrated AI studio.',
  },
];

const categories = [
  { name: '3D Icons', icon: '🎨', slug: '3d-icons' },
  { name: 'Textures', icon: '🧱', slug: 'textures' },
  { name: 'Illustrations', icon: '✏️', slug: 'illustrations' },
  { name: 'UI Kits', icon: '📱', slug: 'ui-kits' },
  { name: 'Typography', icon: '🔤', slug: 'typography' },
  { name: 'Photography', icon: '📷', slug: 'photography' },
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/bundles/featured?limit=8')
      .then((r) => setFeatured(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-sm font-medium mb-6">
                <SparklesIcon className="w-4 h-4" />
                New: AI-powered asset generation
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05] mb-6">
                Creative assets <br />
                for <span className="text-gradient">modern B2B teams</span>
              </h1>
              <p className="text-lg text-dark-300 max-w-xl mb-8 leading-relaxed">
                Production-ready 3D icons, textures, UI kits, and illustrations.
                Delivered instantly. Licensed for business. Generate custom assets with AI.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/bundles"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-brand-500 to-purple-600 hover:from-brand-400 hover:to-purple-500 text-white font-semibold rounded-xl transition-all shadow-xl shadow-brand-500/30"
                >
                  Browse bundles <ArrowRightIcon className="w-5 h-5" />
                </Link>
                <Link
                  to="/ai-generator"
                  className="inline-flex items-center gap-2 px-6 py-3 glass hover:bg-dark-800 text-white font-semibold rounded-xl transition-colors"
                >
                  <SparklesIcon className="w-5 h-5" /> Try AI Generator
                </Link>
              </div>
              <div className="flex items-center gap-6 mt-10 text-sm text-dark-400">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {[0, 1, 2, 3].map((i) => (
                      <div key={i} className={`w-8 h-8 rounded-full border-2 border-dark-950 bg-gradient-to-br ${['from-brand-400 to-purple-500', 'from-pink-400 to-red-500', 'from-cyan-400 to-blue-500', 'from-green-400 to-emerald-500'][i]}`} />
                    ))}
                  </div>
                  <span><strong className="text-white">10,000+</strong> teams trust us</span>
                </div>
              </div>
            </div>

            {/* Hero visual */}
            <div className="relative">
              <div className="relative aspect-square max-w-lg mx-auto">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-500/30 via-purple-500/20 to-pink-500/30 rounded-3xl blur-3xl animate-pulse-slow" />
                <div className="relative grid grid-cols-2 gap-4 h-full">
                  <div className="glass rounded-2xl p-4 animate-float" style={{ animationDelay: '0s' }}>
                    <div className="aspect-square rounded-xl bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-6xl">
                      🎨
                    </div>
                    <p className="mt-3 text-sm font-semibold">3D Icons</p>
                  </div>
                  <div className="glass rounded-2xl p-4 animate-float" style={{ animationDelay: '1s' }}>
                    <div className="aspect-square rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-6xl">
                      🧱
                    </div>
                    <p className="mt-3 text-sm font-semibold">Textures</p>
                  </div>
                  <div className="glass rounded-2xl p-4 animate-float" style={{ animationDelay: '2s' }}>
                    <div className="aspect-square rounded-xl bg-gradient-to-br from-purple-400 to-pink-600 flex items-center justify-center text-6xl">
                      ✏️
                    </div>
                    <p className="mt-3 text-sm font-semibold">Illustrations</p>
                  </div>
                  <div className="glass rounded-2xl p-4 animate-float" style={{ animationDelay: '0.5s' }}>
                    <div className="aspect-square rounded-xl bg-gradient-to-br from-green-400 to-teal-600 flex items-center justify-center text-6xl">
                      📱
                    </div>
                    <p className="mt-3 text-sm font-semibold">UI Kits</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Built for professional teams</h2>
            <p className="text-dark-400 max-w-2xl mx-auto">
              Everything you need to ship faster, look better, and scale without creative bottlenecks.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <div key={f.title} className="glass rounded-2xl p-6 hover:border-brand-500/30 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-brand-500/10 flex items-center justify-center mb-4">
                  <f.icon className="w-6 h-6 text-brand-400" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-dark-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">Browse by category</h2>
              <p className="text-dark-400">Find exactly what you need</p>
            </div>
            <Link to="/bundles" className="hidden sm:inline-flex items-center gap-1 text-brand-400 hover:text-brand-300 font-medium text-sm">
              View all <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((c) => (
              <Link
                key={c.slug}
                to={`/bundles?category=${c.slug}`}
                className="glass rounded-2xl p-6 text-center hover:border-brand-500/30 hover:bg-dark-800/80 transition-all group"
              >
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{c.icon}</div>
                <p className="font-semibold text-sm">{c.name}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured bundles */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">Featured bundles</h2>
              <p className="text-dark-400">Hand-picked for professionals</p>
            </div>
            <Link to="/bundles" className="inline-flex items-center gap-1 text-brand-400 hover:text-brand-300 font-medium text-sm">
              Browse all <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="glass rounded-2xl overflow-hidden animate-pulse">
                  <div className="aspect-[4/3] bg-dark-800" />
                  <div className="p-5 space-y-3">
                    <div className="h-5 bg-dark-700 rounded w-3/4" />
                    <div className="h-4 bg-dark-700 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featured.map((b) => (
                <BundleCard key={b.id} bundle={b} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative glass rounded-3xl p-10 md:p-16 overflow-hidden text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-600/20 via-purple-600/20 to-pink-600/20" />
            <div className="relative">
              <CloudArrowDownIcon className="w-14 h-14 text-brand-400 mx-auto mb-6" />
              <h2 className="text-3xl md:text-5xl font-extrabold mb-4">
                Ready to level up your workflow?
              </h2>
              <p className="text-dark-300 max-w-xl mx-auto mb-8 text-lg">
                Join thousands of teams shipping faster with AssetForge's premium creative library.
              </p>
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-brand-500 to-purple-600 hover:from-brand-400 hover:to-purple-500 text-white font-semibold rounded-xl transition-all shadow-xl shadow-brand-500/30 text-lg"
              >
                Create free account <ArrowRightIcon className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
