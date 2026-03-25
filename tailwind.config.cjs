const withOpacity = (rgbVar, alphaVar) =>
  ({ opacityValue } = {}) => {
    if (opacityValue !== undefined) {
      if (alphaVar) {
        return `rgba(var(${rgbVar}), calc(${opacityValue} * var(${alphaVar})))`;
      }

      return `rgba(var(${rgbVar}), ${opacityValue})`;
    }

    if (alphaVar) {
      return `rgba(var(${rgbVar}), var(${alphaVar}))`;
    }

    return `rgba(var(${rgbVar}), 1)`;
  };

module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      boxShadow: {
        panel: "var(--shadow-panel)",
        "panel-strong": "var(--shadow-panel-strong)",
        soft: "var(--shadow-soft)",
      },
      colors: {
        accent: withOpacity("--accent-rgb", "--accent-alpha"),
        "accent-foreground": withOpacity("--accent-foreground-rgb", "--accent-foreground-alpha"),
        background: withOpacity("--background-rgb", "--background-alpha"),
        border: withOpacity("--border-rgb", "--border-alpha"),
        canvas: withOpacity("--canvas-rgb", "--canvas-alpha"),
        card: withOpacity("--card-rgb", "--card-alpha"),
        "card-foreground": withOpacity("--card-foreground-rgb", "--card-foreground-alpha"),
        chart: withOpacity("--chart-rgb", "--chart-alpha"),
        "chart-axis": withOpacity("--chart-axis-rgb", "--chart-axis-alpha"),
        "chart-border": withOpacity("--chart-border-rgb", "--chart-border-alpha"),
        "chart-crosshair": withOpacity("--chart-crosshair-rgb", "--chart-crosshair-alpha"),
        "chart-event": withOpacity("--chart-event-rgb", "--chart-event-alpha"),
        "chart-grid": withOpacity("--chart-grid-rgb", "--chart-grid-alpha"),
        "chart-lane": withOpacity("--chart-lane-rgb", "--chart-lane-alpha"),
        "chart-lane-alt": withOpacity("--chart-lane-alt-rgb", "--chart-lane-alt-alpha"),
        "chart-surface": withOpacity("--chart-surface-rgb", "--chart-surface-alpha"),
        destructive: withOpacity("--destructive-rgb", "--destructive-alpha"),
        foreground: withOpacity("--foreground-rgb", "--foreground-alpha"),
        highlight: withOpacity("--highlight-rgb", "--highlight-alpha"),
        "highlight-muted": withOpacity("--highlight-muted-rgb", "--highlight-muted-alpha"),
        input: withOpacity("--input-rgb", "--input-alpha"),
        muted: withOpacity("--muted-rgb", "--muted-alpha"),
        "muted-foreground": withOpacity("--muted-foreground-rgb", "--muted-foreground-alpha"),
        overlay: withOpacity("--overlay-rgb", "--overlay-alpha"),
        panel: withOpacity("--panel-rgb", "--panel-alpha"),
        "panel-muted": withOpacity("--panel-muted-rgb", "--panel-muted-alpha"),
        "panel-strong": withOpacity("--panel-strong-rgb", "--panel-strong-alpha"),
        "panel-subtle": withOpacity("--panel-subtle-rgb", "--panel-subtle-alpha"),
        primary: withOpacity("--primary-rgb", "--primary-alpha"),
        "primary-foreground": withOpacity("--primary-foreground-rgb", "--primary-foreground-alpha"),
        ring: withOpacity("--ring-rgb", "--ring-alpha"),
        secondary: withOpacity("--secondary-rgb", "--secondary-alpha"),
        "secondary-foreground": withOpacity("--secondary-foreground-rgb", "--secondary-foreground-alpha"),
        shell: withOpacity("--shell-rgb", "--shell-alpha"),
        "status-error-border": withOpacity("--status-error-border-rgb", "--status-error-border-alpha"),
        "status-error-foreground": withOpacity("--status-error-foreground-rgb", "--status-error-foreground-alpha"),
        "status-error-surface": withOpacity("--status-error-surface-rgb", "--status-error-surface-alpha"),
        "status-info-border": withOpacity("--status-info-border-rgb", "--status-info-border-alpha"),
        "status-info-foreground": withOpacity("--status-info-foreground-rgb", "--status-info-foreground-alpha"),
        "status-info-surface": withOpacity("--status-info-surface-rgb", "--status-info-surface-alpha"),
        "status-success-border": withOpacity("--status-success-border-rgb", "--status-success-border-alpha"),
        "status-success-foreground": withOpacity("--status-success-foreground-rgb", "--status-success-foreground-alpha"),
        "status-success-surface": withOpacity("--status-success-surface-rgb", "--status-success-surface-alpha"),
        "status-warning-border": withOpacity("--status-warning-border-rgb", "--status-warning-border-alpha"),
        "status-warning-foreground": withOpacity("--status-warning-foreground-rgb", "--status-warning-foreground-alpha"),
        "status-warning-surface": withOpacity("--status-warning-surface-rgb", "--status-warning-surface-alpha"),
      },
      fontFamily: {
        display: ["var(--font-display)"],
        mono: ["var(--font-mono)"],
        sans: ["var(--font-sans)"],
      },
    },
  },
  plugins: [],
};
