import { ChevronRight, Bookmark } from 'lucide-react';

export function RecentBookmarks({ recentBookmarks }) {
    const getDomain = (url) => {
        try {
            return new URL(url).hostname.replace('www.', '');
        } catch {
            return url;
        }
    };

    if (recentBookmarks.length === 0) return null;

    return (
        <div className="lg:sticky lg:top-28 lg:self-start bg-bg-card p-4 rounded-2xl shadow-card">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-text-primary">Recent</h3>
                <span className="text-xs text-text-muted cursor-pointer hover:text-primary-orange transition-colors">
                    See All
                </span>
            </div>
            <div className="space-y-1.5">
                {recentBookmarks.map((bookmark) => (
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
    );
}
