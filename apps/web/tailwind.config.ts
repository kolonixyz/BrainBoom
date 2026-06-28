import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: "#eff6ff",
                    100: "#dbeafe",
                    500: "#3b82f6",
                    600: "#2563eb",
                    700: "#1d4ed8",
                    900: "#1e3a8a",
                },
                secondary: {
                    100: "#f3f4f6",
                    200: "#e5e7eb",
                    500: "#6b7280",
                    800: "#1f2937",
                    900: "#111827",
                },
            },
            fontFamily: {
                sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
            },
            animation: {
                "shake": "shake 0.5s cubic-bezier(0.36,0.07,0.19,0.97) both",
                "bounce-in": "bounceIn 0.5s ease-out both",
                "fade-in": "fadeIn 0.3s ease-out both",
                "slide-up": "slideUp 0.3s ease-out both",
            },
            keyframes: {
                shake: {
                    "10%, 90%": { transform: "translate3d(-2px, 0, 0)" },
                    "20%, 80%": { transform: "translate3d(4px, 0, 0)" },
                    "30%, 50%, 70%": { transform: "translate3d(-8px, 0, 0)" },
                    "40%, 60%": { transform: "translate3d(8px, 0, 0)" },
                },
                bounceIn: {
                    "0%": { transform: "scale(0.5)", opacity: "0" },
                    "60%": { transform: "scale(1.1)" },
                    "100%": { transform: "scale(1)", opacity: "1" },
                },
                fadeIn: {
                    "0%": { opacity: "0" },
                    "100%": { opacity: "1" },
                },
                slideUp: {
                    "0%": { transform: "translateY(20px)", opacity: "0" },
                    "100%": { transform: "translateY(0)", opacity: "1" },
                },
            },
        },
    },
    plugins: [],
};

export default config;
