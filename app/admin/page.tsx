'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Sidebar from '@/components/Sidebar';
import TopNav from '@/components/TopNav';

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      router.push('/');
      return;
    }

    setUser(session.user);
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <TopNav />
        
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="max-w-7xl mx-auto p-6">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Console</h1>
              <p className="text-gray-600">System administration and user management</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
              <div className="w-24 h-24 mx-auto mb-6 opacity-20">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Admin Features Coming Soon</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Advanced administration features and user management tools will be available here.
              </p>
            </div>

            <div className="mt-8 bg-blue-50 rounded-xl border border-blue-200 p-6">
              <h4 className="text-sm font-semibold text-blue-900 mb-2">Admin SQL Commands</h4>
              <p className="text-sm text-blue-800 mb-4">
                Use these SQL commands in Supabase SQL Editor to manage users:
              </p>
              <div className="bg-white rounded-lg p-4 font-mono text-xs text-gray-800 space-y-2">
                <div>
                  <div className="text-gray-500 mb-1">-- Promote user to admin:</div>
                  <code>UPDATE public.user_profiles SET role = 'admin' WHERE id = 'USER_ID';</code>
                </div>
                <div className="mt-4">
                  <div className="text-gray-500 mb-1">-- Grant credits:</div>
                  <code>SELECT public.admin_grant_credits('USER_ID', 100, 'initial_grant');</code>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
