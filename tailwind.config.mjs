/** @type {import('tailwindcss').Config} */
const tailwindConfig = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    screens: {
      'xs': '320px',
        'sm': '375px',    
        'md': '425px',    
        'lg': '768px',   
        'xl': '1024px',   
        '2xl': '1440px',  
    },
    extend: {
      fontFamily:{
        sfRegular: ["SF Pro Display Regular", "serif"],
        sfMedium: ["SF Pro Display Medium", "serif"],
        sfBold: ["SF Pro Display Bold", "serif"]
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },
  plugins: [],
};

export default tailwindConfig;