/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./App.tsx", "./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        // These strings MUST match the exact name you used when loading the font in Expo
        'jakarta-black':     ['PlusJakartaSans-ExtraBold'],
        'jakarta-extrabold': ['PlusJakartaSans-ExtraBold'],
        'jakarta-bold':      ['PlusJakartaSans-Bold'],
        'jakarta-semibold':  ['PlusJakartaSans-SemiBold'],
        'jakarta-medium':    ['PlusJakartaSans-Medium'],
        'jakarta-regular':   ['PlusJakartaSans-Regular'],
      },
    },
  },
  plugins: [],
}
