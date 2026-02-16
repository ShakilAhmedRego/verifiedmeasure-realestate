'use client';

import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import DarkModeToggle from './DarkModeToggle';

export default function TopNav() {
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">Real Estate Intelligence Platform</h2>
        </div>
        
        <div className="flex items-center gap-4">
          <DarkModeToggle />
          <button
            onClick={handleSignOut}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </nav>
  );
}
