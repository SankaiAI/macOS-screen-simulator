/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#2563EB',
                    light: '#3B82F6',
                    dark: '#1D4ED8',
                },
                accent: {
                    DEFAULT: '#F97316',
                    light: '#FB923C',
                    dark: '#EA580C',
                },
                dark: {
                    900: '#0A0A0A',
                    800: '#121212',
                    700: '#1A1A1A',
                    600: '#27272A',
                    500: '#3F3F46',
                },
            },
            fontFamily: {
                heading: ['Outfit', 'sans-serif'],
                body: ['Work Sans', 'sans-serif'],
            },
            animation: {
                'fade-in': 'fadeIn 0.3s ease-out',
                'slide-up': 'slideUp 0.4s ease-out',
                'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                pulseGlow: {
                    '0%, 100%': { boxShadow: '0 0 20px rgba(37, 99, 235, 0.3)' },
                    '50%': { boxShadow: '0 0 40px rgba(37, 99, 235, 0.6)' },
                },
            },
        },
    },
    plugins: [],
}
