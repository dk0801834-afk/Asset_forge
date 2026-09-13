import { Link } from 'react-router-dom';
import { BoltIcon } from '@heroicons/react/24/solid';

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-dark-800 bg-dark-900/50 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <BoltIcon className="w-6 h-6 text-brand-400" />
              <span className="text-lg font-extrabold">
                Asset<span className="text-gradient">Forge</span>
              </span>
            </Link>
            <p className="text-sm text-dark-400 max-w-xs">
              Premium B2B creative asset bundles for modern design and development teams.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Product</h3>
            <ul className="space-y-2">
              <li><Link to="/bundles" className="text-sm text-dark-400 hover:text-white">All Bundles</Link></li>
              <li><Link to="/ai-generator" className="text-sm text-dark-400 hover:text-white">AI Generator</Link></li>
              <li><a href="#" className="text-sm text-dark-400 hover:text-white">Pricing</a></li>
              <li><a href="#" className="text-sm text-dark-400 hover:text-white">License</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Company</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-dark-400 hover:text-white">About</a></li>
              <li><a href="#" className="text-sm text-dark-400 hover:text-white">Blog</a></li>
              <li><a href="#" className="text-sm text-dark-400 hover:text-white">Careers</a></li>
              <li><a href="#" className="text-sm text-dark-400 hover:text-white">Contact</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Support</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-dark-400 hover:text-white">Help Center</a></li>
              <li><a href="#" className="text-sm text-dark-400 hover:text-white">Documentation</a></li>
              <li><a href="#" className="text-sm text-dark-400 hover:text-white">Privacy</a></li>
              <li><a href="#" className="text-sm text-dark-400 hover:text-white">Terms</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-dark-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-dark-500">© 2026 AssetForge. All rights reserved.</p>
          <p className="text-xs text-dark-600">Built for creators, by creators.</p>
        </div>
      </div>
    </footer>
  );
}
