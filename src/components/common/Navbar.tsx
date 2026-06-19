import React, { useState, useEffect } from 'react';
import { Logo } from './Logo';
import { Users, Sparkles, Download, Menu, X, Building2, MapPin, Compass, LogIn, LogOut } from 'lucide-react';
import { useAuth } from './AuthContext';
import { LoginModal } from '../modals/LoginModal';

interface NavbarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  onOpenBrochure: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeSection,
  setActiveSection,
  onOpenBrochure,
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const { user, profile, signOut } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'overview', label: 'Project Showcase', icon: Building2 },
    { id: 'floor-plans', label: 'Configurations', icon: Compass },
    { id: 'amenities', label: 'Amenities', icon: Sparkles },
    { id: 'location', label: 'Vizag Location', icon: MapPin },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'glass-panel bg-white/90 shadow-md py-3'
          : 'bg-gradient-to-b from-slate-900/80 via-slate-900/40 to-transparent py-5 backdrop-blur-xs'
      }`}
    >
      <div className="w-full px-4 sm:px-8 xl:px-12 relative">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div
            onClick={() => {
              setActiveSection('overview');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="cursor-pointer z-10"
          >
            <Logo size="md" dark={!scrolled} />
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden 2xl:flex flex-1 justify-center px-2 2xl:px-4">
            <nav className="flex items-center gap-0.5 2xl:gap-1 bg-slate-100/80 p-1 2xl:p-1.5 rounded-full border border-slate-200 shadow-inner">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`flex items-center gap-1.5 2xl:gap-2 px-3 py-1.5 2xl:px-4 2xl:py-2 rounded-full font-medium text-xs 2xl:text-sm transition-all duration-200 whitespace-nowrap ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-sm font-semibold'
                      : 'text-slate-700 hover:text-slate-950 hover:bg-white/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 2xl:w-4 2xl:h-4 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
                  {item.label}
                </button>
              );
            })}

            {/* Flat Owners Community Tab Button */}
            <button
              onClick={() => setActiveSection('community')}
              className={`relative flex items-center gap-1.5 2xl:gap-2 px-4 py-1.5 2xl:px-5 2xl:py-2 rounded-full font-bold text-xs 2xl:text-sm transition-all duration-300 whitespace-nowrap ${
                activeSection === 'community'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/30 scale-102'
                  : 'bg-amber-100 text-amber-900 hover:bg-amber-200 hover:text-amber-950 border border-amber-300/60'
              }`}
            >
              <Users className={`w-3.5 h-3.5 2xl:w-4 2xl:h-4 ${activeSection === 'community' ? 'text-white animate-bounce' : 'text-amber-700'}`} />
              <span>AFTOWA Registered Society</span>
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
              </span>
            </button>
            </nav>
          </div>

          {/* Call to Actions */}
          <div className="hidden 2xl:flex items-center gap-1 bg-slate-100/80 p-1 2xl:p-1.5 rounded-full border border-slate-200 shadow-inner z-10 shrink-0">
            {user ? (
              <div className="flex items-center gap-2 2xl:gap-3 pr-1">
                <span className="text-xs 2xl:text-sm font-semibold text-slate-700 pl-2 2xl:pl-3 whitespace-nowrap">
                  Hi, {profile?.name || user.email?.split('@')[0]}
                </span>
                <button
                  onClick={() => signOut()}
                  className="flex items-center gap-1.5 2xl:gap-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold px-3 py-1.5 2xl:px-4 2xl:py-2 rounded-full text-xs 2xl:text-sm transition-all duration-300 cursor-pointer shadow-sm border border-slate-200/50 whitespace-nowrap"
                >
                  <LogOut className="w-3.5 h-3.5 2xl:w-4 2xl:h-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="flex items-center gap-1.5 2xl:gap-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold px-3 py-1.5 2xl:px-4 2xl:py-2 rounded-full text-xs 2xl:text-sm transition-all duration-300 cursor-pointer shadow-sm border border-slate-200/50 whitespace-nowrap"
              >
                <LogIn className="w-3.5 h-3.5 2xl:w-4 2xl:h-4" />
                <span>Login</span>
              </button>
            )}
            <button
              onClick={onOpenBrochure}
              className="flex items-center gap-1.5 2xl:gap-2 bg-gradient-to-r from-slate-900 to-slate-800 text-white hover:from-amber-600 hover:to-amber-700 font-semibold px-3 py-1.5 2xl:px-4 2xl:py-2 rounded-full shadow-md text-xs 2xl:text-sm transition-all duration-300 cursor-pointer whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5 2xl:w-4 2xl:h-4 text-amber-400" />
              <span>Brochure / Enquiry</span>
            </button>
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="2xl:hidden flex items-center gap-2">
            <button
              onClick={() => setActiveSection('community')}
              className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold text-xs rounded-lg shadow-sm"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Community</span>
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2 rounded-xl border ${
                scrolled ? 'bg-white text-slate-800 border-slate-200' : 'bg-slate-800 text-white border-slate-700'
              }`}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="2xl:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-lg border-b border-slate-200 px-4 py-6 shadow-2xl animate-in slide-in-from-top duration-200">
          <div className="flex flex-col gap-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveSection(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-base ${
                    isActive ? 'bg-slate-900 text-white font-semibold' : 'text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
                  {item.label}
                </button>
              );
            })}

            <div className="my-2 border-t border-slate-200"></div>

            <button
              onClick={() => {
                setActiveSection('community');
                setMobileMenuOpen(false);
              }}
              className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold py-3.5 rounded-xl shadow-lg"
            >
              <Users className="w-5 h-5" />
              <span>👑 AFTOWA Registered Society</span>
            </button>

            <button
              onClick={() => {
                onOpenBrochure();
                setMobileMenuOpen(false);
              }}
              className="flex items-center justify-center gap-2 w-full bg-slate-900 text-white font-semibold py-3 rounded-xl"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>Download Official Brochure</span>
            </button>
            {user ? (
              <button
                onClick={() => {
                  signOut();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center justify-center gap-2 w-full bg-slate-100 text-slate-800 font-semibold py-3 rounded-xl"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout ({profile?.name || user.email})</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setIsLoginModalOpen(true);
                  setMobileMenuOpen(false);
                }}
                className="flex items-center justify-center gap-2 w-full bg-slate-100 text-slate-800 font-semibold py-3 rounded-xl"
              >
                <LogIn className="w-4 h-4" />
                <span>Login</span>
              </button>
            )}
          </div>
        </div>
      )}

      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </header>
  );
};
