import { useState } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import { searchEngines } from '../data/searchEngines';

export function SearchSection({
    searchTerm,
    setSearchTerm,
    activeFilter,
    setActiveFilter,
    folders,
    bookmarksCount,
    selectedEngineId,
    setSelectedEngineId
}) {
    const [showEngineDropdown, setShowEngineDropdown] = useState(false);
    const currentEngine = searchEngines.find(eng => eng.id === selectedEngineId);

    const handleWebSearch = (e) => {
        if (e.key === 'Enter' && searchTerm.trim()) {
            if (currentEngine) {
                window.open(currentEngine.url + encodeURIComponent(searchTerm), '_blank');
            }
        }
    };

    return (
        <div className="sticky top-0 z-50 gradient-warm pb-4 rounded-b-3xl mb-4 transition-all">
            <div className="px-5 pb-2 lg:px-12">
                <div className="flex flex-col lg:flex-row lg:items-center gap-3 max-w-7xl mx-auto">
                    {/* Search Box with Integrated Engine Selector */}
                    <div className="relative flex-1 w-full max-w-2xl">
                        <div className="relative w-full group">
                            <div className="absolute left-2 top-1/2 -translate-y-1/2 z-20">
                                <button
                                    className="flex items-center gap-1 pl-2 pr-1.5 py-1.5 rounded-full hover:bg-bg-input text-text-primary transition-all"
                                    onClick={() => setShowEngineDropdown(!showEngineDropdown)}
                                >
                                    <div className="w-5 h-5 flex items-center justify-center">{currentEngine?.icon}</div>
                                    <ChevronDown className="w-3.5 h-3.5 text-text-muted opacity-50" />
                                </button>

                                {showEngineDropdown && (
                                    <div className="absolute top-full mt-2 left-0 min-w-[180px] bg-bg-card rounded-xl shadow-float p-1.5 animate-in fade-in slide-in-from-top-2 duration-200 border border-gray-100/50">
                                        {searchEngines.map((engine) => (
                                            <button
                                                key={engine.id}
                                                className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-left text-sm transition-colors ${selectedEngineId === engine.id
                                                    ? 'bg-primary-orange-light text-primary-orange'
                                                    : 'hover:bg-bg-input text-text-primary'
                                                    }`}
                                                onClick={() => {
                                                    setSelectedEngineId(engine.id);
                                                    setShowEngineDropdown(false);
                                                }}
                                            >
                                                <div className="w-5 h-5 flex items-center justify-center">{engine.icon}</div>
                                                <span className="font-medium">{engine.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <input
                                type="text"
                                placeholder={`Search ${currentEngine?.name} or type a URL`}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={handleWebSearch}
                                className="w-full h-12 lg:h-14 pl-20 pr-6 rounded-full bg-bg-card text-base text-text-primary placeholder:text-text-muted shadow-card hover:shadow-float focus:outline-none focus:ring-2 focus:ring-primary-orange-light focus:shadow-float transition-all"
                            />
                        </div>
                    </div>

                    {/* Desktop Filter Tabs */}
                    <div className="hidden lg:flex gap-1.5 ml-auto">
                        <button
                            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${activeFilter === 'all'
                                ? 'bg-primary-orange text-white shadow-orange'
                                : 'bg-bg-card text-text-secondary shadow-sm hover:shadow-md'
                                }`}
                            onClick={() => setActiveFilter('all')}
                        >
                            All ({bookmarksCount})
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
        </div>
    );
}
