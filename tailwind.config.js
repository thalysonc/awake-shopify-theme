module.exports = {
	content: ["./**/*.liquid", "./assets/*.js", "./src/*.js"],
	theme: {
		extend: {
			container: {
				center: true,
			},
			fontFamily: {
				primary: ["Jost", "Helvetica", "Arial", "sans-serif"],
				secondary: ["Jost", "Helvetica", "Arial", "sans-serif"],
				heading: ["Jost", "Helvetica", "Arial", "sans-serif"],
				body: ["Jost", "Helvetica", "Arial", "sans-serif"],
			},
			colors: {
				primary: {
					100: "#DBDBDB",
					200: "#A7A5A6",
					300: "#7B7979",
					400: "#4F4C4D",
					500: "#231F20",
					600: "#231F20",
				},
				onPrimary: {
					100: "#231F20",
					200: "#231F20",
					300: "#ffffff",
					400: "#ffffff",
					500: "#ffffff",
					600: "#ffffff",
				},
				secondary: {
					200: "#F9F3F2",
					300: "#F3EBEB",
					400: "#DCCACB",
					500: "#BBA2AA",
					600: "#9B757C",
					700: "#835C63",
				},
				onSecondary: {
					200: "#231F20",
					300: "#231F20",
					400: "#231F20",
					500: "#231F20",
					600: "#ffffff",
					700: "#ffffff",
				},
				tertiary: {
					400: "#FBF9F6",
					500: "#FBF9F6",
					600: "#FBF9F6",
				},
				onTertiary: {
					400: "#231F20",
					500: "#231F20",
					600: "#231F20",
				},
				accent: {
					400: "#231F20",
					500: "#231F20",
					600: "#231F20",
				},
				onAccent: {
					400: "#FFFFFF",
					500: "#FFFFFF",
					600: "#FFFFFF",
				},
				alert: {
					success: "#16A24A",
					error: "#DC2626",
					warning: "#E9580C",
					highlight: "#2563EA",
				},
				onAlert: {
					success: "#dcfbe8",
					error: "#dcfbe8",
					warning: "#dcfbe8",
					highlight: "#dcfbe8",
				},
				base: {
					background: "#FFFFFF",
					surface: "#FFFFFF",
					border: "#DBDBDB",
				},
				onBase: {
					background: "#231F20",
					surface: "#231F20",
				},
				neutral: {
					dark: "#231F20",
					light: "#FFFFFF",
				},
				onNeutral: {
					dark: "#FFFFFF",
					light: "#231F20",
				},
			},
			screens: {
				largemobile: "640px",
				tablet: "768px",
				laptop: "1024px",
				desktop: "1280px",
				wide: "1536px",
			},
		},
	},
	plugins: [require("@tailwindcss/typography"), require("@tailwindcss/forms")],
};
