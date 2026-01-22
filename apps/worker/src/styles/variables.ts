export const cssVariables = `
:root {
  /* Color Palette - Dark Theme */
  --color-bg-primary: #0d1117;
  --color-bg-secondary: #161b22;
  --color-bg-tertiary: #21262d;
  --color-bg-hover: #30363d;
  
  /* Text Colors */
  --color-text-primary: #f0f6fc;
  --color-text-secondary: #8b949e;
  --color-text-muted: #6e7681;
  --color-text-link: #58a6ff;
  
  /* Accent Colors */
  --color-accent-primary: #238636;
  --color-accent-warning: #d29922;
  --color-accent-danger: #f85149;
  --color-accent-info: #58a6ff;
  --color-accent-purple: #a371f7;
  
  /* Border */
  --color-border-primary: #30363d;
  --color-border-secondary: #21262d;
  
  /* Status Colors */
  --color-status-pending: #d29922;
  --color-status-in-progress: #58a6ff;
  --color-status-completed: #238636;
  --color-status-cancelled: #f85149;
  
  /* Spacing Scale */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
  
  /* Typography */
  --font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif;
  --font-mono: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  
  --font-size-xs: 12px;
  --font-size-sm: 14px;
  --font-size-md: 16px;
  --font-size-lg: 18px;
  --font-size-xl: 20px;
  --font-size-2xl: 24px;
  --font-size-3xl: 32px;
  
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
  
  --line-height-tight: 1.25;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.75;
  
  /* Border Radius */
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
  --radius-xl: 12px;
  --radius-full: 9999px;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.4);
  
  /* Transitions */
  --transition-fast: 150ms ease;
  --transition-normal: 250ms ease;
  --transition-slow: 350ms ease;
  
  /* Z-Index */
  --z-dropdown: 100;
  --z-modal: 200;
  --z-toast: 300;
}
`

export const cssReset = `
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  font-size: 16px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  font-family: var(--font-family);
  font-size: var(--font-size-md);
  line-height: var(--line-height-normal);
  color: var(--color-text-primary);
  background-color: var(--color-bg-primary);
  min-height: 100vh;
}

a {
  color: var(--color-text-link);
  text-decoration: none;
  transition: color var(--transition-fast);
}

a:hover {
  text-decoration: underline;
}

img, svg {
  display: block;
  max-width: 100%;
}

button, input, textarea, select {
  font: inherit;
}
`
