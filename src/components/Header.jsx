import { Moon, Sun, Image, Eye, EyeOff } from 'lucide-react';

export function Header({
    theme,
    toggleTheme,
    onRefreshWallpaper,
    toggleWallpaperVisibility,
    isWallpaperVisible,
    username,
    onOpenSettings
}) {
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    return (
        <header className="px-5 pt-5 pb-3 lg:px-12 lg:pt-6 lg:pb-4">
            <div className="flex items-center justify-between max-w-7xl mx-auto">
                <div
                    className="flex items-center gap-2.5 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={onOpenSettings}
                    title="Open Settings"
                >
                    <div className="w-10 h-10 lg:w-9 lg:h-9 rounded-full gradient-orange flex items-center justify-center text-base shadow-sm">
                        👋
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs text-text-secondary">{getGreeting()},</span>
                        <span className="text-sm lg:text-base font-semibold text-text-primary">{username || 'User'}</span>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={toggleWallpaperVisibility}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 ${isWallpaperVisible ? 'bg-primary-orange text-white' : 'bg-bg-card text-text-primary'}`}
                        title={isWallpaperVisible ? "Hide Wallpaper" : "Show Wallpaper"}
                    >
                        {isWallpaperVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>

                    {isWallpaperVisible && (
                        <button
                            onClick={onRefreshWallpaper}
                            className="w-9 h-9 rounded-xl bg-bg-card flex items-center justify-center shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
                            title="Shuffle Wallpaper"
                        >
                            <Image className="w-4 h-4 text-text-primary" />
                        </button>
                    )}

                    <button
                        onClick={toggleTheme}
                        className="w-9 h-9 rounded-xl bg-bg-card flex items-center justify-center shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
                        title="Toggle Theme"
                    >
                        {theme === 'light' ? (
                            <Moon className="w-4 h-4 text-text-primary" />
                        ) : (
                            <Sun className="w-4 h-4 text-text-primary" />
                        )}
                    </button>
                </div>
            </div>
        </header>
    );
}
