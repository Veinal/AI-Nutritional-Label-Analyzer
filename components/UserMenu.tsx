import React, { useState, useRef, useEffect } from 'react';
import { User, History, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface UserMenuProps {
  onShowHistory: () => void;
  onShowProfile: () => void;
  onSignOut: () => void;
}

export const UserMenu: React.FC<UserMenuProps> = ({
  onShowHistory,
  onShowProfile,
  onSignOut,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleAction = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 pl-3 pr-2 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-full border border-gray-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-sm font-bold shadow-lg">
          {user?.email?.charAt(0).toUpperCase() || 'U'}
        </div>
        <ChevronDown size={16} className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-gray-800 rounded-xl shadow-2xl border border-gray-700 overflow-hidden z-50 transform origin-top-right transition-all animate-in fade-in zoom-in-95 duration-200">
          <div className="px-4 py-3 border-b border-gray-700 bg-gray-800/50">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Signed in as</p>
            <p className="text-sm font-semibold text-white truncate" title={user?.email}>{user?.email}</p>
          </div>
          
          <div className="p-1">
            <button
              onClick={() => handleAction(onShowProfile)}
              className="w-full text-left flex items-center gap-3 px-3 py-2 text-gray-200 hover:bg-gray-700/50 hover:text-white rounded-lg transition-colors group"
            >
              <div className="p-1.5 rounded-md bg-gray-700/50 text-gray-400 group-hover:text-emerald-400 group-hover:bg-emerald-500/10 transition-colors">
                <User size={16} />
              </div>
              <span className="font-medium">Profile</span>
            </button>

            <button
              onClick={() => handleAction(onShowHistory)}
              className="w-full text-left flex items-center gap-3 px-3 py-2 text-gray-200 hover:bg-gray-700/50 hover:text-white rounded-lg transition-colors group"
            >
              <div className="p-1.5 rounded-md bg-gray-700/50 text-gray-400 group-hover:text-blue-400 group-hover:bg-blue-500/10 transition-colors">
                <History size={16} />
              </div>
              <span className="font-medium">History</span>
            </button>
            
            <div className="my-1 border-t border-gray-700/50 mx-2"></div>
            
            <button
              onClick={() => handleAction(onSignOut)}
              className="w-full text-left flex items-center gap-3 px-3 py-2 text-red-300 hover:bg-red-500/10 hover:text-red-200 rounded-lg transition-colors group"
            >
              <div className="p-1.5 rounded-md bg-red-900/30 text-red-400 group-hover:text-red-300 transition-colors">
                <LogOut size={16} />
              </div>
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
