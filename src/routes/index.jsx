import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { useTheme } from '../hooks/useTheme';
import { useBookmarks, parseBookmarkHTML, generateBookmarkHTML } from '../hooks/useBookmarks';
import { Header } from '../components/Header';
import { SearchSection } from '../components/SearchSection';
import { MobileFilterSection } from '../components/MobileFilterSection';
import { BookmarkGrid } from '../components/BookmarkGrid';
import { RecentBookmarks } from '../components/RecentBookmarks';
import { BottomNav } from '../components/BottomNav';
import { BookmarkModal } from '../components/BookmarkModal';

export const Route = createFileRoute('/')({
  component: HomePage,
});

function HomePage() {
  const { theme, toggleTheme } = useTheme();
  const { bookmarks, addBookmark, updateBookmark, deleteBookmark, importBookmarks } = useBookmarks();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedEngineId, setSelectedEngineId] = useState('google');
  const [expandedFolders, setExpandedFolders] = useState({});

  // Derived State
  const folders = [...new Set(bookmarks.map((b) => b.folder || 'Uncategorized'))];

  const filteredBookmarks = bookmarks.filter((b) => {
    const matchesSearch =
      b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.folder || '').toLowerCase().includes(searchTerm.toLowerCase());

    if (activeFilter === 'all') return matchesSearch;
    return matchesSearch && (b.folder || 'Uncategorized') === activeFilter;
  });

  const groupedBookmarks = filteredBookmarks.reduce((acc, bookmark) => {
    const folder = bookmark.folder || 'Uncategorized';
    if (!acc[folder]) acc[folder] = [];
    acc[folder].push(bookmark);
    return acc;
  }, {});

  // Handlers
  const toggleFolder = (folder) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [folder]: !prev[folder],
    }));
  };

  const handleImport = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const parsed = parseBookmarkHTML(e.target?.result);
      importBookmarks(parsed);
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

  const openAddModal = () => {
    setEditingBookmark(null);
    setIsModalOpen(true);
  };

  const openEditModal = (bookmark) => {
    setEditingBookmark(bookmark);
    setIsModalOpen(true);
  };

  const handleSaveBookmark = (formData) => {
    if (editingBookmark) {
      updateBookmark(editingBookmark.id, formData);
    } else {
      addBookmark(formData);
    }
  };

  return (
    <div className="min-h-screen flex flex-col pb-24 lg:pb-6 lg:pl-20 relative overflow-x-hidden">
      <Header
        theme={theme}
        toggleTheme={toggleTheme}
        onImport={handleImport}
        onExport={handleExport}
        hasBookmarks={bookmarks.length > 0}
      />

      <section className="px-5 pb-4 lg:px-12 lg:pb-3">
        <h1 className="text-2xl lg:text-3xl font-bold leading-snug text-text-primary max-w-7xl mx-auto">
          Your WebHome
        </h1>
      </section>

      <SearchSection
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
        folders={folders}
        bookmarksCount={bookmarks.length}
        selectedEngineId={selectedEngineId}
        setSelectedEngineId={setSelectedEngineId}
      />

      <MobileFilterSection
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
        folders={folders}
        bookmarksCount={bookmarks.length}
      />

      <main className="flex-1 px-5 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:grid lg:grid-cols-[1fr_280px] gap-5 lg:gap-8">
            <BookmarkGrid
              bookmarks={bookmarks}
              groupedBookmarks={groupedBookmarks}
              expandedFolders={expandedFolders}
              toggleFolder={toggleFolder}
              onEdit={openEditModal}
              onDelete={deleteBookmark}
              onAdd={openAddModal}
              onImport={handleImport}
            />

            {filteredBookmarks.length > 0 && (
              <RecentBookmarks recentBookmarks={filteredBookmarks.slice(0, 6)} />
            )}
          </div>
        </div>
      </main>

      <BottomNav onAdd={openAddModal} />

      <BookmarkModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveBookmark}
        initialData={editingBookmark}
        availableFolders={[...new Set(bookmarks.map((b) => b.folder).filter(Boolean))]}
      />
    </div>
  );
}
