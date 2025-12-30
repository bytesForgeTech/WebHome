import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { User, Save, Upload, Download, ArrowLeft, Moon, Sun } from 'lucide-react';
import { useBookmarks } from '../hooks/useBookmarks';
import { useTheme } from '../hooks/useTheme';
import { parseBookmarkHTML, generateBookmarkHTML } from '../hooks/useBookmarks';

export const Route = createFileRoute('/settings')({
  component: SettingsPage,
});

function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const { bookmarks, importBookmarks } = useBookmarks();

  // Local state mirroring HomePage logic
  const [username, setUsername] = useState(() => {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('username') || 'User';
    }
    return 'User';
  });

  const [tempName, setTempName] = useState(username);

  // Sync username to storage
  const handleSaveProfile = (e) => {
    e.preventDefault();
    setUsername(tempName);
    localStorage.setItem('username', tempName);
    alert('Profile saved!');
  };

  const handleImport = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const parsed = parseBookmarkHTML(e.target?.result);
      importBookmarks(parsed);
      alert(`Successfully imported ${parsed.length} bookmarks!`);
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleExport = () => {
    const html = generateBookmarkHTML(bookmarks);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bookmarks.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-bg-solid text-text-primary transition-colors duration-300">
      <div className="max-w-2xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            to="/"
            className="p-2 rounded-full hover:bg-bg-input transition-colors group"
          >
            <ArrowLeft className="w-6 h-6 text-text-secondary group-hover:text-primary-orange" />
          </Link>
          <h1 className="text-2xl font-bold">Settings</h1>
        </div>

        <div className="space-y-6">

          {/* Section: Profile */}
          <div className="bg-bg-card rounded-2xl p-6 shadow-sm border border-gray-100/50">
            <div className="flex items-center gap-2 mb-4 text-primary-orange font-medium text-sm uppercase tracking-wider">
              <User className="w-4 h-4" />
              Profile
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">Display Name</label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-bg-input border border-transparent focus:border-primary-orange focus:bg-bg-card font-medium text-text-primary outline-none transition-all"
                  />
                  <button
                    type="submit"
                    disabled={tempName === username}
                    className="px-5 py-2.5 bg-primary-orange text-white rounded-xl shadow-orange hover:shadow-lg disabled:opacity-50 disabled:shadow-none transition-all flex items-center gap-2 font-semibold"
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Section: Appearance */}
          <div className="bg-bg-card rounded-2xl p-6 shadow-sm border border-gray-100/50">
            <div className="flex items-center gap-2 mb-4 text-accent-purple font-medium text-sm uppercase tracking-wider">
              <Sun className="w-4 h-4" />
              Appearance
            </div>

            <div className="flex items-center justify-between">
              <span className="text-text-primary font-medium">Theme Mode</span>
              <button
                onClick={toggleTheme}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-bg-input hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                {theme === 'light' ? (
                  <>
                    <Moon className="w-4 h-4" />
                    <span>Dark Mode</span>
                  </>
                ) : (
                  <>
                    <Sun className="w-4 h-4" />
                    <span>Light Mode</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Section: Data */}
          <div className="bg-bg-card rounded-2xl p-6 shadow-sm border border-gray-100/50">
            <div className="flex items-center gap-2 mb-4 text-accent-teal font-medium text-sm uppercase tracking-wider">
              <Save className="w-4 h-4" />
              Data Management
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="flex items-center gap-4 p-4 rounded-xl bg-bg-input hover:bg-gray-50 dark:hover:bg-gray-800 border-2 border-transparent hover:border-primary-orange/20 cursor-pointer transition-all group">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-text-primary">Import Bookmarks</div>
                  <div className="text-xs text-text-muted">From HTML file</div>
                </div>
                <input type="file" accept=".html" onChange={handleImport} hidden />
              </label>

              <button
                onClick={handleExport}
                disabled={bookmarks.length === 0}
                className="flex items-center gap-4 p-4 rounded-xl bg-bg-input hover:bg-gray-50 dark:hover:bg-gray-800 border-2 border-transparent hover:border-primary-orange/20 transition-all group disabled:opacity-50 disabled:cursor-not-allowed text-left"
              >
                <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-text-primary">Export Bookmarks</div>
                  <div className="text-xs text-text-muted">To HTML file</div>
                </div>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
