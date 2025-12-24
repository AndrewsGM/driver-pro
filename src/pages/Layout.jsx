
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { 
  Home, Play, History, Trophy, User, Menu, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { name: 'Dashboard', icon: Home, label: 'Início' },
  { name: 'Session', icon: Play, label: 'Praticar' },
  { name: 'History', icon: History, label: 'Histórico' },
  { name: 'Ranking', icon: Trophy, label: 'Ranking' },
  { name: 'Settings', icon: User, label: 'Perfil' },
];

const adminNavItems = [
  { name: 'Dashboard', icon: Home, label: 'Início' },
  { name: 'AdminPanel', icon: Menu, label: 'Admin' },
  { name: 'History', icon: History, label: 'Histórico' },
  { name: 'Ranking', icon: Trophy, label: 'Ranking' },
  { name: 'Settings', icon: User, label: 'Perfil' },
];

// Pages that should show bottom nav
const pagesWithNav = ['Dashboard', 'Session', 'History', 'Ranking', 'Settings', 'Subscription', 'Theory', 'Simulation'];

export default function Layout({ children, currentPageName }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const auth = await base44.auth.isAuthenticated();
        setIsAuthenticated(auth);
        
        if (auth) {
          const userData = await base44.auth.me();
          setIsAdmin(userData.role === 'admin');
        }
      } catch (e) {
        setIsAuthenticated(false);
        setIsAdmin(false);
      }
    };
    checkAuth();
  }, []);

  const showBottomNav = pagesWithNav.includes(currentPageName) && isAuthenticated;

  return (
    <div className="min-h-screen bg-gray-50">
      <style>{`
        :root {
          --primary-navy: #1E3A5F;
          --primary-navy-light: #2d4a6f;
        }
        
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          margin: 0;
          padding: 0;
          overflow-x: hidden;
        }
        
        /* Mobile container */
        .mobile-container {
          max-width: 428px;
          margin: 0 auto;
          min-height: 100vh;
          background: #f8f9fa;
          box-shadow: 0 0 50px rgba(0,0,0,0.1);
          position: relative;
        }
        
        /* Mobile-optimized scrolling */
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        /* Safe area for iOS */
        .safe-area-bottom {
          padding-bottom: env(safe-area-inset-bottom, 20px);
        }
        
        /* Smooth transitions */
        * {
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>

      {/* Main Content */}
      <div className="mobile-container">
        <main className={showBottomNav ? 'pb-24' : ''}>
          {children}
        </main>
        
        {/* Bottom Navigation */}
        {showBottomNav && (
          <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 safe-area-bottom z-40" style={{ maxWidth: '428px', margin: '0 auto' }}>
            <div className="flex items-center justify-around px-2 py-2">
              {(isAdmin ? adminNavItems : navItems).map((item) => {
                const Icon = item.icon;
                const isActive = currentPageName === item.name;
                
                return (
                  <Link
                    key={item.name}
                    to={createPageUrl(item.name)}
                    className="flex flex-col items-center py-2 px-4 min-w-[60px]"
                  >
                    <div className={`relative p-2 rounded-xl transition-all duration-200 ${
                      isActive 
                        ? 'bg-[#1E3A5F]' 
                        : 'hover:bg-gray-100'
                    }`}>
                      <Icon className={`h-5 w-5 ${
                        isActive ? 'text-white' : 'text-gray-500'
                      }`} />
                      {isActive && (
                        <motion.div
                          layoutId="activeIndicator"
                          className="absolute inset-0 bg-[#1E3A5F] rounded-xl -z-10"
                          transition={{ type: "spring", duration: 0.5 }}
                        />
                      )}
                    </div>
                    <span className={`text-xs mt-1 font-medium ${
                      isActive ? 'text-[#1E3A5F]' : 'text-gray-400'
                    }`}>
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </nav>
        )}
      </div>


    </div>
  );
}
