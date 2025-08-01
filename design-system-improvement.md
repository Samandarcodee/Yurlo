# 🎨 DESIGN SYSTEM YAXSHILANISH REJASI

## 🌈 YANGI COLOR PALETTE

### **1. Primary Brand Colors**

```css
/* Hozirgi: Mint/Water cheklangan palette */
/* Yangi: Professional gradient system */

:root {
  /* === PRIMARY BRAND === */
  --brand-primary: 142 71% 57%; /* Modern teal #22C55E */
  --brand-secondary: 205 100% 50%; /* Electric blue #0EA5E9 */
  --brand-accent: 280 100% 70%; /* Purple accent #C084FC */

  /* === SEMANTIC COLORS === */
  --success: 142 76% 47%; /* Success green */
  --warning: 38 92% 50%; /* Warning amber */
  --error: 0 84% 60%; /* Error red */
  --info: 217 91% 60%; /* Info blue */

  /* === NEUTRAL SYSTEM === */
  --neutral-50: 210 20% 98%;
  --neutral-100: 210 17% 95%;
  --neutral-200: 214 16% 89%;
  --neutral-300: 214 14% 78%;
  --neutral-400: 215 14% 64%;
  --neutral-500: 215 16% 47%;
  --neutral-600: 215 19% 35%;
  --neutral-700: 215 25% 27%;
  --neutral-800: 217 33% 17%;
  --neutral-900: 222 84% 5%;

  /* === FUNCTIONAL COLORS === */
  --calorie-low: 142 76% 47%; /* Under target */
  --calorie-normal: 38 92% 50%; /* Normal range */
  --calorie-high: 0 84% 60%; /* Over target */

  --water-empty: 214 16% 89%; /* No water */
  --water-low: 197 87% 75%; /* Low hydration */
  --water-good: 197 87% 60%; /* Good hydration */
  --water-full: 197 87% 45%; /* Fully hydrated */
}
```

### **2. Typography Scale**

```css
/* Hozirgi: Basic text sizing */
/* Yangi: Professional type scale */

:root {
  /* Font Families */
  --font-sans: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
  --font-display: "Cal Sans", "Inter", sans-serif;
  --font-mono: "JetBrains Mono", "Fira Code", monospace;

  /* Type Scale (Perfect Fourth - 1.333) */
  --text-xs: 0.75rem; /* 12px */
  --text-sm: 0.875rem; /* 14px */
  --text-base: 1rem; /* 16px */
  --text-lg: 1.125rem; /* 18px */
  --text-xl: 1.333rem; /* 21px */
  --text-2xl: 1.777rem; /* 28px */
  --text-3xl: 2.369rem; /* 38px */
  --text-4xl: 3.157rem; /* 50px */
  --text-5xl: 4.209rem; /* 67px */

  /* Line Heights */
  --leading-tight: 1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.75;
}
```

### **3. Advanced Spacing System**

```css
/* Yangi 8pt grid system */
:root {
  --space-0: 0;
  --space-1: 0.25rem; /* 4px */
  --space-2: 0.5rem; /* 8px */
  --space-3: 0.75rem; /* 12px */
  --space-4: 1rem; /* 16px */
  --space-5: 1.25rem; /* 20px */
  --space-6: 1.5rem; /* 24px */
  --space-8: 2rem; /* 32px */
  --space-10: 2.5rem; /* 40px */
  --space-12: 3rem; /* 48px */
  --space-16: 4rem; /* 64px */
  --space-20: 5rem; /* 80px */
  --space-24: 6rem; /* 96px */
}
```

## 🎭 GLASSMORPHISM 2.0

### **Enhanced Glass Effects**

```css
.glass-light {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(20px) saturate(1.5);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.glass-medium {
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(16px) saturate(1.8);
  border: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow:
    0 16px 40px rgba(0, 0, 0, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.glass-heavy {
  background: rgba(255, 255, 255, 0.35);
  backdrop-filter: blur(12px) saturate(2);
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow:
    0 24px 48px rgba(0, 0, 0, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.4);
}
```

## 📱 MOBILE-FIRST IMPROVEMENTS

### **Enhanced Touch Targets**

```css
/* Minimum 44px touch targets */
.touch-target {
  min-height: 44px;
  min-width: 44px;
  touch-action: manipulation;
}

/* Improved tap feedback */
.tap-feedback {
  transition: all 0.15s ease;
  transform-origin: center;
}

.tap-feedback:active {
  transform: scale(0.97);
  opacity: 0.8;
}
```

### **Advanced Loading States**

```css
@keyframes shimmer {
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: 200px 0;
  }
}

.skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200px 100%;
  animation: shimmer 1.5s infinite;
}
```
