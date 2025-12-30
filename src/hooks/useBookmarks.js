import { useState, useEffect } from "react";

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState(() => {
    if (typeof localStorage !== "undefined") {
      const saved = localStorage.getItem("bookmarks");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  // Save to localStorage whenever bookmarks change
  useEffect(() => {
    localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
  }, [bookmarks]);

  const addBookmark = (bookmark) => {
    setBookmarks((prev) => [
      ...prev,
      { id: Date.now(), ...bookmark, addDate: Date.now() },
    ]);
  };

  const updateBookmark = (id, updatedData) => {
    setBookmarks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...updatedData } : b))
    );
  };

  const deleteBookmark = (id) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
  };

  const importBookmarks = (newBookmarks) => {
    setBookmarks((prev) => [...prev, ...newBookmarks]);
  };

  return {
    bookmarks,
    addBookmark,
    updateBookmark,
    deleteBookmark,
    importBookmarks,
  };
}

// Helper to parse Netscape Bookmark HTML
export const parseBookmarkHTML = (html) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const links = doc.querySelectorAll("a");
  const parsed = [];

  links.forEach((link, index) => {
    const folder =
      link.closest("dl")?.previousElementSibling?.textContent || "Imported";
    parsed.push({
      id: Date.now() + index,
      title: link.textContent || "Untitled",
      url: link.getAttribute("href") || "",
      folder: folder.trim(),
      addDate: parseInt(link.getAttribute("add_date") || String(Date.now())),
      icon: link.getAttribute("icon") || "",
    });
  });

  return parsed;
};

// Helper to generate Netscape Bookmark HTML
export const generateBookmarkHTML = (bookmarks) => {
  const folders = [...new Set(bookmarks.map((b) => b.folder || "Bookmarks"))];

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
      .filter((b) => (b.folder || "Bookmarks") === folder)
      .forEach((bookmark) => {
        html += `        <DT><A HREF="${bookmark.url}" ADD_DATE="${bookmark.addDate}"${bookmark.icon ? ` ICON="${bookmark.icon}"` : ""}>${bookmark.title}</A>\n`;
      });
    html += `    </DL><p>\n`;
  });

  html += `</DL><p>`;
  return html;
};
