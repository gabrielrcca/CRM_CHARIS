/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                charis: {
                    dark: '#0A0A0A',
                    darker: '#050505',
                    card: '#111111',
                    gold: '#C9A87C',
                    goldLight: '#E3C8A0',
                    gray: '#2A2A2A'
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                serif: ['Playfair Display', 'serif'],
            }
        },
    },
    plugins: [],
}
