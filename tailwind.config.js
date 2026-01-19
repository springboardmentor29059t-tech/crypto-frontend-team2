/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            colors: {
                primary: "#10b981", // Emerald-500
                "primary-glow": "#34d399", // Emerald-400
                "primary-dark": "#059669", // Emerald-600
                secondary: "#64748b", // Slate-500
                dark: "#0f172a", // Slate-900
                darker: "#020617", // Slate-950
                card: "#1e293b", // Slate-800
                "card-hover": "#334155", // Slate-700
                gold: {
                    400: "#fbbf24", // Amber-400
                    500: "#f59e0b", // Amber-500
                    600: "#d97706", // Amber-600
                },
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-out',
                'slide-up': 'slideUp 0.5s ease-out',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                }
            }
        },
    },
    plugins: [],
}
