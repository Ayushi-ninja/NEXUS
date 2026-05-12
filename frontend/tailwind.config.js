/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#00d4ff',
        secondary: '#a855f7',
        accent: '#06d6a0',
        danger: '#ef4444',
        warning: '#fbbf24',
        background: '#030712',
        surface: '#0f172a',
        neon: {
          blue: '#00d4ff',
          purple: '#a855f7',
          green: '#06d6a0',
          pink: '#ec4899',
          orange: '#f59e0b',
          red: '#ef4444',
        },
        dark: {
          bg: '#030712',
          surface: '#0f172a',
          card: '#1e293b',
          border: '#1f2947',
          accent: '#1e293b',
        },
      },
      fontFamily: {
        headline: ['Space Grotesk', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        label: ['Space Grotesk', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'glass': 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
        'neon-gradient': 'linear-gradient(90deg, #00d4ff 0%, #a855f7 100%)',
        'grid-pattern': 'linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px)',
      },
      backgroundSize: {
        'grid': '30px 30px',
      },
      boxShadow: {
        'neon-blue': '0 0 15px rgba(0,212,255,0.3)',
        'neon-purple': '0 0 15px rgba(168,85,247,0.3)',
        'neon-green': '0 0 15px rgba(6,214,160,0.3)',
        'neon-red': '0 0 15px rgba(239,68,68,0.3)',
        'glass': '0 8px 32px 0 rgba(0,0,0,0.37)',
        'glass-lg': '0 16px 48px 0 rgba(0,0,0,0.5)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4,0,0.6,1) infinite',
        'glow-blue': 'glow-blue 2s ease-in-out infinite alternate',
        'glow-purple': 'glow-purple 2s ease-in-out infinite alternate',
        'glow-green': 'glow-green 2s ease-in-out infinite alternate',
        'glow-red': 'glow-red 2s ease-in-out infinite alternate',
        'scanline': 'scanline 8s linear infinite',
        'float': 'float 3s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
        'signal-green': 'signal-green 1s ease-in-out infinite',
        'signal-red': 'signal-red 1s ease-in-out infinite',
        'alert-pulse': 'alert-pulse 1s ease-in-out infinite',
      },
      keyframes: {
        'glow-blue': {
          '0%': { boxShadow: '0 0 5px rgba(0,212,255,0.2)' },
          '100%': { boxShadow: '0 0 25px rgba(0,212,255,0.5), 0 0 50px rgba(0,212,255,0.2)' },
        },
        'glow-purple': {
          '0%': { boxShadow: '0 0 5px rgba(168,85,247,0.2)' },
          '100%': { boxShadow: '0 0 25px rgba(168,85,247,0.5), 0 0 50px rgba(168,85,247,0.2)' },
        },
        'glow-green': {
          '0%': { boxShadow: '0 0 5px rgba(6,214,160,0.2)' },
          '100%': { boxShadow: '0 0 25px rgba(6,214,160,0.5), 0 0 50px rgba(6,214,160,0.2)' },
        },
        'glow-red': {
          '0%': { boxShadow: '0 0 5px rgba(239,68,68,0.2)' },
          '100%': { boxShadow: '0 0 25px rgba(239,68,68,0.5), 0 0 50px rgba(239,68,68,0.2)' },
        },
        'scanline': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'signal-green': {
          '0%, 100%': { boxShadow: '0 0 10px rgba(6,214,160,0.3)' },
          '50%': { boxShadow: '0 0 30px rgba(6,214,160,0.6), 0 0 60px rgba(6,214,160,0.3)' },
        },
        'signal-red': {
          '0%, 100%': { boxShadow: '0 0 10px rgba(239,68,68,0.3)' },
          '50%': { boxShadow: '0 0 30px rgba(239,68,68,0.6), 0 0 60px rgba(239,68,68,0.3)' },
        },
        'alert-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },
    },
  },
  plugins: [],
}
