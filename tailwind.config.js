/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#DC1E3D",
        background: "#0B0B0D",
        surface: "#17171A",
        muted: "#8C8C91",
        brand: {
          bg: "#000000",
          body: "#F5F5F4",
          surface: "#151517",
          "surface-border": "#2A2A2E",
          "text-primary": "#FFFFFF",
          "text-secondary": "#A6A6AA",
          "text-muted": "#5A5A5F",
          red: "#DC1E3D",
          "red-dim": "#8F1428",     // for pressed states / subtle accents
          "red-glow": "#FF3B5C",    // brighter variant, good for highlights/animations
          success: "#3DDC84",       // kept for status colors — swap if you don't need green anywhere
        },
      },
    },
  },
  plugins: [],
}