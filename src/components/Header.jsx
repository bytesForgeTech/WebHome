import { Upload, Download, Moon, Sun } from 'lucide-react';

export function Header({ theme, toggleTheme, onImport, onExport, hasBookmarks }) {
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    return (
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
                        <input type="file" accept=".html" onChange={onImport} hidden />
                    </label>
                    <button
                        className="w-9 h-9 rounded-xl bg-bg-card flex items-center justify-center shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 disabled:opacity-50"
                        onClick={onExport}
                        disabled={!hasBookmarks}
                    >
                        <Download className="w-4 h-4 text-text-primary" />
                    </button>
                </div>
            </div>
        </header>
    );
}
