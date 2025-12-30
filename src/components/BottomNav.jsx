import { Home, Calendar, Plus, Layers, User } from 'lucide-react';

export function BottomNav({ onAdd }) {
    return (
        <nav className="fixed bottom-0 left-0 right-0 lg:bottom-auto lg:top-1/2 lg:left-4 lg:right-auto lg:-translate-y-1/2 flex lg:flex-col items-center justify-around lg:justify-center gap-1 px-6 py-3 lg:py-4 lg:px-2 bg-bg-card rounded-t-2xl lg:rounded-2xl shadow-float z-50">
            <button className="p-2.5 text-primary-orange">
                <Home className="w-5 h-5" fill="currentColor" />
            </button>
            <button className="p-2.5 text-text-muted hover:text-primary-orange transition-colors">
                <Calendar className="w-5 h-5" />
            </button>
            <button
                onClick={onAdd}
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
    );
}
