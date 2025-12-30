import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export function BookmarkModal({ isOpen, onClose, onSave, initialData, availableFolders }) {
    const [formData, setFormData] = useState({ title: '', url: '', folder: '' });

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData({
                    title: initialData.title,
                    url: initialData.url,
                    folder: initialData.folder || ''
                });
            } else {
                setFormData({ title: '', url: '', folder: '' });
            }
        }
    }, [isOpen, initialData]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/40 flex items-end lg:items-center justify-center p-0 lg:p-4 z-[100]"
            onClick={onClose}
        >
            <div
                className="w-full lg:max-w-sm max-h-[90vh] overflow-y-auto bg-bg-card rounded-t-2xl lg:rounded-2xl shadow-float"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-4 border-b border-gray-100 sticky top-0 bg-bg-card z-10">
                    <h2 className="text-lg font-semibold">
                        {initialData ? 'Edit Bookmark' : 'Add Bookmark'}
                    </h2>
                    <button
                        onClick={onClose}
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
                            {availableFolders.map((f) => (
                                <option key={f} value={f} />
                            ))}
                        </datalist>
                    </div>
                    <div className="flex gap-2.5 pt-1">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2.5 rounded-full bg-bg-card text-sm text-text-primary font-semibold shadow-md hover:shadow-lg transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-2.5 rounded-full bg-primary-orange text-sm text-white font-semibold shadow-orange hover:bg-primary-orange-hover transition-all"
                        >
                            {initialData ? 'Save' : 'Add'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
