import { useState, Fragment } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, Transition } from '@headlessui/react';
import {
  ShoppingCartIcon,
  UserCircleIcon,
  BoltIcon,
  SparklesIcon,
  XMarkIcon,
  Bars3Icon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import clsx from 'clsx';

const navLinks = [
  { to: '/bundles', label: 'Browse Bundles' },
  { to: '/ai-generator', label: 'AI Generator' },
];

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-dark-950/80 border-b border-dark-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative">
              <BoltIcon className="w-8 h-8 text-brand-400 group-hover:text-brand-300 transition-colors" />
              <SparklesIcon className="w-3 h-3 text-yellow-400 absolute -top-0.5 -right-0.5" />
            </div>
            <span className="text-xl font-extrabold tracking-tight">
              Asset<span className="text-gradient">Forge</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  clsx(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'text-white bg-dark-800'
                      : 'text-dark-300 hover:text-white hover:bg-dark-800/60'
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <Link
              to="/checkout"
              className="relative p-2 rounded-lg text-dark-300 hover:text-white hover:bg-dark-800 transition-colors"
            >
              <ShoppingCartIcon className="w-6 h-6" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-brand-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>

            {user ? (
              <Menu as="div" className="relative">
                <Menu.Button className="flex items-center gap-2 px-3 py-2 rounded-lg text-dark-300 hover:text-white hover:bg-dark-800 transition-colors">
                  <UserCircleIcon className="w-6 h-6" />
                  <span className="hidden sm:inline text-sm font-medium">
                    {user.full_name?.split(' ')[0]}
                  </span>
                </Menu.Button>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 mt-2 w-56 glass rounded-xl shadow-2xl py-2 z-50">
                    <div className="px-4 py-2 border-b border-dark-700">
                      <p className="text-sm font-semibold text-white">{user.full_name}</p>
                      <p className="text-xs text-dark-400 truncate">{user.email}</p>
                    </div>
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          to="/orders"
                          className={clsx(
                            'block px-4 py-2 text-sm',
                            active ? 'bg-dark-700 text-white' : 'text-dark-200'
                          )}
                        >
                          My Orders
                        </Link>
                      )}
                    </Menu.Item>
                    {isAdmin && (
                      <>
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              to="/admin"
                              className={clsx(
                                'block px-4 py-2 text-sm',
                                active ? 'bg-dark-700 text-white' : 'text-dark-200'
                              )}
                            >
                              Admin Dashboard
                            </Link>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              to="/admin/orders"
                              className={clsx(
                                'block px-4 py-2 text-sm',
                                active ? 'bg-dark-700 text-white' : 'text-dark-200'
                              )}
                            >
                              Manage Orders
                            </Link>
                          )}
                        </Menu.Item>
                      </>
                    )}
                    <div className="border-t border-dark-700 mt-1 pt-1">
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={handleLogout}
                            className={clsx(
                              'w-full text-left px-4 py-2 text-sm text-red-400',
                              active ? 'bg-dark-700' : ''
                            )}
                          >
                            Sign out
                          </button>
                        )}
                      </Menu.Item>
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-dark-200 hover:text-white transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 text-sm font-semibold bg-gradient-to-r from-brand-500 to-purple-600 hover:from-brand-400 hover:to-purple-500 text-white rounded-lg transition-all shadow-lg shadow-brand-500/25"
                >
                  Get started
                </Link>
              </div>
            )}

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg text-dark-300 hover:text-white hover:bg-dark-800"
            >
              {mobileOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-dark-800 bg-dark-900">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  clsx(
                    'block px-4 py-2 rounded-lg text-sm font-medium',
                    isActive
                      ? 'text-white bg-dark-800'
                      : 'text-dark-300 hover:text-white hover:bg-dark-800/60'
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
            {!user && (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-2 rounded-lg text-sm font-medium text-dark-200"
                >
                  Sign in
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-brand-500 to-purple-600 text-white text-center mt-2"
                >
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
