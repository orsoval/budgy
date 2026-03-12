import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark' | 'system';

function getSystemTheme(): 'light' | 'dark' {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme: Theme) {
    const resolved = theme === 'system' ? getSystemTheme() : theme;
    document.documentElement.classList.toggle('dark', resolved === 'dark');
}

export function useTheme() {
    const [theme, setThemeState] = useState<Theme>(() => {
        const stored = localStorage.getItem('budgy-theme') as Theme | null;
        return stored || 'system';
    });

    useEffect(() => {
        applyTheme(theme);
        localStorage.setItem('budgy-theme', theme);
    }, [theme]);

    // Listen for system theme changes when in 'system' mode
    useEffect(() => {
        if (theme !== 'system') return;
        const media = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = () => applyTheme('system');
        media.addEventListener('change', handler);
        return () => media.removeEventListener('change', handler);
    }, [theme]);

    const setTheme = (t: Theme) => setThemeState(t);

    return { theme, setTheme };
}
