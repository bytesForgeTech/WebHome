import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import {
  Search,
  Upload,
  Download,
  Plus,
  Edit3,
  Trash2,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  X,
  Home,
  Calendar,
  Layers,
  User,
  Bookmark,
  Sun,
  Moon
} from 'lucide-react';

export const Route = createFileRoute('/')({
  component: HomePage,
});

// Search engines configuration
const searchEngines = [
  { id: 'google', name: 'Google', icon: '🔍', url: 'https://www.google.com/search?q=' },
  { id: 'duckduckgo', name: 'DuckDuckGo', icon: '🦆', url: 'https://duckduckgo.com/?q=' },
  { id: 'youtube', name: 'YouTube', icon: '▶️', url: 'https://www.youtube.com/results?search_query=' },
  { id: 'bing', name: 'Bing', icon: '🅱️', url: 'https://www.bing.com/search?q=' },
  { id: 'github', name: 'GitHub', icon: '🐙', url: 'https://github.com/search?q=' },
  { id: 'reddit', name: 'Reddit', icon: '🤖', url: 'https://www.reddit.com/search/?q=' },
  { id: 'stackoverflow', name: 'Stack Overflow', icon: '📚', url: 'https://stackoverflow.com/search?q=' },
];

function HomePage() {
  const [bookmarks, setBookmarks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({ title: '', url: '', folder: '' });
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedEngine, setSelectedEngine] = useState('google');
  const [showEngineDropdown, setShowEngineDropdown] = useState(false);

  // Theme State
  const [theme, setTheme] = useState(() => {
    if (typeof localStorage !== 'undefined' && localStorage.getItem('theme')) {
      return localStorage.getItem('theme');
    }
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  // Collapsible Folders State
  const [collapsedFolders, setCollapsedFolders] = useState({});

  // Theme Effect
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const toggleFolder = (folder) => {
    setCollapsedFolders(prev => ({
      ...prev,
      [folder]: !prev[folder]
    }));
  };

  // Load bookmarks from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('bookmarks');
    if (saved) {
      setBookmarks(JSON.parse(saved));
    }
  }, []);

  // Save bookmarks to localStorage
  useEffect(() => {
    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  // Handle web search
  const handleWebSearch = (e) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      const engine = searchEngines.find(eng => eng.id === selectedEngine);
      if (engine) {
        window.open(engine.url + encodeURIComponent(searchTerm), '_blank');
      }
    }
  };

  const triggerSearch = () => {
    if (searchTerm.trim()) {
      const engine = searchEngines.find(eng => eng.id === selectedEngine);
      if (engine) {
        window.open(engine.url + encodeURIComponent(searchTerm), '_blank');
      }
    }
  };

  // Parse Chrome HTML bookmark file
  const parseBookmarkHTML = (html) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const links = doc.querySelectorAll('a');
    const parsed = [];

    links.forEach((link, index) => {
      const folder = link.closest('dl')?.previousElementSibling?.textContent || 'Imported';
      parsed.push({
        id: Date.now() + index,
        title: link.textContent || 'Untitled',
        url: link.getAttribute('href') || '',
        folder: folder.trim(),
        addDate: parseInt(link.getAttribute('add_date') || String(Date.now())),
        icon: link.getAttribute('icon') || '',
      });
    });

    return parsed;
  };

  // Generate Chrome-compatible HTML export
  const generateBookmarkHTML = () => {
    const folders = [...new Set(bookmarks.map((b) => b.folder || 'Bookmarks'))];

    let html = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<!-- This is an automatically generated file.
     It will be read and overwritten.
     DO NOT EDIT! -->
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks</H1>
<DL><p>\n`;

    folders.forEach((folder) => {
      html += `    <DT><H3>${folder}</H3>\n    <DL><p>\n`;
      bookmarks
        .filter((b) => (b.folder || 'Bookmarks') === folder)
        .forEach((bookmark) => {
          html += `        <DT><A HREF="${bookmark.url}" ADD_DATE="${bookmark.addDate}"${bookmark.icon ? ` ICON="${bookmark.icon}"` : ''}>${bookmark.title}</A>\n`;
        });
      html += `    </DL><p>\n`;
    });

    html += `</DL><p>`;
    return html;
  };

  // Handle file import
  const handleImport = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const parsed = parseBookmarkHTML(e.target?.result);
      setBookmarks((prev) => [...prev, ...parsed]);
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  // Handle export
  const handleExport = () => {
    const html = generateBookmarkHTML();
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bookmarks.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Add or update bookmark
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.url) return;

    if (editingBookmark) {
      setBookmarks((prev) =>
        prev.map((b) =>
          b.id === editingBookmark.id ? { ...b, ...formData } : b
        )
      );
    } else {
      setBookmarks((prev) => [
        ...prev,
        { id: Date.now(), ...formData, addDate: Date.now() },
      ]);
    }

    closeModal();
  };

  // Delete bookmark
  const handleDelete = (id) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
  };

  // Modal functions
  const openEditModal = (bookmark) => {
    setEditingBookmark(bookmark);
    setFormData({ title: bookmark.title, url: bookmark.url, folder: bookmark.folder || '' });
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setEditingBookmark(null);
    setFormData({ title: '', url: '', folder: '' });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingBookmark(null);
    setFormData({ title: '', url: '', folder: '' });
  };

  // Get unique folders
  const folders = [...new Set(bookmarks.map((b) => b.folder || 'Uncategorized'))];

  // Filter bookmarks
  const filteredBookmarks = bookmarks.filter((b) => {
    const matchesSearch =
      b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.folder || '').toLowerCase().includes(searchTerm.toLowerCase());

    if (activeFilter === 'all') return matchesSearch;
    return matchesSearch && (b.folder || 'Uncategorized') === activeFilter;
  });

  // Group bookmarks by folder
  const groupedBookmarks = filteredBookmarks.reduce((acc, bookmark) => {
    const folder = bookmark.folder || 'Uncategorized';
    if (!acc[folder]) acc[folder] = [];
    acc[folder].push(bookmark);
    return acc;
  }, {});

  // Get domain from URL
  const getDomain = (url) => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  // Get greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const currentEngine = searchEngines.find(eng => eng.id === selectedEngine);

  return (
    <div className="min-h-screen flex flex-col pb-24 lg:pb-6 lg:pl-20 relative overflow-x-hidden">
      {/* Header */}
      <header className="px-5 pt-5 pb-3 lg:px-12 lg:pt-6 lg:pb-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 lg:w-9 lg:h-9 rounded-full gradient-orange flex items-center justify-center text-base shadow-sm">
              👋
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-text-secondary">{getGreeting()},</span>
              <span className="text-sm lg:text-base font-semibold text-text-primary">User</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-xl bg-bg-card flex items-center justify-center shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
            >
              {theme === 'light' ? (
                <Moon className="w-4 h-4 text-text-primary" />
              ) : (
                <Sun className="w-4 h-4 text-text-primary" />
              )}
            </button>
            <label className="w-9 h-9 rounded-xl bg-bg-card flex items-center justify-center cursor-pointer shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
              <Upload className="w-4 h-4 text-text-primary" />
              <input type="file" accept=".html" onChange={handleImport} hidden />
            </label>
            <button
              className="w-9 h-9 rounded-xl bg-bg-card flex items-center justify-center shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 disabled:opacity-50"
              onClick={handleExport}
              disabled={bookmarks.length === 0}
            >
              <Download className="w-4 h-4 text-text-primary" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-5 pb-4 lg:px-12 lg:pb-3">
        <h1 className="text-2xl lg:text-3xl font-bold leading-snug text-text-primary max-w-7xl mx-auto">
          Your WebHome
        </h1>
      </section>

      {/* Sticky Top Section */}
      <div className="sticky top-0 z-50 gradient-warm pb-1.5 mb-1">
        <div className="px-5 pb-2 lg:px-12">
          <div className="flex flex-col lg:flex-row lg:items-center gap-3 max-w-7xl mx-auto">
            {/* Search Engine Selector */}
            <div className="relative">
              <button
                className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-bg-card text-text-primary text-xs font-medium shadow-sm hover:shadow-md transition-all"
                onClick={() => setShowEngineDropdown(!showEngineDropdown)}
              >
                <span className="text-sm">{currentEngine?.icon}</span>
                <span className="font-semibold">{currentEngine?.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
              </button>

              {showEngineDropdown && (
                <div className="absolute top-full mt-1.5 left-0 min-w-44 bg-bg-card rounded-xl shadow-lg p-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  {searchEngines.map((engine) => (
                    <button
                      key={engine.id}
                      className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-left text-sm transition-colors ${selectedEngine === engine.id
                        ? 'bg-primary-orange-light text-primary-orange'
                        : 'hover:bg-bg-input text-text-primary'
                        }`}
                      onClick={() => {
                        setSelectedEngine(engine.id);
                        setShowEngineDropdown(false);
                      }}
                    >
                      <span className="text-base">{engine.icon}</span>
                      <span>{engine.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Search Box */}
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                placeholder={`Search with ${currentEngine?.name}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleWebSearch}
                className="w-full py-2.5 lg:py-2 pl-10 pr-12 rounded-xl bg-bg-card text-sm text-text-primary placeholder:text-text-muted shadow-card focus:outline-none focus:ring-2 focus:ring-primary-orange-light focus:shadow-lg transition-all"
              />
              <button
                onClick={triggerSearch}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-primary-orange flex items-center justify-center shadow-orange hover:bg-primary-orange-hover hover:scale-105 transition-all"
              >
                <ArrowRight className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Filter Tabs - Inline on desktop */}
            <div className="hidden lg:flex gap-1.5 ml-auto">
              <button
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${activeFilter === 'all'
                  ? 'bg-primary-orange text-white shadow-orange'
                  : 'bg-bg-card text-text-secondary shadow-sm hover:shadow-md'
                  }`}
                onClick={() => setActiveFilter('all')}
              >
                All ({bookmarks.length})
              </button>
              {folders.slice(0, 3).map((folder) => (
                <button
                  key={folder}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${activeFilter === folder
                    ? 'bg-primary-orange text-white shadow-orange'
                    : 'bg-bg-card text-text-secondary shadow-sm hover:shadow-md'
                    }`}
                  onClick={() => setActiveFilter(folder)}
                >
                  {folder}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Filter Tabs - Mobile only */}
        <div className="px-5 pb-3 lg:hidden overflow-x-auto scrollbar-hide">
          <div className="flex gap-2">
            <button
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${activeFilter === 'all'
                ? 'bg-primary-orange text-white shadow-orange'
                : 'bg-bg-card text-text-secondary shadow-sm hover:shadow-md'
                }`}
              onClick={() => setActiveFilter('all')}
            >
              All ({bookmarks.length})
            </button>
            {folders.slice(0, 4).map((folder) => (
              <button
                key={folder}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${activeFilter === folder
                  ? 'bg-primary-orange text-white shadow-orange'
                  : 'bg-bg-card text-text-secondary shadow-sm hover:shadow-md'
                  }`}
                onClick={() => setActiveFilter(folder)}
              >
                {folder}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 px-5 lg:px-12">
        <div className="max-w-7xl mx-auto">
          {bookmarks.length === 0 ? (
            <div className="text-center py-12 lg:py-10 px-6 bg-bg-card rounded-2xl border-2 border-dashed border-gray-200 my-3">
              <div className="text-5xl mb-3 animate-bounce">📑</div>
              <h2 className="text-xl font-semibold mb-1.5 text-text-primary">No bookmarks yet</h2>
              <p className="text-sm text-text-secondary mb-5 max-w-xs mx-auto">
                Add your first bookmark or import from Chrome
              </p>
              <div className="flex gap-2.5 justify-center flex-wrap">
                <button
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-primary-orange text-white text-sm font-semibold shadow-orange hover:bg-primary-orange-hover hover:-translate-y-0.5 transition-all"
                  onClick={openAddModal}
                >
                  <Plus className="w-4 h-4" />
                  Add Bookmark
                </button>
                <label className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-bg-card text-text-primary text-sm font-semibold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer">
                  <Upload className="w-4 h-4" />
                  Import
                  <input type="file" accept=".html" onChange={handleImport} hidden />
                </label>
              </div>
            </div>
          ) : (
            <div className="flex flex-col lg:grid lg:grid-cols-[1fr_280px] gap-5 lg:gap-8">
              {/* Bookmarks Grid */}
              <div className="space-y-5">
                {Object.entries(groupedBookmarks).map(([folder, items]) => (
                  <div key={folder} className="bg-bg-card/50 rounded-2xl p-2 lg:p-0 lg:bg-transparent">
                    <div
                      className="flex items-center justify-between mb-2 lg:mb-3 cursor-pointer select-none pl-1 pr-1 lg:px-0"
                      onClick={() => toggleFolder(folder)}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`transition-transform duration-200 ${collapsedFolders[folder] ? '-rotate-90' : 'rotate-0'}`}>
                          <ChevronDown className="w-4 h-4 text-text-muted" />
                        </div>
                        <h2 className="text-base lg:text-lg font-semibold text-text-primary">{folder}</h2>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-primary-orange text-white text-xs font-semibold">
                        {items.length}
                      </span>
                    </div>

                    {!collapsedFolders[folder] && (
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-3 animate-in fade-in slide-in-from-top-1 duration-200">
                        {items.map((bookmark, index) => (
                          <div
                            key={bookmark.id}
                            className={`relative flex flex-col p-3 lg:p-4 rounded-xl min-h-[100px] lg:min-h-[120px] shadow-card hover:shadow-float hover:-translate-y-0.5 transition-all overflow-hidden group ${index % 3 === 0
                              ? 'bg-accent-teal'
                              : index % 3 === 1
                                ? 'bg-primary-orange'
                                : 'bg-accent-coral'
                              }`}
                          >
                            <a
                              href={bookmark.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex flex-col flex-1 text-white"
                            >
                              <span className="text-[9px] lg:text-[10px] font-medium uppercase tracking-wider text-white/70 mb-0.5 lg:mb-1">
                                BOOKMARK
                              </span>
                              <span className="font-semibold text-xs lg:text-sm leading-tight line-clamp-2">
                                {bookmark.title}
                              </span>
                              <span className="text-[10px] lg:text-xs text-white/70 mt-auto pt-1 lg:pt-2 truncate">
                                {getDomain(bookmark.url)}
                              </span>
                            </a>

                            <div className="absolute top-1.5 right-1.5 lg:top-2 lg:right-2 flex gap-0.5 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  openEditModal(bookmark);
                                }}
                                className="p-1 lg:p-1.5 rounded-md bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
                              >
                                <Edit3 className="w-2.5 h-2.5 lg:w-3 lg:h-3 text-white" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleDelete(bookmark.id);
                                }}
                                className="p-1 lg:p-1.5 rounded-md bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
                              >
                                <Trash2 className="w-2.5 h-2.5 lg:w-3 lg:h-3 text-white" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

              </div>

              {/* Recent Sidebar */}
              {filteredBookmarks.length > 0 && (
                <div className="lg:sticky lg:top-28 lg:self-start bg-bg-card p-4 rounded-2xl shadow-card">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-text-primary">Recent</h3>
                    <span className="text-xs text-text-muted cursor-pointer hover:text-primary-orange transition-colors">
                      See All
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {filteredBookmarks.slice(0, 6).map((bookmark) => (
                      <a
                        key={bookmark.id}
                        href={bookmark.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-bg-input hover:translate-x-0.5 transition-all"
                      >
                        <div className="w-9 h-9 rounded-lg bg-accent-yellow flex items-center justify-center flex-shrink-0">
                          <Bookmark className="w-4 h-4 text-text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-text-primary truncate">{bookmark.title}</div>
                          <div className="text-xs text-text-muted truncate">{getDomain(bookmark.url)}</div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-text-muted flex-shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Bottom Navigation (Mobile) / Side Navigation (Desktop) */}
      <nav className="fixed bottom-0 left-0 right-0 lg:bottom-auto lg:top-1/2 lg:left-4 lg:right-auto lg:-translate-y-1/2 flex lg:flex-col items-center justify-around lg:justify-center gap-1 px-6 py-3 lg:py-4 lg:px-2 bg-bg-card rounded-t-2xl lg:rounded-2xl shadow-float z-50">
        <button className="p-2.5 text-primary-orange">
          <Home className="w-5 h-5" fill="currentColor" />
        </button>
        <button className="p-2.5 text-text-muted hover:text-primary-orange transition-colors">
          <Calendar className="w-5 h-5" />
        </button>
        <button
          onClick={openAddModal}
          className="w-11 h-11 -mt-6 lg:mt-0 lg:my-1.5 rounded-full bg-primary-orange flex items-center justify-center shadow-orange hover:scale-110 transition-transform"
        >
          <Plus className="w-5 h-5 text-white" strokeWidth={3} />
        </button>
        <button className="p-2.5 text-text-muted hover:text-primary-orange transition-colors">
          <Layers className="w-5 h-5" />
        </button>
        <button className="p-2.5 text-text-muted hover:text-primary-orange transition-colors">
          <User className="w-5 h-5" />
        </button>
      </nav>

      {/* Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/40 flex items-end lg:items-center justify-center p-0 lg:p-4 z-[100]"
          onClick={closeModal}
        >
          <div
            className="w-full lg:max-w-sm max-h-[90vh] overflow-y-auto bg-bg-card rounded-t-2xl lg:rounded-2xl shadow-float"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-100 sticky top-0 bg-bg-card z-10">
              <h2 className="text-lg font-semibold">
                {editingBookmark ? 'Edit Bookmark' : 'Add Bookmark'}
              </h2>
              <button
                onClick={closeModal}
                className="w-8 h-8 rounded-full bg-bg-input flex items-center justify-center hover:bg-text-primary hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4">
              <div className="mb-4">
                <label className="block text-xs font-medium text-text-secondary mb-1.5">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="My Bookmark"
                  required
                  className="w-full py-2.5 px-3 rounded-xl bg-bg-input border-2 border-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary-orange focus:bg-bg-card transition-all"
                />
              </div>
              <div className="mb-4">
                <label className="block text-xs font-medium text-text-secondary mb-1.5">URL</label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://example.com"
                  required
                  className="w-full py-2.5 px-3 rounded-xl bg-bg-input border-2 border-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary-orange focus:bg-bg-card transition-all"
                />
              </div>
              <div className="mb-4">
                <label className="block text-xs font-medium text-text-secondary mb-1.5">
                  Folder (optional)
                </label>
                <input
                  type="text"
                  value={formData.folder}
                  onChange={(e) => setFormData({ ...formData, folder: e.target.value })}
                  placeholder="Work, Personal, etc."
                  list="folders"
                  className="w-full py-2.5 px-3 rounded-xl bg-bg-input border-2 border-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary-orange focus:bg-bg-card transition-all"
                />
                <datalist id="folders">
                  {[...new Set(bookmarks.map((b) => b.folder).filter(Boolean))].map((f) => (
                    <option key={f} value={f} />
                  ))}
                </datalist>
              </div>
              <div className="flex gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-2.5 rounded-full bg-bg-card text-sm text-text-primary font-semibold shadow-md hover:shadow-lg transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-full bg-primary-orange text-sm text-white font-semibold shadow-orange hover:bg-primary-orange-hover transition-all"
                >
                  {editingBookmark ? 'Save' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
