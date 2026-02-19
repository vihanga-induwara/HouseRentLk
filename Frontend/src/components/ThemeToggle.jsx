import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle = () => {
    const { isDarkMode, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            aria-label={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            style={{ transition: 'background 0.3s, border-color 0.3s' }}
            className={`
                relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold
                border transition-all duration-300 select-none
                ${isDarkMode
                    ? 'bg-slate-800 border-slate-600 text-amber-300 hover:bg-slate-700'
                    : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
                }
                active:scale-95
            `}
        >
            <span
                style={{
                    display: 'inline-flex',
                    transform: isDarkMode ? 'rotate(0deg)' : 'rotate(180deg)',
                    transition: 'transform 0.5s ease',
                }}
            >
                {isDarkMode ? (
                    <Sun className="h-4 w-4 text-amber-300" />
                ) : (
                    <Moon className="h-4 w-4 text-slate-500" />
                )}
            </span>
            <span>{isDarkMode ? 'Light' : 'Dark'}</span>
        </button>
    );
};

export default ThemeToggle;
