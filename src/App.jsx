import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [bookmarks, setBookmarks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({ title: '', url: '', folder: '' });

  // Load bookmarks from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('bookmarks');
    if (saved) {
      setBookmarks(JSON.parse(saved));
    }
  }, []);

  // Save bookmarks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

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
        addDate: link.getAttribute('add_date') || Date.now(),
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
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const parsed = parseBookmarkHTML(e.target.result);
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
          b.id === editingBookmark.id
            ? { ...b, ...formData }
            : b
        )
      );
    } else {
      setBookmarks((prev) => [
        ...prev,
        {
          id: Date.now(),
          ...formData,
          addDate: Date.now(),
        },
      ]);
    }

    closeModal();
  };

  // Delete bookmark
  const handleDelete = (id) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
  };

  // Open modal for editing
  const openEditModal = (bookmark) => {
    setEditingBookmark(bookmark);
    setFormData({
      title: bookmark.title,
      url: bookmark.url,
      folder: bookmark.folder || '',
    });
    setIsModalOpen(true);
  };

  // Open modal for adding
  const openAddModal = () => {
    setEditingBookmark(null);
    setFormData({ title: '', url: '', folder: '' });
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingBookmark(null);
    setFormData({ title: '', url: '', folder: '' });
  };

  // Filter bookmarks by search
  const filteredBookmarks = bookmarks.filter(
    (b) =>
      b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.folder || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group bookmarks by folder
  const groupedBookmarks = filteredBookmarks.reduce((acc, bookmark) => {
    const folder = bookmark.folder || 'Uncategorized';
    if (!acc[folder]) acc[folder] = [];
    acc[folder].push(bookmark);
    return acc;
  }, {});

  // Get favicon URL
  const getFavicon = (url) => {
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
    } catch {
      return null;
    }
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <h1>📚 Bookmark Manager</h1>
          <p className="subtitle">Your personal bookmark collection</p>
        </div>
      </header>

      <main className="main">
        <div className="toolbar">
          <div className="search-box">
            <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Search bookmarks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="actions">
            <button className="btn btn-primary" onClick={openAddModal}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Add Bookmark
            </button>

            <label className="btn btn-secondary">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
              </svg>
              Import
              <input type="file" accept=".html" onChange={handleImport} hidden />
            </label>

            <button className="btn btn-secondary" onClick={handleExport} disabled={bookmarks.length === 0}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
              </svg>
              Export
            </button>
          </div>
        </div>

        {bookmarks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📑</div>
            <h2>No bookmarks yet</h2>
            <p>Add your first bookmark or import from Chrome</p>
            <div className="empty-actions">
              <button className="btn btn-primary" onClick={openAddModal}>
                Add Bookmark
              </button>
              <label className="btn btn-secondary">
                Import from Chrome
                <input type="file" accept=".html" onChange={handleImport} hidden />
              </label>
            </div>
          </div>
        ) : (
          <div className="bookmarks-container">
            {Object.entries(groupedBookmarks).map(([folder, items]) => (
              <div key={folder} className="folder-section">
                <h2 className="folder-title">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                  </svg>
                  {folder}
                  <span className="folder-count">{items.length}</span>
                </h2>
                <div className="bookmarks-grid">
                  {items.map((bookmark) => (
                    <div key={bookmark.id} className="bookmark-card">
                      <a
                        href={bookmark.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bookmark-link"
                      >
                        <img
                          src={bookmark.icon || getFavicon(bookmark.url)}
                          alt=""
                          className="bookmark-favicon"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                        <div className="bookmark-info">
                          <span className="bookmark-title">{bookmark.title}</span>
                          <span className="bookmark-url">{bookmark.url}</span>
                        </div>
                      </a>
                      <div className="bookmark-actions">
                        <button
                          className="icon-btn edit"
                          onClick={() => openEditModal(bookmark)}
                          title="Edit"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                        <button
                          className="icon-btn delete"
                          onClick={() => handleDelete(bookmark.id)}
                          title="Delete"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingBookmark ? 'Edit Bookmark' : 'Add Bookmark'}</h2>
              <button className="close-btn" onClick={closeModal}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="title">Title</label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="My Bookmark"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="url">URL</label>
                <input
                  type="url"
                  id="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://example.com"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="folder">Folder (optional)</label>
                <input
                  type="text"
                  id="folder"
                  value={formData.folder}
                  onChange={(e) => setFormData({ ...formData, folder: e.target.value })}
                  placeholder="Work, Personal, etc."
                  list="folders"
                />
                <datalist id="folders">
                  {[...new Set(bookmarks.map((b) => b.folder).filter(Boolean))].map((f) => (
                    <option key={f} value={f} />
                  ))}
                </datalist>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingBookmark ? 'Save Changes' : 'Add Bookmark'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <footer className="footer">
        <p>Data stored locally in your browser • <a href="https://github.com/AHarmlessPyro" target="_blank" rel="noopener noreferrer">GitHub</a></p>
      </footer>
    </div>
  );
}

export default App;
