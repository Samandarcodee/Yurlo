import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // === ENHANCED COLOR SYSTEM ===
        // Brand colors with improved accessibility
        brand: {
          50: "rgb(240 253 250)",
          100: "rgb(204 251 241)", 
          200: "rgb(167 243 208)",
          300: "rgb(110 231 183)",
          400: "rgb(52 211 153)",
          500: "rgb(34 197 94)",   // Primary brand
          600: "rgb(22 163 74)",
          700: "rgb(21 128 61)",
          800: "rgb(22 101 52)",
          900: "rgb(20 83 45)",
        },
        
        // Semantic color system
        success: {
          50: "rgb(240 253 244)",
          100: "rgb(220 252 231)",
          200: "rgb(187 247 208)", 
          300: "rgb(134 239 172)",
          400: "rgb(74 222 128)",
          500: "rgb(34 197 94)",
          600: "rgb(22 163 74)",
          700: "rgb(21 128 61)",
          800: "rgb(22 101 52)",
          900: "rgb(20 83 45)",
        },
        
        warning: {
          50: "rgb(255 251 235)",
          100: "rgb(254 243 199)",
          200: "rgb(253 230 138)",
          300: "rgb(252 211 77)",
          400: "rgb(251 191 36)",
          500: "rgb(245 158 11)",
          600: "rgb(217 119 6)",
          700: "rgb(180 83 9)",
          800: "rgb(146 64 14)",
          900: "rgb(120 53 15)",
        },
        
        // Enhanced health tracking colors
        health: {
          50: "rgb(240 253 244)",
          100: "rgb(220 252 231)",
          200: "rgb(187 247 208)",
          300: "rgb(134 239 172)",
          400: "rgb(74 222 128)",
          500: "rgb(34 197 94)",
          600: "rgb(22 163 74)",
          700: "rgb(21 128 61)",
          800: "rgb(22 101 52)",
          900: "rgb(20 83 45)",
        },
        
        // Improved mint palette
        mint: {
          50: "rgb(240 253 250)",
          100: "rgb(204 251 241)",
          200: "rgb(167 243 208)",
          300: "rgb(110 231 183)",
          400: "rgb(52 211 153)",
          500: "rgb(16 185 129)",
          600: "rgb(5 150 105)",
          700: "rgb(4 120 87)",
          800: "rgb(6 95 70)",
          900: "rgb(6 78 59)",
        },
        
        // Enhanced water tracking colors
        water: {
          50: "rgb(240 251 255)",
          100: "rgb(224 242 254)",
          200: "rgb(186 230 253)",
          300: "rgb(125 211 252)",
          400: "rgb(56 189 248)",
          500: "rgb(14 165 233)",
          600: "rgb(2 132 199)",
          700: "rgb(3 105 161)",
          800: "rgb(7 89 133)",
          900: "rgb(12 74 110)",
        },
        
        // Calorie tracking semantic colors
        calorie: {
          low: "rgb(34 197 94)",     // Under target - good
          normal: "rgb(245 158 11)", // Normal range - warning
          high: "rgb(239 68 68)",    // Over target - danger
          excellent: "rgb(16 185 129)", // Perfect range
        },
        
        // Activity & fitness colors
        activity: {
          50: "rgb(255 247 237)",
          100: "rgb(255 237 213)",
          200: "rgb(254 215 170)",
          300: "rgb(253 186 116)",
          400: "rgb(251 146 60)",
          500: "rgb(249 115 22)",
          600: "rgb(234 88 12)",
          700: "rgb(194 65 12)",
          800: "rgb(154 52 18)",
          900: "rgb(124 45 18)",
        },

        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        xs: "0.125rem",   // 2px
        sm: "0.25rem",    // 4px  
        md: "0.375rem",   // 6px
        lg: "0.5rem",     // 8px
        xl: "0.75rem",    // 12px
        "2xl": "1rem",    // 16px
        "3xl": "1.5rem",  // 24px
        full: "9999px",
      },
      
      spacing: {
        '18': '4.5rem',   // 72px
        '88': '22rem',    // 352px
        '128': '32rem',   // 512px
      },
      
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
        '8xl': ['6rem', { lineHeight: '1' }],
        '9xl': ['8rem', { lineHeight: '1' }],
      },
      
      boxShadow: {
        'glass': '0 8px 32px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
        'glass-lg': '0 16px 40px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
        'glass-xl': '0 24px 48px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
        'premium': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'float': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      },
      keyframes: {
        // === EXISTING ANIMATIONS ===
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        
        // === ADVANCED ANIMATIONS ===
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        
        "fade-in-down": {
          "0%": { opacity: "0", transform: "translateY(-20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.9)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        
        "slide-in-right": {
          "0%": { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        
        "bounce-subtle": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-4px)" },
        },
        
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 5px rgba(34, 197, 94, 0.3)" },
          "50%": { boxShadow: "0 0 20px rgba(34, 197, 94, 0.6)" },
        },
        
        "shimmer": {
          "0%": { backgroundPosition: "-200px 0" },
          "100%": { backgroundPosition: "200px 0" },
        },
        
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        
        "wiggle": {
          "0%, 100%": { transform: "rotate(0deg)" },
          "25%": { transform: "rotate(1deg)" },
          "75%": { transform: "rotate(-1deg)" },
        },
        
        "heart-beat": {
          "0%, 100%": { transform: "scale(1)" },
          "25%, 75%": { transform: "scale(1.1)" },
          "50%": { transform: "scale(1.05)" },
        },
        
        "progress-bar": {
          "0%": { width: "0%" },
          "100%": { width: "100%" },
        },
        
        "slide-up": {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },
        
        "zoom-in": {
          "0%": { transform: "scale(0.5)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        
        "rubber-band": {
          "0%": { transform: "scale(1)" },
          "30%": { transform: "scale(1.25, 0.75)" },
          "40%": { transform: "scale(0.75, 1.25)" },
          "50%": { transform: "scale(1.15, 0.85)" },
          "65%": { transform: "scale(0.95, 1.05)" },
          "75%": { transform: "scale(1.05, 0.95)" },
          "100%": { transform: "scale(1)" },
        },
      },
      
      animation: {
        // === EXISTING ===
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        
        // === MICRO-INTERACTIONS ===
        "fade-in": "fade-in 0.5s ease-out",
        "fade-in-up": "fade-in-up 0.6s ease-out",
        "fade-in-down": "fade-in-down 0.6s ease-out",
        "scale-in": "scale-in 0.4s ease-out",
        "slide-in-right": "slide-in-right 0.5s ease-out",
        "bounce-subtle": "bounce-subtle 2s infinite",
        "pulse-glow": "pulse-glow 2s infinite",
        "shimmer": "shimmer 1.5s infinite",
        "float": "float 3s ease-in-out infinite",
        "wiggle": "wiggle 0.5s ease-in-out",
        "heart-beat": "heart-beat 1s ease-in-out infinite",
        "progress-bar": "progress-bar 1s ease-out",
        "slide-up": "slide-up 0.4s ease-out",
        "zoom-in": "zoom-in 0.3s ease-out",
        "rubber-band": "rubber-band 1s ease-out",
        
        // === LOADING STATES ===
        "spin-slow": "spin 2s linear infinite",
        "ping-slow": "ping 3s cubic-bezier(0, 0, 0.2, 1) infinite",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
