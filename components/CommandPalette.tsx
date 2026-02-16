'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const commands = [
    { label: 'Go to Dashboard', action: () => router.push('/dashboard') },
    { label: 'Go to Admin', action: () => router.push('/admin') },
  ];

  const filteredCommands = commands.filter((cmd) =>
    cmd.label.toLowerCase().includes(query.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-24">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command..."
            className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue"
            autoFocus
          />
        </div>
        <div className="max-h-96 overflow-y-auto">
          {filteredCommands.map((cmd, idx) => (
            <button
              key={idx}
              onClick={() => {
                cmd.action();
                setIsOpen(false);
                setQuery('');
              }}
              className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 transition-colors"
            >
              {cmd.label}
            </button>
          ))}
          {filteredCommands.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-gray-500">
              No commands found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
