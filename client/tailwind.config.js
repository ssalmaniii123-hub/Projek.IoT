/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        background: "#09090b", // slate-950
        panel: "rgba(24, 24, 27, 0.6)", // slate-900 with opacity for glass
        panelSolid: "#18181b",
        borderDark: "rgba(255, 255, 255, 0.1)",
        borderLight: "rgba(255, 255, 255, 0.2)",
        
        // Neon Accents
        neonGreen: "#22c55e",
        neonCyan: "#06b6d4",
        neonPink: "#ec4899",
        neonPurple: "#a855f7",
        neonYellow: "#eab308"
      },
      boxShadow: {
        glowGreen: "0 0 15px rgba(34, 197, 94, 0.4)",
        glowCyan: "0 0 15px rgba(6, 182, 212, 0.4)",
        glowPink: "0 0 15px rgba(236, 72, 153, 0.4)",
        glowPurple: "0 0 15px rgba(168, 85, 247, 0.4)",
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.37)"
      },
      fontFamily: {
        display: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" }
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" }
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 15px rgba(34, 197, 94, 0.4)" },
          "50%": { boxShadow: "0 0 25px rgba(34, 197, 94, 0.7)" }
        }
      },
      animation: {
        fadeIn: "fadeIn 300ms ease-out",
        slideUp: "slideUp 400ms ease-out forwards",
        pulseGlow: "pulseGlow 2s infinite"
      }
    }
  },
  plugins: []
};
