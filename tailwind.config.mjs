/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}',
        './src/content/**/*.{yaml,yml,json}', // Include YAML files for color detection
    ],
    safelist: [
        // Button colors pattern - ensures all button color variations are included
        {
            pattern: /^bg-(blue|green|purple|pink|indigo|red|yellow|orange|teal|cyan|slate|gray)-(500|600|700)$/,
        },
        {
            pattern: /^hover:bg-(blue|green|purple|pink|indigo|red|yellow|orange|teal|cyan|slate|gray)-(500|600|700)$/,
        },
        {
            pattern: /^text-(blue|green|purple|pink|indigo|red|yellow|orange|teal|cyan|slate|gray)-(400|500|600)$/,
        },
        // Specific colors used in the application
        'bg-blue-600',
        'hover:bg-blue-700',
        'bg-green-600',
        'hover:bg-green-700',
        'bg-purple-600',
        'hover:bg-purple-700',
        'bg-pink-600',
        'hover:bg-pink-700',
        'bg-indigo-600',
        'hover:bg-indigo-700',
        'bg-red-600',
        'hover:bg-red-700',
        'bg-yellow-600',
        'hover:bg-yellow-700',
        'bg-orange-600',
        'hover:bg-orange-700',
        'bg-teal-600',
        'hover:bg-teal-700',
        'bg-cyan-600',
        'hover:bg-cyan-700',
        // Badge colors  
        'bg-blue-500',
        'bg-green-500',
        'bg-purple-500',
        'bg-red-500',
        'bg-yellow-500',
        'bg-orange-500',
        'bg-indigo-500',
        'bg-pink-500',
        'bg-green-400',
        'bg-blue-400',
        'bg-red-400',
        'bg-yellow-400',
        // Text colors for bullets
        'text-blue-400',
        'text-green-400',
        'text-purple-400',
        'text-red-400',
        'text-yellow-400',
        'text-orange-400',
        'text-indigo-400',
        'text-pink-400',
        'text-teal-400',
        'text-cyan-400',
    ],
    theme: {
        extend: {
            colors: {
                'custom-slate': '#0f172a',
            },
            fontFamily: {
                'roboto': ['Roboto', 'sans-serif'],
                'noto-sans': ['Noto Sans', 'sans-serif'],
                'noto': ['Noto Sans', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
