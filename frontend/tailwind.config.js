/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'bikasafe': {
                    'blue': '#0F172A', // Deep Navy
                    'accent': '#3B82F6', // Brighter Blue
                    'green': '#10B981', // Emerald
                    'soft': '#F8FAFC', // Off-white
                },
                'brand': {
                    50: '#ecfdf5',
                    100: '#d1fae5',
                    200: '#a7f3d0',
                    300: '#6ee7b7',
                    400: '#34d399',
                    500: '#10b981',
                    600: '#059669',
                    700: '#047857',
                    800: '#065f46',
                    900: '#064e3b',
                    950: '#022c22',
                },
                dark: {
                    950: '#020817',
                    900: '#0a0f1e',
                    850: '#0d1424',
                    800: '#111827',
                    750: '#141d2e',
                    700: '#1a2540',
                    600: '#1e2d4a',
                    500: '#243356',
                    border: '#1e2d4a',
                    'border-light': '#243356',
                },
            },
            fontFamily: {
                sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
            },
            boxShadow: {
                'premium': '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02)',
                'glass': 'inset 0 0 0 1px rgba(255, 255, 255, 0.1)',
                'dark-card': '0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
                'dark-card-hover': '0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)',
                'glow-brand': '0 0 30px rgba(16,185,129,0.15)',
                'glow-brand-lg': '0 0 60px rgba(16,185,129,0.2)',
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-out',
                'slide-up': 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                'scale-in': 'scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                'pulse-soft': 'pulseSoft 3s ease-in-out infinite',
                'glow-pulse': 'glowPulse 3s ease-in-out infinite',
                'shimmer': 'shimmer 2.5s linear infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                scaleIn: {
                    '0%': { transform: 'scale(0.92)', opacity: '0' },
                    '100%': { transform: 'scale(1)', opacity: '1' },
                },
                pulseSoft: {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0.7' },
                },
                glowPulse: {
                    '0%, 100%': { boxShadow: '0 0 20px rgba(16,185,129,0.1)' },
                    '50%': { boxShadow: '0 0 40px rgba(16,185,129,0.25)' },
                },
                shimmer: {
                    '0%': { backgroundPosition: '-1000px 0' },
                    '100%': { backgroundPosition: '1000px 0' },
                },
            },
        },
    },
    plugins: [],
}
